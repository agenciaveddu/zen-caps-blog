export const prerender = false

import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

// 1x1 transparent GIF (43 bytes)
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
  'base64'
)

const HEADERS = {
  'Content-Type': 'image/gif',
  'Content-Length': PIXEL_GIF.length.toString(),
  'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
}

/**
 * GET /blog/api/track/open/?id={campaign_contact_id}
 * Retorna pixel 1x1 transparente. Marca campaign_contact.read_at se ainda não estiver marcado.
 *
 * Não bloqueia o response — atualiza DB em background pra resposta ser instantânea
 * (importante: alguns clients de email têm timeout pra imagens).
 */
export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id') || ''

  if (id && /^[0-9a-f-]{36}$/i.test(id)) {
    // Fire-and-forget: não esperamos a resposta do Supabase
    supabaseAdmin
      .from('campaign_contacts')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .is('read_at', null) // só marca primeira abertura
      .then(() => {})
      .catch((err) => console.error('[track/open]', err))
  }

  return new Response(PIXEL_GIF, { status: 200, headers: HEADERS })
}
