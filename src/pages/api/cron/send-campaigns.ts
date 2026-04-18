export const prerender = false

import type { APIRoute } from 'astro'
import nodemailer from 'nodemailer'
import { supabaseAdmin as supabase } from '../../../lib/supabase-admin'

// ── Config ──
const BATCH_SIZE = 20            // Emails por execução (limite 10s Vercel)
const MAX_TENTATIVAS = 3

const SMTP_HOST = import.meta.env.SES_SMTP_HOST || 'email-smtp.us-west-2.amazonaws.com'
const SMTP_PORT = Number(import.meta.env.SES_SMTP_PORT || 587)
const SMTP_USER = import.meta.env.SES_SMTP_USER
const SMTP_PASS = import.meta.env.SES_SMTP_PASS
const FROM_EMAIL = import.meta.env.SES_FROM_EMAIL || 'marketing@zencaps.com.br'
const FROM_NAME = import.meta.env.SES_FROM_NAME || 'Zen Caps'
const MAIL_FROM = `${FROM_NAME} <${FROM_EMAIL}>`

function isAuthorized(request: Request): boolean {
  const auth = request.headers.get('authorization') || ''
  const expected = `Bearer ${import.meta.env.CRON_SECRET}`
  return auth === expected
}

// Substitui placeholders {{nome}}, {{first_name}} no template
function personalize(template: string, contact: any): string {
  const firstName = (contact.name || '').trim().split(' ')[0] || ''
  return template
    .replace(/\{\{nome\}\}/g, contact.name || '')
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{email\}\}/g, contact.email || '')
}

export const GET: APIRoute = async ({ request }) => processQueue(request)
export const POST: APIRoute = async ({ request }) => processQueue(request)

async function processQueue(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!SMTP_USER || !SMTP_PASS) {
    return new Response(JSON.stringify({ error: 'SMTP credentials missing' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 1. Busca campanhas rodando (type email ou both) ──
  const { data: campaigns, error: campErr } = await supabase
    .from('campaigns')
    .select('id, name, type, status, email_subject, email_body, segment_filter, sent_count, total_contacts')
    .in('status', ['running', 'scheduled'])
    .in('type', ['email', 'both'])
    .or('scheduled_at.is.null,scheduled_at.lte.' + new Date().toISOString())

  if (campErr) {
    console.error('[cron/send-campaigns] Fetch campaigns error:', campErr)
    return new Response(JSON.stringify({ error: 'Fetch campaigns failed', details: campErr.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!campaigns || campaigns.length === 0) {
    return new Response(JSON.stringify({ ok: true, campaigns: 0, message: 'No running campaigns' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Transporter SMTP (SES)
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  const results: any = { campaigns: [], total_sent: 0, total_failed: 0, total_skipped: 0 }

  // ── 2. Processa cada campanha ──
  for (const camp of campaigns) {
    const campResult: any = { id: camp.id, name: camp.name, sent: 0, failed: 0, skipped: 0 }

    if (!camp.email_subject || !camp.email_body) {
      campResult.skipped_reason = 'email_subject ou email_body vazio'
      results.campaigns.push(campResult)
      continue
    }

    // Busca pending campaign_contacts
    const { data: pending, error: pendErr } = await supabase
      .from('campaign_contacts')
      .select(`
        id, status,
        contact:contacts ( id, name, email, email_opted_in )
      `)
      .eq('campaign_id', camp.id)
      .eq('status', 'pending')
      .limit(BATCH_SIZE)

    if (pendErr) {
      campResult.error = pendErr.message
      results.campaigns.push(campResult)
      continue
    }

    if (!pending || pending.length === 0) {
      campResult.skipped_reason = 'No pending contacts'
      results.campaigns.push(campResult)
      continue
    }

    for (const item of pending as any[]) {
      const contact = item.contact
      const ccId = item.id

      if (!contact || !contact.email || !contact.email_opted_in) {
        await supabase
          .from('campaign_contacts')
          .update({ status: 'skipped' })
          .eq('id', ccId)
        campResult.skipped++
        results.total_skipped++
        continue
      }

      const subject = personalize(camp.email_subject, contact)
      const html = personalize(camp.email_body, contact)

      try {
        await transporter.sendMail({
          from: MAIL_FROM,
          to: contact.email,
          subject,
          html,
        })

        await Promise.all([
          supabase
            .from('campaign_contacts')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', ccId),
          supabase.from('email_logs').insert({
            email: contact.email,
            assunto: subject,
            status: 'enviado',
          }),
        ])
        campResult.sent++
        results.total_sent++
      } catch (err: any) {
        const errMsg = (err?.message || 'unknown').toString().slice(0, 200)
        console.error(`[cron/send-campaigns] Send failed for ${contact.email}:`, errMsg)

        await Promise.all([
          supabase
            .from('campaign_contacts')
            .update({ status: 'failed' })
            .eq('id', ccId),
          supabase.from('email_logs').insert({
            email: contact.email,
            assunto: subject,
            status: `falha: ${errMsg}`.slice(0, 250),
          }),
        ])
        campResult.failed++
        results.total_failed++
      }
    }

    // Atualiza contador da campanha
    await supabase
      .from('campaigns')
      .update({
        sent_count: (camp.sent_count || 0) + campResult.sent,
      })
      .eq('id', camp.id)

    // Verifica se a campanha terminou (sem pending)
    const { count: remainingCount } = await supabase
      .from('campaign_contacts')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', camp.id)
      .eq('status', 'pending')

    if (remainingCount === 0) {
      await supabase
        .from('campaigns')
        .update({ status: 'completed', sent_at: new Date().toISOString() })
        .eq('id', camp.id)
      campResult.completed = true
    }

    results.campaigns.push(campResult)
  }

  return new Response(JSON.stringify({ ok: true, ...results }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
