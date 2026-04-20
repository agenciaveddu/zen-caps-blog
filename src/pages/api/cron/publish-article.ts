export const prerender = false

import type { APIRoute } from 'astro'
import sharp from 'sharp'
import { supabaseAdmin } from '../../../lib/supabase-admin'

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN
const GITHUB_REPO = 'agenciaveddu/zen-caps-blog'
const GITHUB_BRANCH = 'master'

/**
 * POST /api/cron/publish-article/
 * Pega artigos status='generated' e:
 * 1. Faz upload da imagem pro /public/images/blog/ via GitHub API
 * 2. Commit do arquivo .md em /src/content/blog/
 * 3. Marca como 'published' na queue
 *
 * Auto-triggera deploy no Vercel (integração master branch).
 */

async function getFileSha(path: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    if (!res.ok) return null
    const data = await res.json() as any
    return data.sha || null
  } catch { return null }
}

async function commitFile(path: string, content: string, message: string, encoding: 'utf-8' | 'base64' = 'utf-8'): Promise<boolean> {
  const sha = await getFileSha(path) // se file já existe (update), precisa do sha
  const contentBase64 = encoding === 'base64' ? content : Buffer.from(content, 'utf-8').toString('base64')

  const body: any = {
    message,
    content: contentBase64,
    branch: GITHUB_BRANCH,
    committer: { name: 'Zen Caps Bot', email: 'bot@zencaps.com.br' },
  }
  if (sha) body.sha = sha

  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`GitHub commit failed (${res.status}): ${errText.slice(0, 200)}`)
  }
  return true
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch { return null }
}

export const POST: APIRoute = async ({ request }) => processRequest(request)
export const GET: APIRoute = async ({ request }) => processRequest(request)

async function processRequest(request: Request): Promise<Response> {
  const auth = request.headers.get('authorization') || ''
  const expected = `Bearer ${import.meta.env.CRON_SECRET}`
  if (auth !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: 'GITHUB_TOKEN not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  // 1. Busca artigos gerados e ainda não publicados
  const { data: jobs, error } = await supabaseAdmin
    .from('article_queue')
    .select('*')
    .eq('status', 'generated')
    .order('scheduled_for', { ascending: true })
    .limit(3) // max 3 por execução (evita rate limit GitHub)

  if (error) {
    return new Response(JSON.stringify({ error: 'Fetch failed', details: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!jobs || jobs.length === 0) {
    return new Response(JSON.stringify({ ok: true, message: 'No articles to publish' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  }

  const results: any[] = []

  for (const job of jobs) {
    try {
      // 2. Commita a imagem original + thumbnail
      if (job.image_url) {
        const imgBuffer = await downloadImage(job.image_url)
        if (imgBuffer) {
          // Original (1216x640)
          await commitFile(
            `public/images/blog/${job.slug}.webp`,
            imgBuffer.toString('base64'),
            `feat(blog): add cover image for ${job.slug}`,
            'base64'
          )
          await new Promise(r => setTimeout(r, 1200))

          // Thumbnail 660px (pra cards do blog)
          try {
            const thumbBuffer = await sharp(imgBuffer)
              .resize({ width: 660, withoutEnlargement: true })
              .webp({ quality: 78 })
              .toBuffer()
            await commitFile(
              `public/images/blog/thumbs/${job.slug}.webp`,
              thumbBuffer.toString('base64'),
              `feat(blog): add thumbnail for ${job.slug}`,
              'base64'
            )
            await new Promise(r => setTimeout(r, 1200))
          } catch (thumbErr) {
            console.error('[publish-article] Thumbnail error:', thumbErr)
            // Não bloqueia — só loga
          }
        }
      }

      // 3. Commita o artigo .md
      await commitFile(
        `src/content/blog/${job.slug}.md`,
        job.generated_content,
        `feat(blog): publish ${job.actual_title || job.slug}`,
        'utf-8'
      )

      // 4. Marca como publicado
      await supabaseAdmin
        .from('article_queue')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      results.push({ slug: job.slug, status: 'published', title: job.actual_title })
    } catch (err: any) {
      const errMsg = (err?.message || 'unknown').toString().slice(0, 500)
      await supabaseAdmin
        .from('article_queue')
        .update({ error_message: `publish_error: ${errMsg}`, updated_at: new Date().toISOString() })
        .eq('id', job.id)
      results.push({ slug: job.slug, status: 'error', error: errMsg })
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
