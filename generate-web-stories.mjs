/**
 * generate-web-stories.mjs — v3 (safe zone fix)
 * Canvas: 1080 × 1920 px
 * Safe zone: 50px margin todos os lados, top 160px, bottom 140px
 */

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const WP_URL   = 'https://zencaps.com.br'
const WP_USER  = 'veddu'
const WP_PASS  = 'AS1A DZ8c 0rtZ 8dPH IJDr IIfc'
const BLOG_URL = 'https://zencaps.com.br/blog'
const IMG_BASE = 'https://zencaps.com.br/images/blog'
const LOGO_URL = 'https://zencaps.com.br/wp-content/uploads/2024/11/zen-caps-2.png'
const AUTH     = Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')
const BLOG_DIR = path.join(__dirname, 'src/content/blog')

const CAT_LABEL = { sono:'Sono & Insônia', ansiedade:'Ansiedade & Estresse', ingredientes:'Ingredientes & Ciência', habitos:'Hábitos Saudáveis' }
const CAT_COLOR = { sono:'#1DB8E8', ansiedade:'#5B6FDE', ingredientes:'#1DB8E8', habitos:'#C9A84C' }
const CAT_EMOJI = { sono:'🌙', ansiedade:'🧘', ingredientes:'🔬', habitos:'✨' }

