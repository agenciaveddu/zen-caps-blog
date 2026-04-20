export const prerender = false

import type { APIRoute } from 'astro'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../../../lib/supabase-admin'

const ANTHROPIC_API_KEY = import.meta.env.ANTHROPIC_API_KEY
const RUNWARE_API_KEY = 'akonTJA3Btwjw7zNAYyy1lJ0jyovzniM'
const RUNWARE_API_URL = 'https://api.runware.ai/v1'

// Preços por token (Claude modelos atuais)
const PRICING = {
  'claude-haiku-4-5': { input: 1.0, output: 5.0 }, // por milhão
  'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0 },
}

// Prompts por categoria (seguem a linha editorial existente)
const CATEGORY_CONTEXT: Record<string, string> = {
  sono: 'Foco em ciência do sono, arquitetura do sono (REM/profundo), cronobiologia, ritmo circadiano, insônia, apneia, higiene do sono. Cite estudos brasileiros (Fiocruz, Vigitel) quando relevante.',
  ansiedade: 'Foco em neurociência da ansiedade, eixo HHA, cortisol, GABA, serotonina, técnicas cognitivo-comportamentais, diferenciação ansiedade x estresse x pânico. GAD-7 como escala validada.',
  ingredientes: 'Foco em farmacologia de suplementos: mecanismo de ação, biodisponibilidade, dosagens baseadas em ensaios clínicos, interações. Tom educacional mas com profundidade científica.',
  habitos: 'Foco em comportamento e rotina: higiene do sono, gestão de estresse, ambiente, tecnologia, alimentação, exercício. Protocolos actionable com evidência.',
}

const PRODUCT_CTA_STRUCTURE = `
SOBRE O PRODUTO ZEN CAPS:
- Combinação: melatonina, triptofano, magnésio, vitamina B6, ácido fólico
- Posicionamento: natural, aprovado ANVISA, sem dependência, garantia 30 dias
- Diferencial: sinergia entre os 5 ingredientes em 1 cápsula
- URL: https://zencaps.com.br
- Link quiz sono: /blog/quiz-do-sono/
- Link teste ansiedade: /blog/teste-de-ansiedade/
- Link quiz dopamina: /blog/quiz-dopamina/
`

function buildPrompt(job: any): string {
  const category_ctx = CATEGORY_CONTEXT[job.category] || ''
  const type_spec = job.article_type === 'discovery'
    ? 'ARTIGO DISCOVERY (curto, 800-1200 palavras, gancho, dados quentes, conversacional)'
    : 'ARTIGO BASE/SEO (longo, 1500-2000 palavras, evergreen, técnico-acessível, profundo)'

  return `Você é redator-chefe do blog oficial da ZEN CAPS (suplemento natural para sono e ansiedade, público brasileiro 35-65 anos).

OBJETIVO: Escrever 1 artigo completo otimizado para Google Discover e SEO, com CTAs integrados ao funil de vendas.

TIPO: ${type_spec}

TEMA PRINCIPAL:
- Título sugerido: ${job.title_hint}
- Palavra-chave foco: ${job.focus_keyword}
- Categoria: ${job.category}
- Ângulo: ${job.angle || 'livre'}
- Público-alvo: ${job.target_audience || 'adultos brasileiros'}
- CTA preferencial: ${job.cta_preference || 'misto'}
- Notas extras: ${job.notes || 'nenhuma'}

CONTEXTO DA CATEGORIA: ${category_ctx}

${PRODUCT_CTA_STRUCTURE}

ESTRUTURA OBRIGATÓRIA DO ARTIGO:

1) FRONTMATTER YAML completo (entre --- no topo):
---
title: "Título final otimizado 60-70 caracteres"
coverImage: "/images/blog/${job.slug}.webp"
publishedAt: ${job.scheduled_for}
excerpt: "Frase-gancho 150-180 caracteres para Discover/SERP"
category: "${job.category}"
focusKeyword: "${job.focus_keyword}"
seoTitle: "Título SEO pt-BR otimizado 55-65 caracteres"
seoDescription: "Meta description 150-160 chars"
quickAnswer: "Resposta direta 200-300 caracteres para AEO (voice search, Google AI)"
readingTime: 6
author: "Equipe Zen Caps"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
faq:
  - question: "Pergunta 1?"
    answer: "Resposta completa e informativa 2-4 frases"
  - question: "Pergunta 2?"
    answer: "Resposta"
  - question: "Pergunta 3?"
    answer: "Resposta"
  - question: "Pergunta 4?"
    answer: "Resposta"
---

2) CORPO do artigo (após frontmatter):
- Abertura com gancho emocional/dados (3-4 parágrafos fortes)
- Subtítulos H2 e H3 bem estruturados
- Tabelas comparativas quando relevante
- Citações científicas inline (autor, ano, periódico)
- Linguagem pt-BR natural, nem muito formal nem coloquial
- Listas quando apropriado
- Blockquotes para destacar CTAs (usando > sintaxe markdown)

3) CTAs OBRIGATÓRIOS (integrar naturalmente, sem forçar):
- 1 CTA no meio do artigo (após seção importante) → link quiz ou teste dependendo da preferência
- 1 CTA forte no final → link Zen Caps OU quiz, alinhado com cta_preference
- Use blockquote (>) para destacar CTAs
- Linguagem: conversacional, convidativa, não pressionando

4) REFERÊNCIAS no final (3-5 estudos reais ou plausíveis):
## Referências
- Autor et al. (ano). Título. Periódico, volume(número), páginas.

REGRAS:
- Não invente estudos fake de forma descarada (use nomes plausíveis de journals reais como PubMed, BMJ, Sleep Medicine Reviews)
- Não prometa cura/milagre
- Sempre sugira médico em casos severos
- Dados percentuais/estatísticos precisam ser plausíveis (se não souber, use faixas aproximadas)
- NÃO use markdown H1 (#) no corpo — o título já está no frontmatter
- Use H2 (##) e H3 (###) livremente
- Evite clichês como "na era digital", "hoje em dia", "nos dias atuais"
- Respeite o tamanho do tipo (Discovery: 800-1200 | Base: 1500-2000)

SLUG DO ARQUIVO: ${job.slug}.md

Responda APENAS com o arquivo .md completo (frontmatter + corpo + referências). Sem introdução, sem "aqui está o artigo", nada além do conteúdo do arquivo.`
}

