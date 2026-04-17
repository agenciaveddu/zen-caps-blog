export const prerender = false

import type { APIRoute } from 'astro'
import { supabase } from '../../lib/supabase'

const QUIZ_TAGS: Record<string, string[]> = {
  sono:      ['quiz-sono', 'interesse-sono'],
  dopamina:  ['quiz-dopamina', 'interesse-dopamina'],
  ansiedade: ['quiz-ansiedade', 'interesse-ansiedade'],
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { name, email, quiz, score } = body as {
      name?: string
      email?: string
      quiz?: string
      score?: number
    }

    // ── Validation ──
    if (!email || !email.includes('@') || !email.includes('.')) {
      return new Response(JSON.stringify({ error: 'Email inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const validQuizzes = ['sono', 'dopamina', 'ansiedade']
    if (!quiz || !validQuizzes.includes(quiz)) {
      return new Response(JSON.stringify({ error: 'Quiz inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const tags = QUIZ_TAGS[quiz] || []
    const fonte = `quiz-${quiz}`

    // ── Check if lead already exists ──
    const { data: existing } = await supabase
      .from('leads')
      .select('id, tags')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    let leadId: string

    if (existing) {
      // Merge tags (avoid duplicates)
      const currentTags: string[] = existing.tags || []
      const mergedTags = [...new Set([...currentTags, ...tags])]

      const { error: updateErr } = await supabase
        .from('leads')
        .update({
          nome: name?.trim() || undefined,
          tags: mergedTags,
          score: score ?? 0,
          fonte,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateErr) {
        console.error('[quiz-lead] Update error:', updateErr)
        return new Response(JSON.stringify({ error: 'Erro ao atualizar lead' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      leadId = existing.id
    } else {
      // Insert new lead
      const { data: inserted, error: insertErr } = await supabase
        .from('leads')
        .insert({
          email: email.toLowerCase().trim(),
          nome: name?.trim() || null,
          tags,
          score: score ?? 0,
          fonte,
        })
        .select('id')
        .single()

      if (insertErr || !inserted) {
        console.error('[quiz-lead] Insert error:', insertErr)
        return new Response(JSON.stringify({ error: 'Erro ao salvar lead' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      leadId = inserted.id
    }

    // ── Queue welcome email (if sequence exists) ──
    // Look for a matching email sequence for this quiz
    const { data: sequence } = await supabase
      .from('email_sequences')
      .select('id')
      .eq('nome', `boas-vindas-${quiz}`)
      .eq('ativo', true)
      .order('ordem', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (sequence) {
      await supabase.from('email_queue').insert({
        lead_id: leadId,
        sequence_id: sequence.id,
        status: 'pendente',
        agendado_para: new Date().toISOString(),
      })
    }

    return new Response(JSON.stringify({ ok: true, leadId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[quiz-lead] Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