// ── helpers ──────────────────────────────────────────────────────────────────
let _id = 100
const uid   = () => `e${_id++}`
const pid   = (n) => `pg${n}`
const trunc = (s, max) => s && s.length > max ? s.slice(0, max - 1) + '…' : (s || '')

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return null
  const fm = m[1]
  const get = (k) => { const r = fm.match(new RegExp(`^${k}:\\s*[\"']?(.+?)[\"']?\\s*$`, 'm')); return r ? r[1].trim().replace(/^[\"']|[\"']$/g, '') : '' }
  const qaBlock = fm.match(/^quickAnswer:\s*[\"']([\s\S]*?)[\"']\s*(?=\n\w)/m)
  return {
    title:       get('title'),
    coverImage:  get('coverImage').replace(/[\"']/g, ''),
    category:    get('category').replace(/[\"']/g, '').trim(),
    excerpt:     get('excerpt'),
    quickAnswer: qaBlock ? qaBlock[1].trim() : get('quickAnswer'),
  }
}

function extractBullets(qa, excerpt) {
  const sents = (qa || '').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 100)
  const bullets = sents.slice(0, 3)
  if (bullets.length < 3) {
    const extra = (excerpt || '').split(/(?<=[.!?])\s+/).filter(s => s.length > 20)
    for (const p of extra) { if (bullets.length >= 3) break; bullets.push(trunc(p, 95)) }
  }
  return bullets.slice(0, 3)
}

// ── story_data builder (editor JSON — canvas 1080×1920) ──────────────────────
// Safe zone: x 50–1030, y 160–1780

function makeElement(type, x, y, w, h, extra = {}) {
  return { id: uid(), type, x, y, width: w, height: h, rotationAngle: 0, ...extra }
}

function makeRect(x, y, w, h, r, g, b, a = 1) {
  return makeElement('shape', x, y, w, h, {
    mask: { type: 'rectangle' },
    backgroundColor: { color: { r, g, b, a } },
  })
}

function makeTxt(content, x, y, w, h, { size = 28, tag = 'p', font = 'Roboto', lh = 1.3, align = 'left', r = 255, g = 255, b = 255 } = {}) {
  return makeElement('text', x, y, w, h, {
    content,
    tagName: tag,
    fontSize: size,
    font: { family: font, service: 'fonts.google.com', weights: [400, 700], styles: ['regular'], fallbacks: ['sans-serif'] },
    color: { color: { r, g, b } },
    lineHeight: lh,
    textAlign: align,
    padding: { horizontal: 0, vertical: 0, locked: false },
    backgroundTextMode: 'NONE',
  })
}

function makeImg(src, alt) {
  return makeElement('image', 0, 0, 1080, 1920, {
    isBackground: true,
    resource: { type: 'image', src, width: 1280, height: 704, mimeType: 'image/webp', alt, sizes: {} },
    scale: 100, focalX: 50, focalY: 50,
    mask: { type: 'rectangle' },
  })
}

function makeStoryData(article, slug, color, catLabel, emoji) {
  const { title, coverImage, excerpt, quickAnswer } = article
  const src     = coverImage ? `${IMG_BASE}/${path.basename(coverImage)}` : LOGO_URL
  const bullets = extractBullets(quickAnswer, excerpt)
  const col     = hexToRgb(color)

  // ── Page 1: Capa ──────────────────────────────────────────────────────────
  const p1 = {
    id: pid(1), backgroundColor: { color: { r: 13, g: 27, b: 62 } }, animations: [],
    elements: [
      makeImg(src, title),
      // Overlay escura no terço inferior
      makeRect(0, 900, 1080, 1020, 13, 27, 62, 0.85),
      // Badge categoria
      makeTxt(`<span style="font-weight:700;color:${color}">${emoji} ${catLabel}</span>`,
        60, 960, 700, 60, { size: 22 }),
      // Título principal
      makeTxt(`<span style="font-weight:900;color:#ffffff">${trunc(title, 55)}</span>`,
        60, 1040, 960, 340, { size: 38, tag: 'h1', lh: 1.2 }),
      // Autor
      makeTxt(`<span style="color:rgba(255,255,255,0.65)">Zen Caps Blog</span>`,
        60, 1760, 500, 55, { size: 20 }),
    ],
  }

  // ── Page 2: Você sabia? ───────────────────────────────────────────────────
  const p2 = {
    id: pid(2), backgroundColor: { color: { r: 244, g: 248, b: 252 } }, animations: [],
    elements: [
      // Fundo claro
      makeRect(0, 0, 1080, 1920, 244, 248, 252, 1),
      // Card branco
      makeRect(50, 180, 980, 1540, 255, 255, 255, 1),
      // Emoji
      makeTxt(`<span>${emoji}</span>`, 90, 240, 200, 110, { size: 56 }),
      // Label
      makeTxt(`<span style="font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${color}">Você sabia?</span>`,
        90, 380, 900, 65, { size: 22, r: col.r, g: col.g, b: col.b }),
      // Texto excerpt
      makeTxt(`<span style="color:#2d3a5e">${trunc(excerpt, 180)}</span>`,
        90, 470, 900, 760, { size: 28, lh: 1.55, r: 45, g: 58, b: 94 }),
    ],
  }

  // ── Page 3: Pontos-chave ──────────────────────────────────────────────────
  const p3 = {
    id: pid(3), backgroundColor: { color: { r: 13, g: 27, b: 62 } }, animations: [],
    elements: [
      makeRect(0, 0, 1080, 1920, 13, 27, 62, 1),
      // Label seção
      makeTxt(`<span style="font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${color}">📚 O que você vai aprender</span>`,
        60, 170, 960, 65, { size: 21, r: col.r, g: col.g, b: col.b }),
      // Separador
      makeRect(60, 255, 960, 2, col.r, col.g, col.b, 0.4),
      // Bullets (3 itens, ~250px cada)
      ...bullets.map((b, i) =>
        makeTxt(`<span style="color:#ffffff">◆  ${b}</span>`,
          60, 290 + i * 280, 960, 240, { size: 26, lh: 1.5 })
      ),
    ],
  }

  // ── Page 4: Resposta rápida ───────────────────────────────────────────────
  const p4 = {
    id: pid(4), backgroundColor: { color: { r: 244, g: 248, b: 252 } }, animations: [],
    elements: [
      makeRect(0, 0, 1080, 1920, 244, 248, 252, 1),
      makeRect(50, 180, 980, 1540, 255, 255, 255, 1),
      makeTxt(`<span style="font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${color}">💡 Resposta rápida</span>`,
        90, 240, 900, 65, { size: 22, r: col.r, g: col.g, b: col.b }),
      makeTxt(`<span style="color:#2d3a5e">${trunc(quickAnswer || excerpt, 220)}</span>`,
        90, 335, 900, 1000, { size: 27, lh: 1.6, r: 45, g: 58, b: 94 }),
    ],
  }

  // ── Page 5: CTA ───────────────────────────────────────────────────────────
  const p5 = {
    id: pid(5), backgroundColor: { color: { r: 13, g: 27, b: 62 } }, animations: [],
    elements: [
      makeRect(0, 0, 1080, 1920, 13, 27, 62, 1),
      // Label
      makeTxt(`<span style="font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${color}">Zen Caps</span>`,
        60, 190, 960, 60, { size: 20, align: 'center', r: col.r, g: col.g, b: col.b }),
      // Título
      makeTxt(`<span style="font-weight:900;color:#ffffff">Durma melhor.<br>Controle a ansiedade.</span>`,
        60, 290, 960, 380, { size: 42, tag: 'h1', lh: 1.2, align: 'center' }),
      // Destaque cor
      makeTxt(`<span style="font-weight:900;color:${color}">Sem tarja preta.</span>`,
        60, 680, 960, 110, { size: 42, tag: 'h2', lh: 1.2, align: 'center', r: col.r, g: col.g, b: col.b }),
      // Ingredientes
      makeTxt(`<span style="color:rgba(255,255,255,0.5)">Melatonina · Triptofano · Magnésio · B6</span>`,
        60, 820, 960, 65, { size: 20, align: 'center' }),
      // Botão ouro (fundo + texto)
      makeRect(140, 960, 800, 110, 201, 168, 76, 1),
      makeTxt(`<span style="font-weight:800;color:#0D1B3E">📖 Ler artigo completo</span>`,
        140, 960, 800, 110, { size: 28, align: 'center', r: 13, g: 27, b: 62 }),
      // Botão fantasma (borda + texto)
      makeRect(140, 1110, 800, 100, 255, 255, 255, 0.15),
      makeTxt(`<span style="font-weight:700;color:#ffffff">Conheça o Zen Caps →</span>`,
        140, 1110, 800, 100, { size: 26, align: 'center' }),
    ],
  }

  return {
    version: 44,
    title,
    currentStoryStyles: { colors: [] },
    backgroundAudio: {},
    pages: [p1, p2, p3, p4, p5],
  }
}

// ── AMP HTML builder (o que usuário vê) ───────────────────────────────────────
const AMP_BP = `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`

function generateAMP(article, slug, color, catLabel, emoji) {
  const { title, coverImage, excerpt, quickAnswer } = article
  const src        = coverImage ? `${IMG_BASE}/${path.basename(coverImage)}` : LOGO_URL
  const articleUrl = `${BLOG_URL}/${slug}`
  const bullets    = extractBullets(quickAnswer, excerpt)

  return `<!DOCTYPE html>
<html amp lang="pt-BR">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
  <title>${title}</title>
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <link rel="canonical" href="${articleUrl}">
  <style amp-boilerplate>${AMP_BP}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none}</style></noscript>
  <style amp-custom>
    * { box-sizing: border-box; }
    amp-story { font-family: -apple-system, sans-serif; }
    .fl { width:100%; height:100%; display:flex; flex-direction:column; }
    .jc-end { justify-content:flex-end; }
    .jc-center { justify-content:center; }
    .p1 { padding: 0 32px 68px; }
    .p2 { padding: 48px 28px; }
    .badge { background:${color}; color:#fff; padding:5px 16px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; display:inline-block; }
    .card { background:#fff; border-radius:18px; padding:28px 24px; }
    .lbl { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:${color}; margin:0 0 12px; }
    .body-t { font-size:14px; color:#2d3a5e; line-height:1.55; margin:0; }
    .sp8  { height:8px; }
    .sp12 { height:12px; }
    .sp20 { height:20px; }
    .sp28 { height:28px; }
    .bullet { display:flex; align-items:flex-start; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.12); }
    .bullet:last-child { border-bottom:none; }
    .dot { color:${color}; font-size:16px; margin-right:10px; flex-shrink:0; padding-top:2px; }
    .btxt { font-size:14px; color:#fff; line-height:1.45; }
    .cta-g { background:#C9A84C; color:#0D1B3E; padding:14px 20px; border-radius:30px; font-weight:800; font-size:15px; text-decoration:none; display:block; text-align:center; }
    .cta-o { border:2px solid rgba(255,255,255,.45); color:#fff; padding:11px 20px; border-radius:30px; font-weight:700; font-size:14px; text-decoration:none; display:block; text-align:center; }
  </style>
</head>
<body>
<amp-story standalone
  title="${trunc(title, 70)}"
  publisher="Zen Caps Blog"
  publisher-logo-src="${LOGO_URL}"
  poster-portrait-src="${src}"
  poster-square-src="${src}"
  poster-landscape-src="${src}">

  <!-- 1. CAPA -->
  <amp-story-page id="p1" auto-advance-after="5s">
    <amp-story-grid-layer template="fill">
      <amp-img src="${src}" width="720" height="1280" layout="fill" object-fit="cover" object-position="center top"></amp-img>
    </amp-story-grid-layer>
    <amp-story-grid-layer template="fill">
      <div style="width:100%;height:100%;background:linear-gradient(to top,rgba(13,27,62,.95) 0%,rgba(13,27,62,.5) 50%,transparent 100%);"></div>
    </amp-story-grid-layer>
    <amp-story-grid-layer template="fill">
      <div class="fl jc-end p1">
        <span class="badge">${emoji} ${catLabel}</span>
        <div class="sp12"></div>
        <h1 style="font-size:28px;font-weight:900;color:#fff;line-height:1.2;margin:0;">${trunc(title, 55)}</h1>
        <div class="sp8"></div>
        <p style="font-size:12px;color:rgba(255,255,255,.6);margin:0;">Zen Caps Blog · Ciência do Sono</p>
      </div>
    </amp-story-grid-layer>
  </amp-story-page>

  <!-- 2. VOCÊ SABIA? -->
  <amp-story-page id="p2" auto-advance-after="7s">
    <amp-story-grid-layer template="fill" style="background:#F4F8FC;"></amp-story-grid-layer>
    <amp-story-grid-layer template="fill">
      <div class="fl jc-center p2">
        <div class="card">
          <p style="font-size:36px;margin:0 0 10px;">${emoji}</p>
          <p class="lbl">Você sabia?</p>
          <p class="body-t">${trunc(excerpt, 160)}</p>
        </div>
      </div>
    </amp-story-grid-layer>
  </amp-story-page>

  <!-- 3. PONTOS-CHAVE -->
  <amp-story-page id="p3" auto-advance-after="9s">
    <amp-story-grid-layer template="fill" style="background:#0D1B3E;"></amp-story-grid-layer>
    <amp-story-grid-layer template="fill">
      <div class="fl jc-center" style="padding:0 32px;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:${color};margin:0 0 18px;">📚 O que você vai aprender</p>
        ${bullets.map(b => `<div class="bullet"><span class="dot">◆</span><span class="btxt">${b}</span></div>`).join('\n        ')}
      </div>
    </amp-story-grid-layer>
  </amp-story-page>

  <!-- 4. RESPOSTA RÁPIDA -->
  <amp-story-page id="p4" auto-advance-after="8s">
    <amp-story-grid-layer template="fill" style="background:#F4F8FC;"></amp-story-grid-layer>
    <amp-story-grid-layer template="fill">
      <div class="fl jc-center p2">
        <div class="card">
          <p class="lbl">💡 Resposta rápida</p>
          <p class="body-t">${trunc(quickAnswer || excerpt, 210)}</p>
        </div>
      </div>
    </amp-story-grid-layer>
  </amp-story-page>

  <!-- 5. CTA -->
  <amp-story-page id="p5">
    <amp-story-grid-layer template="fill" style="background:linear-gradient(160deg,#0D1B3E 0%,#172851 100%);"></amp-story-grid-layer>
    <amp-story-grid-layer template="fill">
      <div class="fl jc-center" style="padding:0 36px;text-align:center;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:${color};margin:0 0 16px;">Zen Caps</p>
        <h1 style="font-size:26px;font-weight:900;color:#fff;line-height:1.25;margin:0 0 8px;">Durma melhor.<br>Controle a ansiedade.</h1>
        <h2 style="font-size:26px;font-weight:900;color:${color};margin:0 0 12px;">Sem tarja preta.</h2>
        <p style="font-size:11px;color:rgba(255,255,255,.45);margin:0 0 28px;">Melatonina · Triptofano · Magnésio · B6</p>
        <a href="${articleUrl}" class="cta-g">📖 Ler artigo completo</a>
        <div class="sp12"></div>
        <a href="https://zencaps.com.br" class="cta-o">Conheça o Zen Caps →</a>
      </div>
    </amp-story-grid-layer>
  </amp-story-page>

</amp-story>
</body>
</html>`
}

// ── hex → rgb ────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md')).sort()
  console.log(`\n🚀 Zen Caps — Web Stories v3 (safe zone fix)`)
  console.log(`📁 ${files.length} artigos\n${'─'.repeat(60)}`)

  let ok = 0, skip = 0, fail = 0
  const results = []

  for (const file of files) {
    const slug       = file.replace('.md', '')
    const storySlug  = `${slug}-story`
    const raw        = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
    const article    = parseFrontmatter(raw)

    if (!article?.title) { console.log(`⚠️  ${slug} — sem frontmatter`); skip++; continue }

    const cat      = article.category.toLowerCase()
    const color    = CAT_COLOR[cat]    || '#1DB8E8'
    const catLabel = CAT_LABEL[cat]    || 'Zen Caps'
    const emoji    = CAT_EMOJI[cat]    || '✨'

    // Verifica/atualiza story existente
    const chk      = await fetch(`${WP_URL}/wp-json/web-stories/v1/web-story?slug=${storySlug}&per_page=1`, { headers: { Authorization: `Basic ${AUTH}` } })
    const existing = await chk.json()
    const existId  = Array.isArray(existing) && existing.length > 0 ? existing[0].id : null

    const body = JSON.stringify({
      title:      article.title,
      slug:       storySlug,
      status:     'draft',
      content:    generateAMP(article, slug, color, catLabel, emoji),
      story_data: makeStoryData(article, slug, color, catLabel, emoji),
    })

    const method = existId ? 'PUT' : 'POST'
    const url    = existId
      ? `${WP_URL}/wp-json/web-stories/v1/web-story/${existId}`
      : `${WP_URL}/wp-json/web-stories/v1/web-story`

    const res    = await fetch(url, { method, headers: { Authorization: `Basic ${AUTH}`, 'Content-Type': 'application/json' }, body })
    const result = await res.json()

    if (result.id) {
      const editUrl = `${WP_URL}/wp-admin/post.php?post=${result.id}&action=edit`
      console.log(`✅ ${trunc(article.title, 48)} → ID ${result.id}${existId ? ' (atualizada)' : ''}`)
      results.push({ title: article.title, id: result.id, editUrl })
      ok++
    } else {
      console.log(`❌ ${slug} — ${result.message || result.code || JSON.stringify(result).slice(0, 80)}`)
      fail++
    }

    await new Promise(r => setTimeout(r, 600))
  }

  console.log(`\n${'─'.repeat(60)}\n📊 ✅ ${ok}  ⏭️  ${skip}  ❌ ${fail}`)
  console.log(`\n📝 ${WP_URL}/wp-admin/edit.php?post_type=web-story\n`)
}

main().catch(err => { console.error('💥', err.message); process.exit(1) })