async function generateImage(slug: string, category: string): Promise<string | null> {
  const prompts: Record<string, string> = {
    sono: 'serene moonlit bedroom, soft blue ambient lighting, peaceful sleep atmosphere, premium wellness photography, dark navy tones, ethereal',
    ansiedade: 'calm zen meditation space, soft morning light, wellness aesthetic, minimalist composition, warm earthy tones',
    ingredientes: 'natural supplements crystalline glow, botanical elements, scientific aesthetic, soft gradient background, premium product photography',
    habitos: 'healthy morning routine at sunrise, golden hour light, lifestyle photography, warm and inviting, aspirational',
  }

  const prompt = prompts[category] || prompts.sono
  const uuid = crypto.randomUUID()

  try {
    const res = await fetch(RUNWARE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { taskType: 'authentication', apiKey: RUNWARE_API_KEY },
        {
          taskType: 'imageInference',
          taskUUID: uuid,
          model: 'runware:100@1',
          positivePrompt: prompt,
          width: 1216,
          height: 640,
          outputFormat: 'WEBP',
          numberResults: 1,
        },
      ]),
    })
    const data = await res.json() as any
    const imageUrl = data?.data?.find((d: any) => d.imageURL)?.imageURL
    return imageUrl || null
  } catch (err) {
    console.error('[generate-article] Runware error:', err)
    return null
  }
}

export const GET: APIRoute = async ({ request }) => processRequest(request)
export const POST: APIRoute = async ({ request }) => processRequest(request)

async function processRequest(request: Request): Promise<Response> {
  // Auth (Vercel Cron)
  const auth = request.headers.get('authorization') || ''
  const expected = `Bearer ${import.meta.env.CRON_SECRET}`
  if (auth !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY missing' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  // 1. Buscar próximo artigo da fila
  const today = new Date().toISOString().split('T')[0]
  const { data: job, error: fetchErr } = await supabaseAdmin
    .from('article_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', today)
    .order('priority', { ascending: false })
    .order('scheduled_for', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (fetchErr) {
    return new Response(JSON.stringify({ error: 'Fetch failed', details: fetchErr.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!job) {
    return new Response(JSON.stringify({ ok: true, message: 'No pending articles for today' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  }

  // 2. Marcar como gerando (lock otimista)
  await supabaseAdmin
    .from('article_queue')
    .update({ status: 'generating', attempts: (job.attempts || 0) + 1, updated_at: new Date().toISOString() })
    .eq('id', job.id)

  try {
    // 3. Escolher modelo conforme tipo (Discovery = Haiku barato, Base = Sonnet mais capaz)
    const model = job.article_type === 'base'
      ? 'claude-sonnet-4-5-20250929'
      : 'claude-haiku-4-5'

    // 4. Gerar artigo via Claude
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const prompt = buildPrompt(job)

    const response = await client.messages.create({
      model,
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }
    const generated = textContent.text

    // Validar estrutura mínima
    if (!generated.startsWith('---') || !generated.includes('publishedAt:')) {
      throw new Error('Generated content does not have valid frontmatter')
    }

    // Calcular custo
    const pricing = PRICING[model as keyof typeof PRICING] || PRICING['claude-haiku-4-5']
    const inputTokens = response.usage?.input_tokens || 0
    const outputTokens = response.usage?.output_tokens || 0
    const cost = (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000

    // Contar palavras (aproximado)
    const wordCount = generated.split(/\s+/).length

    // Extrair título real do frontmatter
    const titleMatch = generated.match(/^title:\s*["'](.+?)["']/m)
    const actualTitle = titleMatch ? titleMatch[1] : job.title_hint

    // 5. Gerar imagem
    const imageUrl = await generateImage(job.slug, job.category)

    // 6. Atualizar status + salvar conteúdo + dados de geração
    await supabaseAdmin
      .from('article_queue')
      .update({
        status: 'generated',
        generated_content: generated,
        image_url: imageUrl,
        actual_title: actualTitle,
        word_count: wordCount,
        tokens_used: inputTokens + outputTokens,
        cost_usd: cost,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    return new Response(JSON.stringify({
      ok: true,
      generated: {
        id: job.id,
        slug: job.slug,
        title: actualTitle,
        model,
        word_count: wordCount,
        tokens: inputTokens + outputTokens,
        cost_usd: Number(cost.toFixed(4)),
        image_url: imageUrl,
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    const errMsg = (err?.message || 'unknown error').toString().slice(0, 500)
    console.error('[generate-article] Error:', errMsg)

    await supabaseAdmin
      .from('article_queue')
      .update({
        status: 'failed',
        error_message: errMsg,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    return new Response(JSON.stringify({ error: 'Generation failed', details: errMsg, job_id: job.id }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
