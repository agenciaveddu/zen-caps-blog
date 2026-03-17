/**
 * Zen Caps — Image Generation Script
 * Generates cover images for all blog posts using the Runware API.
 * Falls back to picsum.photos placeholder if API fails.
 *
 * Usage: node scripts/generate-images.mjs
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { randomUUID } from 'node:crypto'

// ── Config ────────────────────────────────────────────────────────────────────
const RUNWARE_API_KEY = 'akonTJA3Btwjw7zNAYyy1lJ0jyovzniM'
const RUNWARE_API_URL = 'https://api.runware.ai/v1'

// Resolve paths relative to this script file, handling spaces in path on Windows
const scriptDir = new URL('.', import.meta.url)
const CONTENT_DIR = new URL('../src/content/blog/', scriptDir).pathname
  .replace(/^\/([A-Z]:)/, '$1')   // strip leading / before drive letter on Windows
  .replace(/%20/g, ' ')            // decode URL-encoded spaces
const IMAGES_DIR = new URL('../public/images/blog/', scriptDir).pathname
  .replace(/^\/([A-Z]:)/, '$1')
  .replace(/%20/g, ' ')

// ── Category prompts ──────────────────────────────────────────────────────────
const CATEGORY_PROMPTS = {
  sono: [
    'serene moonlit bedroom, soft blue ambient lighting, peaceful sleep atmosphere, premium wellness photography, dark navy tones, ethereal',
    'starry night sky above a calm bed, moonbeams casting gentle glow, sleep science aesthetic, deep blue and white tones',
    'dark tranquil bedroom interior, sleeping figure wrapped in white sheets, bioluminescent dust particles, cinematic blue light',
  ],
  ansiedade: [
    'calm zen meditation space, soft morning light filtering through sheer curtains, wellness aesthetic, muted blue and cream tones, peaceful',
    'serene zen garden with raked sand, bamboo, natural light, mindfulness photography, desaturated blue-green palette',
    'person meditating near water at dusk, tranquil atmosphere, anxiety relief, warm diffused light, wellness lifestyle',
  ],
  ingredientes: [
    'melatonin crystals and botanical herbs arranged on dark navy surface, science laboratory aesthetic, blue bioluminescent glow, premium supplement photography',
    'natural supplement capsules with medicinal plants, macro photography, dark background with cyan light accents, scientific editorial',
    'molecular structure visualization of melatonin with botanical ingredients, dark background, blue and gold color scheme, science magazine style',
  ],
  habitos: [
    'healthy morning routine at sunrise, yoga on a rooftop overlooking misty mountains, soft golden light, wellness lifestyle photography',
    'sunrise over calm water, person stretching at dawn, healthy habit concept, warm blue hour light, premium lifestyle',
    'balanced breakfast with supplements on a clean white table, morning light, wellness aesthetic, soft blue tones',
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse simple YAML-like frontmatter from a markdown string.
 * Returns { data: Object, body: string, raw: string }
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { data: {}, body: content, raw: '' }

  const raw = match[1]
  const data = {}

  for (const line of raw.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    data[key] = value
  }

  return { data, body: content.slice(match[0].length), raw }
}

/**
 * Rebuild markdown with updated frontmatter field.
 */
function setFrontmatterField(content, field, value) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return content

  const raw = match[1]
  const lines = raw.split('\n')

  // Remove existing field if present
  const filtered = lines.filter(l => !l.startsWith(`${field}:`))

  // Insert the new field after the first non-empty line (usually title)
  const insertAt = filtered.findIndex(l => l.trim() !== '') + 1
  filtered.splice(insertAt > 0 ? insertAt : 0, 0, `${field}: "${value}"`)

  const newFm = filtered.join('\n')
  return `---\n${newFm}\n---${content.slice(match[0].length)}`
}

/**
 * Pick a random prompt for a category.
 */
function getPrompt(category) {
  const prompts = CATEGORY_PROMPTS[category] ?? CATEGORY_PROMPTS.sono
  return prompts[Math.floor(Math.random() * prompts.length)]
}

/**
 * Download a binary URL and save to disk.
 */
