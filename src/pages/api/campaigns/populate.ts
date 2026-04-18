export const prerender = false

import type { APIRoute } from 'astro'
import { supabaseAdmin as supabase } from '../../../lib/supabase-admin'

// POST /api/campaigns/populate/
// Body: { campaignId: string }
// Popula campaign_contacts baseado no segment_filter da campanha
export const POST: APIRoute = async ({ request }) => {
  const auth = request.headers.get('authorization') || ''
  const expected = `Bearer ${import.meta.env.CRON_SECRET}`
  if (auth !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const { campaignId } = body as { campaignId?: string }

  if (!campaignId) {
    return new Response(JSON.stringify({ error: 'campaignId required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Busca campanha
  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .select('id, segment_filter, type')
    .eq('id', campaignId)
    .single()

  if (campErr || !campaign) {
    return new Response(JSON.stringify({ error: 'Campaign not found', details: campErr?.message }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Monta query de contacts
  let query = supabase.from('contacts').select('id').eq('email_opted_in', true).not('email', 'is', null)

  if (campaign.segment_filter && campaign.segment_filter !== 'all') {
    query = query.eq('segment', campaign.segment_filter)
  }

  const { data: contacts, error: contactsErr } = await query

  if (contactsErr || !contacts) {
    return new Response(JSON.stringify({ error: 'Fetch contacts failed', details: contactsErr?.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verifica quem já está na campanha para evitar duplicatas
  const { data: existing } = await supabase
    .from('campaign_contacts')
    .select('contact_id')
    .eq('campaign_id', campaignId)

  const existingIds = new Set((existing || []).map(e => e.contact_id))
  const newContacts = contacts.filter(c => !existingIds.has(c.id))

  if (newContacts.length === 0) {
    return new Response(JSON.stringify({ ok: true, added: 0, total: contacts.length, message: 'All contacts already in campaign' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Insere em batches de 500 (evita payload muito grande)
  const BATCH = 500
  let inserted = 0
  for (let i = 0; i < newContacts.length; i += BATCH) {
    const batch = newContacts.slice(i, i + BATCH).map(c => ({
      campaign_id: campaignId,
      contact_id: c.id,
      status: 'pending',
    }))
    const { error: insertErr } = await supabase.from('campaign_contacts').insert(batch)
    if (insertErr) {
      console.error('[campaigns/populate] Insert batch error:', insertErr)
      continue
    }
    inserted += batch.length
  }

  // Atualiza total_contacts da campanha
  const { count: totalCount } = await supabase
    .from('campaign_contacts')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)

  await supabase
    .from('campaigns')
    .update({ total_contacts: totalCount || 0 })
    .eq('id', campaignId)

  return new Response(JSON.stringify({ ok: true, inserted, total_contacts: totalCount }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
