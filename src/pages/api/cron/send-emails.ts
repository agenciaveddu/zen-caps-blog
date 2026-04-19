export const prerender = false

import type { APIRoute } from 'astro'
import nodemailer from 'nodemailer'
import { supabase } from '../../../lib/supabase'
import { injectComplianceFooter, unsubscribeHeaders } from '../../../lib/email-compliance'

// ── Config ──
const BATCH_SIZE = 20            // Emails por execução (evita timeout 10s do Vercel)
const MAX_TENTATIVAS = 3         // Tentativas antes de marcar como falha permanente

const SMTP_HOST = import.meta.env.SES_SMTP_HOST || 'email-smtp.sa-east-1.amazonaws.com'
const SMTP_PORT = Number(import.meta.env.SES_SMTP_PORT || 587)
const SMTP_USER = import.meta.env.SES_SMTP_USER
const SMTP_PASS = import.meta.env.SES_SMTP_PASS
const FROM_EMAIL = import.meta.env.SES_FROM_EMAIL || 'contato@zencaps.com.br'
const FROM_NAME = import.meta.env.SES_FROM_NAME || 'Zen Caps'
const MAIL_FROM = `${FROM_NAME} <${FROM_EMAIL}>`
const SES_CONFIG_SET = import.meta.env.SES_CONFIGURATION_SET || 'zencaps-tracking'

// ── Auth: Vercel Cron envia header com CRON_SECRET ──
function isAuthorized(request: Request): boolean {
  const auth = request.headers.get('authorization') || ''
  const expected = `Bearer ${import.meta.env.CRON_SECRET}`
  return auth === expected
}

export const GET: APIRoute = async ({ request }) => {
  // Vercel Cron usa GET por padrão
  return await processQueue(request)
}

export const POST: APIRoute = async ({ request }) => {
  return await processQueue(request)
}

async function processQueue(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!SMTP_USER || !SMTP_PASS) {
    return new Response(JSON.stringify({ error: 'SMTP credentials missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 1. Busca emails pendentes prontos para envio ──
  const { data: pending, error: fetchErr } = await supabase
    .from('email_queue')
    .select(`
      id, lead_id, sequence_id, tentativas,
      lead:leads ( id, email, nome, ativo ),
      sequence:email_sequences ( id, nome, ordem, assunto, corpo_html, ativo )
    `)
    .eq('status', 'pendente')
    .lte('agendado_para', new Date().toISOString())
    .lt('tentativas', MAX_TENTATIVAS)
    .order('agendado_para', { ascending: true })
    .limit(BATCH_SIZE)

  if (fetchErr) {
    console.error('[cron/send-emails] Fetch error:', fetchErr)
    return new Response(JSON.stringify({ error: 'Fetch failed', details: fetchErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!pending || pending.length === 0) {
    return new Response(JSON.stringify({ ok: true, processed: 0, message: 'No pending emails' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 2. Configura transporter SMTP (SES) ──
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  // ── 3. Processa cada email ──
  const results = { sent: 0, failed: 0, skipped: 0 }

  for (const item of pending as any[]) {
    const lead = item.lead
    const seq = item.sequence
    const queueId = item.id

    // Pula se lead inativo, sequência inativa ou dados faltando
    if (!lead || !seq || !lead.ativo || !seq.ativo) {
      await supabase
        .from('email_queue')
        .update({ status: 'cancelado' })
        .eq('id', queueId)
      results.skipped++
      continue
    }

    // Personaliza HTML com nome (se existir)
    const nome = (lead.nome || '').trim().split(' ')[0] || ''
    let html = nome
      ? seq.corpo_html.replace(/Olá!/g, `Olá, ${nome}!`).replace(/Você não está sozinho/g, `${nome}, você não está sozinho`)
      : seq.corpo_html
    html = injectComplianceFooter(html, lead.email)

    try {
      await transporter.sendMail({
        from: MAIL_FROM,
        to: lead.email,
        subject: seq.assunto,
        html,
        headers: {
          ...unsubscribeHeaders(lead.email),
          'X-SES-CONFIGURATION-SET': SES_CONFIG_SET,
          'X-SES-MESSAGE-TAGS': `campaign=quiz-welcome,quiz=${(seq.nome || '').replace('boas-vindas-', '')}`,
        },
      })

      // Sucesso: marca como enviado + log
      await Promise.all([
        supabase
          .from('email_queue')
          .update({ status: 'enviado' })
          .eq('id', queueId),
        supabase.from('email_logs').insert({
          lead_id: lead.id,
          queue_id: queueId,
          email: lead.email,
          assunto: seq.assunto,
          status: 'enviado',
        }),
      ])
      results.sent++

      // ── Auto-enfileira próxima sequência (follow-up automation) ──
      // Busca próxima sequência com mesmo nome e ordem maior
      try {
        const { data: nextSeq } = await supabase
          .from('email_sequences')
          .select('id, delay_horas')
          .eq('nome', seq.nome)
          .gt('ordem', seq.ordem || 0)
          .eq('ativo', true)
          .order('ordem', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (nextSeq) {
          const delayMs = (nextSeq.delay_horas || 0) * 3600 * 1000
          const scheduledFor = new Date(Date.now() + delayMs).toISOString()

          // Verifica se essa sequência já não foi enfileirada pra esse lead
          const { data: alreadyQueued } = await supabase
            .from('email_queue')
            .select('id')
            .eq('lead_id', lead.id)
            .eq('sequence_id', nextSeq.id)
            .maybeSingle()

          if (!alreadyQueued) {
            await supabase.from('email_queue').insert({
              lead_id: lead.id,
              sequence_id: nextSeq.id,
              status: 'pendente',
              agendado_para: scheduledFor,
            })
          }
        }
      } catch (followupErr) {
        // Não bloqueia o fluxo se falhar — só loga
        console.error('[cron/send-emails] Follow-up enqueue error:', followupErr)
      }
    } catch (err: any) {
      const errMsg = (err?.message || 'unknown').toString().slice(0, 200)
      console.error(`[cron/send-emails] Send failed for ${lead.email}:`, errMsg, err?.code, err?.responseCode)
      const newTentativas = (item.tentativas || 0) + 1
      const isPermanent = newTentativas >= MAX_TENTATIVAS
      const statusLabel = isPermanent
        ? `falha-permanente: ${errMsg}`
        : `falha-tentativa-${newTentativas}: ${errMsg}`

      await Promise.all([
        supabase
          .from('email_queue')
          .update({
            status: isPermanent ? 'falha' : 'pendente',
            tentativas: newTentativas,
            agendado_para: isPermanent
              ? new Date().toISOString()
              : new Date(Date.now() + 30 * 60 * 1000).toISOString(), // retry em 30min
          })
          .eq('id', queueId),
        supabase.from('email_logs').insert({
          lead_id: lead.id,
          queue_id: queueId,
          email: lead.email,
          assunto: seq.assunto,
          status: statusLabel.slice(0, 250),
        }),
      ])
      results.failed++
    }
  }

  return new Response(
    JSON.stringify({ ok: true, processed: pending.length, ...results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