async function downloadBinary(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  await writeFile(destPath, buffer)
}

/**
 * Call Runware API to generate an image.
 * Returns { imageURL: string } or throws.
 */
async function generateWithRunware(prompt) {
  const taskUUID = randomUUID()

  const body = JSON.stringify([
    {
      taskType: 'imageInference',
      taskUUID,
      positivePrompt: prompt + ', 8k resolution, professional photography, award winning',
      negativePrompt: 'text, watermark, logo, nsfw, blurry, low quality, ugly, distorted',
      model: 'runware:100@1',
      width: 1216,
      height: 640,
      numberResults: 1,
      outputFormat: 'WEBP',
    },
  ])

  const res = await fetch(RUNWARE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RUNWARE_API_KEY}`,
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Runware API error ${res.status}: ${text}`)
  }

  const json = await res.json()

  // Runware returns { data: [ { taskType, taskUUID, imageURL, ... } ] }
  const result = json?.data?.find(t => t.taskUUID === taskUUID)
  if (!result?.imageURL) {
    throw new Error(`No imageURL in Runware response: ${JSON.stringify(json).slice(0, 400)}`)
  }

  return result.imageURL
}

/**
 * Get a placeholder image URL from picsum.
 * We use a deterministic seed based on the slug so we get consistent images.
 */
function getPicsumUrl(slug) {
  // Use a hash of the slug as seed (simple djb2)
  let hash = 5381
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) + hash) ^ slug.charCodeAt(i)
  }
  const seed = Math.abs(hash) % 1000
  return `https://picsum.photos/seed/${seed}/1200/630`
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Ensure output directory exists
  if (!existsSync(IMAGES_DIR)) {
    await mkdir(IMAGES_DIR, { recursive: true })
  }

  // Get all .md files
  const files = (await readdir(CONTENT_DIR)).filter(f => f.endsWith('.md'))

  if (files.length === 0) {
    console.log('No .md files found in', CONTENT_DIR)
    return
  }

  console.log(`Found ${files.length} article(s). Starting image generation...\n`)

  for (const file of files) {
    const slug = basename(file, '.md')
    const filePath = join(CONTENT_DIR, file)
    const content = await readFile(filePath, 'utf-8')
    const { data } = parseFrontmatter(content)

    const category = data.category ?? 'sono'
    const destRelative = `/images/blog/${slug}.webp`
    const destAbsolute = join(IMAGES_DIR, `${slug}.webp`)

    console.log(`[${slug}]`)
    console.log(`  Category : ${category}`)

    // Skip if image already exists
    if (existsSync(destAbsolute)) {
      console.log(`  Skipping  : image already exists at ${destRelative}`)
      // Still update frontmatter if missing
      if (!data.coverImage) {
        const updated = setFrontmatterField(content, 'coverImage', destRelative)
        await writeFile(filePath, updated, 'utf-8')
        console.log(`  Updated   : frontmatter coverImage = ${destRelative}`)
      }
      console.log()
      continue
    }

    const prompt = getPrompt(category)
    console.log(`  Prompt   : ${prompt.slice(0, 80)}...`)

    let imageUrl
    let source = 'Runware'

    try {
      imageUrl = await generateWithRunware(prompt)
      console.log(`  Generated : ${imageUrl.slice(0, 60)}...`)
    } catch (err) {
      console.warn(`  Runware failed: ${err.message}`)
      console.warn(`  Falling back to picsum placeholder...`)
      imageUrl = getPicsumUrl(slug)
      source = 'Picsum'
    }

    try {
      await downloadBinary(imageUrl, destAbsolute)
      console.log(`  Saved     : ${destAbsolute} [${source}]`)
    } catch (dlErr) {
      console.error(`  Download failed: ${dlErr.message}`)
      console.log()
      continue
    }

    // Update frontmatter
    const updated = setFrontmatterField(content, 'coverImage', destRelative)
    await writeFile(filePath, updated, 'utf-8')
    console.log(`  Updated   : frontmatter coverImage = ${destRelative}`)
    console.log()
  }

  console.log('Done! All images processed.')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
