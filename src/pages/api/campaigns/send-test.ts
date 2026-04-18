export const prerender = false

import type { APIRoute } from 'astro'
import nodemailer from 'nodemailer'
import { supabaseAdmin as supabase } from '../../../lib/supabase-admin'
import { injectComplianceFooter, unsubscribeHeaders } from '../../../lib/email-compliance'

// Email de teste padrão (fallback se não passar no body)
const DEFAULT_TEST_EMAIL = 'agenciaveddu@gmail.com'
const DEFAULT_TEST_NAME = 'Bruno Teste'

const SMTP_HOST = import.meta.env.SES_SMTP_HOST || 'email-smtp.us-west-2.amazonaws.com'
const SMTP_PORT = Number(import.meta.env.SES_SMTP_PORT || 587)
const SMTP_USER = import.meta.env.SES_SMTP_USER
const SMTP_PASS = import.meta.env.SES_SMTP_PASS
const FROM_EMAIL = import.meta.env.SES_FROM_EMAIL || 'marketing@zencaps.com.br'
const FROM_NAME = import.meta.env.SES_FROM_NAME || 'Zen Caps'
const MAIL_FROM = `${FROM_NAME} <${FROM_EMAIL}>`

function personalize(template: string, name: string, email: string): string {
  const firstName = (name || '').trim().split(' ')[0] || ''
  return template
    .replace(/\{\{nome\}\}/g, name || '')
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{email\}\}/g, email || '')
}

/**
 * POST /api/campaigns/send-test/
 * Body: { campaignId?, sequenceId?, email?, name? }
 *
 * Envia UM email de preview usando o template de uma campanha OU sequência.
 * Default: envia para agenciaveddu@gmail.com como "Bruno Teste".
 *
 * Não mexe em campaign_contacts nem email_queue — só envia e loga.
 */
export const POST: APIRoute = async ({ request }) => {
  const auth = request.headers.get('authorization') || ''
  const expected = `Bearer ${import.meta.env.CRON_SECRET}`
  if (auth !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json().catch(() => ({}))
  const {
    campaignId,
    sequenceId,
    email = DEFAULT_TEST_EMAIL,
    name = DEFAULT_TEST_NAME,
  } = body as { campaignId?: string; sequenceId?: string; email?: string; name?: string }

  if (!campaignId && !sequenceId) {
    return new Response(JSON.stringify({ error: 'campaignId ou sequenceId obrigatório' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Busca template
  let subject = ''
  let html = ''
  let sourceName = ''

  if (campaignId) {
    const { data: camp, error } = await supabase
      .from('campaigns')
      .select('name, email_subject, email_body')
      .eq('id', campaignId)
      .single()
    if (error || !camp) {
      return new Response(JSON.stringify({ error: 'Campanha não encontrada', details: error?.message }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      })
    }
    subject = camp.email_subject
    html = camp.email_body
    sourceName = `campaign:${camp.name}`
  } else if (sequenceId) {
    const { data: seq, error } = await supabase
      .from('email_sequences')
      .select('nome, assunto, corpo_html')
      .eq('id', sequenceId)
      .single()
    if (error || !seq) {
      return new Response(JSON.stringify({ error: 'Sequência não encontrada', details: error?.message }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      })
    }
    subject = seq.assunto
    html = seq.corpo_html
    sourceName = `sequence:${seq.nome}`
  }

  // Personaliza
  subject = personalize(subject, name, email)
  html = personalize(html, name, email)

  // Prepend banner de TESTE no HTML
  const testBanner = `<div style="background:#FFC107;color:#0D1B3E;padding:12px 24px;text-align:center;font-family:Arial,sans-serif;font-weight:700;font-size:14px;">⚠️ EMAIL DE TESTE — Preview da campanha "${sourceName}" enviado para ${email}</div>`
  html = html.replace('<body', '<body').replace(/(<body[^>]*>)/, `$1${testBanner}`)
  subject = `[TESTE] ${subject}`

  // Envia
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  // Injeta compliance footer (unsub link + endereço)
  html = injectComplianceFooter(html, email)

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject,
      html,
      headers: unsubscribeHeaders(email),
    })

    await supabase.from('email_logs').insert({
      email,
      assunto: subject,
      status: `teste-enviado: ${sourceName}`,
    })

    return new Response(JSON.stringify({ ok: true, sent_to: email, source: sourceName, subject }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    const errMsg = (err?.message || 'unknown').toString().slice(0, 200)
    return new Response(JSON.stringify({ error: 'Falha no envio', details: errMsg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
