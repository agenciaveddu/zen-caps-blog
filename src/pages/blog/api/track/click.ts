export const prerender = false

import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

/**
 * GET /blog/api/track/click/?id={cc_id}&u={destination_url}
 * Redireciona 302 pra URL destino. Marca clicked_at.
 *
 * URL destino vem em base64url para evitar problemas com encoding.
 */
export const GET: APIRoute = async ({ url, redirect }) => {
  const id = url.searchParams.get('id') || ''
  const u = url.searchParams.get('u') || ''

  // Decode destination URL (base64url)
  let destUrl = ''
  try {
    destUrl = Buffer.from(u, 'base64url').toString('utf-8')
  } catch {
    return new Response('Invalid URL', { status: 400 })
  }

  // Validação básica do destino (deve ser https://)
  if (!destUrl.startsWith('https://') && !destUrl.startsWith('http://')) {
    return new Response('Invalid destination', { status: 400 })
  }

  // Fire-and-forget: marca clicked_at sem bloquear redirect
  if (id && /^[0-9a-f-]{36}$/i.test(id)) {
    supabaseAdmin
      .from('campaign_contacts')
      .update({ clicked_at: new Date().toISOString() })
      .eq('id', id)
      .is('clicked_at', null) // só marca primeiro click
      .then(() => {})
      .catch((err) => console.error('[track/click]', err))
  }

  return redirect(destUrl, 302)
}
