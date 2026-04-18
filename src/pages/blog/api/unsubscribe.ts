export const prerender = false

import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { verifyToken } from '../../../lib/unsubscribe-token'

async function optOut(email: string): Promise<{ contacts: boolean; leads: boolean }> {
  const emailLower = email.toLowerCase().trim()
  const [contactsRes, leadsRes] = await Promise.all([
    supabaseAdmin
      .from('contacts')
      .update({ email_opted_in: false, updated_at: new Date().toISOString() })
      .eq('email', emailLower),
    supabaseAdmin
      .from('leads')
      .update({ ativo: false, atualizado_em: new Date().toISOString() })
      .eq('email', emailLower),
  ])
  return { contacts: !contactsRes.error, leads: !leadsRes.error }
}

/**
 * One-click unsubscribe (RFC 8058)
 * Gmail envia POST com "List-Unsubscribe=One-Click" no body
 */
export const POST: APIRoute = async ({ request, url }) => {
  const email = url.searchParams.get('e') || ''
  const token = url.searchParams.get('t') || ''
  if (!email || !token || !verifyToken(email, token)) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }
  await optOut(email)
  return new Response(JSON.stringify({ ok: true, email }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * GET — usado quando o usuário clica no link no email (browser)
 * Redireciona para página de confirmação.
 */
export const GET: APIRoute = async ({ url, redirect }) => {
  const email = url.searchParams.get('e') || ''
  const token = url.searchParams.get('t') || ''
  if (!email || !token || !verifyToken(email, token)) {
    return redirect('/blog/descadastrar/?status=invalid')
  }
  const result = await optOut(email)
  const status = (result.contacts || result.leads) ? 'ok' : 'error'
  return redirect(`/blog/descadastrar/?status=${status}&e=${encodeURIComponent(email)}`)
}
