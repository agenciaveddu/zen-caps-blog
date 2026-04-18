export const prerender = false

import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

/**
 * Webhook AWS SNS para eventos SES (Bounce, Complaint, Delivery).
 *
 * Fluxo:
 * 1. SES publica evento (bounce/complaint/etc) em SNS Topic
 * 2. SNS faz POST nesse endpoint
 * 3. Processamos o evento e atualizamos contacts/leads
 *
 * Tipos de mensagem SNS:
 * - SubscriptionConfirmation: handshake inicial (precisa visitar SubscribeURL)
 * - Notification: evento SES de fato
 * - UnsubscribeConfirmation: quando topic é descadastrado
 */
export const POST: APIRoute = async ({ request }) => {
  const messageType = request.headers.get('x-amz-sns-message-type') || ''
  const bodyText = await request.text()

  let body: any
  try {
    body = JSON.parse(bodyText)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 1. Subscription confirmation (handshake inicial) ──
  if (messageType === 'SubscriptionConfirmation') {
    const subscribeUrl = body.SubscribeURL
    if (subscribeUrl) {
      try {
        await fetch(subscribeUrl, { method: 'GET' })
        console.log('[ses-event] Subscription confirmed:', body.TopicArn)
      } catch (err) {
        console.error('[ses-event] Failed to confirm subscription:', err)
      }
    }
    return new Response(JSON.stringify({ ok: true, type: 'subscription-confirmed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 2. Unsubscribe confirmation ──
  if (messageType === 'UnsubscribeConfirmation') {
    return new Response(JSON.stringify({ ok: true, type: 'unsub-confirmed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 3. Notification (evento SES) ──
  if (messageType !== 'Notification') {
    return new Response(JSON.stringify({ error: 'Unknown message type', type: messageType }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let sesMessage: any
  try {
    sesMessage = JSON.parse(body.Message || '{}')
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid SES message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const eventType = sesMessage.eventType || sesMessage.notificationType || 'unknown'
  const recipients: string[] = []
  let detail = ''
  let optOut = false

  // Coleta destinatários afetados conforme o tipo
  switch (eventType) {
    case 'Bounce': {
      const bounce = sesMessage.bounce || {}
      const isPermanent = bounce.bounceType === 'Permanent'
      detail = `bounce-${bounce.bounceType}-${bounce.bounceSubType || 'unknown'}`
      const list = bounce.bouncedRecipients || []
      for (const r of list) recipients.push(r.emailAddress)
      // Hard bounce → opt-out automático (proteção SES)
      optOut = isPermanent
      break
    }
    case 'Complaint': {
      const complaint = sesMessage.complaint || {}
      detail = `complaint-${complaint.complaintFeedbackType || 'unknown'}`
      const list = complaint.complainedRecipients || []
      for (const r of list) recipients.push(r.emailAddress)
      // Spam complaint → opt-out automático SEMPRE
      optOut = true
      break
    }
    case 'Delivery': {
      detail = 'delivered'
      const list = sesMessage.delivery?.recipients || []
      for (const r of list) recipients.push(typeof r === 'string' ? r : r.emailAddress)
      break
    }
    case 'Send':
    case 'Open':
    case 'Click':
    case 'Reject':
    case 'RenderingFailure':
    case 'DeliveryDelay':
      detail = eventType.toLowerCase()
      const mailDest = sesMessage.mail?.destination || []
      for (const r of mailDest) recipients.push(r)
      break
    default:
      detail = `unknown-${eventType}`
  }

  // ── 4. Processa cada destinatário ──
  for (const email of recipients) {
    const emailLower = email.toLowerCase().trim()

    // Log no email_logs (auditoria completa)
    await supabaseAdmin.from('email_logs').insert({
      email: emailLower,
      assunto: sesMessage.mail?.commonHeaders?.subject || null,
      status: `ses-${detail}`,
    })

    // Opt-out automático para hard bounce e complaint
    if (optOut) {
      await Promise.all([
        supabaseAdmin
          .from('contacts')
          .update({ email_opted_in: false, updated_at: new Date().toISOString() })
          .eq('email', emailLower),
        supabaseAdmin
          .from('leads')
          .update({ ativo: false, atualizado_em: new Date().toISOString() })
          .eq('email', emailLower),
      ])
    }
  }

  return new Response(
    JSON.stringify({ ok: true, eventType, processed: recipients.length, optOut }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

// GET para teste rápido / health check
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true, endpoint: 'ses-event-webhook' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
