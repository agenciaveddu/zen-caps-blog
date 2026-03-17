/**
 * Gera imagens para o blog Zen Caps usando a API Runware
 */

const RUNWARE_API_KEY = 'akonTJA3Btwjw7zNAYyy1lJ0jyovzniM'
const API_URL = 'https://api.runware.ai/v1'
const OUTPUT_DIR = './public/images/blog'

import fs from 'fs'
import path from 'path'
import { createWriteStream } from 'fs'

const images = [
  {
    filename: 'como-dormir-melhor-guia-completo.webp',
    prompt: '3D render of a serene bedroom at night, soft blue and golden lighting, moon visible through window, floating sleep symbols like stars and zzz, peaceful and modern, health and wellness product aesthetic, photorealistic 3D illustration',
    negativePrompt: 'text, watermark, cartoon, ugly, low quality, blurry',
  },
  {
    filename: 'como-controlar-ansiedade-naturalmente.webp',
    prompt: '3D render of a person meditating in lotus position, surrounded by floating glowing particles and calming energy waves in blue and golden colors, serene dark background with soft light, wellness and mental health concept, high quality 3D illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'melatonina-triptofano-magnesio-sono.webp',
    prompt: '3D render of pharmaceutical capsules and natural crystals floating in space, blue cyan and golden colors, melatonin molecule structure, supplements and science concept, dark blue background with bokeh lights, modern medical aesthetic, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry',
  },
  {
    filename: 'rotina-noturna-para-dormir-melhor.webp',
    prompt: '3D render of a cozy bedroom nighttime routine scene, warm lamp light, book on bedside table, herbal tea, calm and peaceful atmosphere, golden and blue tones, modern interior design, wellness lifestyle concept, photorealistic 3D illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
]

async function generateImage(imageConfig) {
  console.log(`\n🎨 Gerando: ${imageConfig.filename}`)

  const requestBody = [
    {
      taskType: 'imageInference',
      taskUUID: crypto.randomUUID(),
      positivePrompt: imageConfig.prompt,
      negativePrompt: imageConfig.negativePrompt,
      model: 'runware:100@1',
      width: 1280,
      height: 704,
      numberResults: 1,
      outputFormat: 'WEBP',
      outputType: 'URL',
      CFGScale: 7,
      steps: 28,
    }
  ]

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RUNWARE_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  console.log('API response:', JSON.stringify(data).slice(0, 200))

  // Find the imageURL in the response
  const result = data?.data?.[0] || data?.[0]
  const imageUrl = result?.imageURL || result?.url || result?.imageUrl

  if (!imageUrl) {
    throw new Error(`No image URL in response: ${JSON.stringify(data).slice(0, 500)}`)
  }

  console.log(`✅ URL recebida: ${imageUrl.slice(0, 80)}...`)

  // Download the image
  const imgResponse = await fetch(imageUrl)
  if (!imgResponse.ok) throw new Error(`Failed to download image: ${imgResponse.status}`)

  const buffer = await imgResponse.arrayBuffer()
  const outputPath = path.join(OUTPUT_DIR, imageConfig.filename)
  fs.writeFileSync(outputPath, Buffer.from(buffer))

  console.log(`💾 Salvo em: ${outputPath} (${Math.round(buffer.byteLength / 1024)}KB)`)
  return outputPath
}

async function main() {
  console.log('🚀 Iniciando geração de imagens com Runware AI...')

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const results = []
  for (const img of images) {
    const outputPath = path.join(OUTPUT_DIR, img.filename)
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Pulando ${img.filename} (já existe)`)
      continue
    }
    try {
      await generateImage(img)
      results.push({ filename: img.filename, success: true })
    } catch (err) {
      console.error(`❌ Erro em ${img.filename}:`, err.message)
      results.push({ filename: img.filename, success: false, error: err.message })
    }
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log('\n📊 Resultado final:')
  results.forEach(r => console.log(r.success ? `  ✅ ${r.filename}` : `  ❌ ${r.filename}: ${r.error}`))
}

main().catch(console.error)
