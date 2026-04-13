/**
 * Gera imagens de capa para os 14 artigos de abril (02/04–15/04)
 */

const RUNWARE_API_KEY = 'akonTJA3Btwjw7zNAYyy1lJ0jyovzniM'
const API_URL = 'https://api.runware.ai/v1'
const OUTPUT_DIR = './public/images/blog'

import fs from 'fs'
import path from 'path'

const images = [
  {
    filename: 'alcool-prejudica-sono.webp',
    prompt: '3D render of a wine glass with red liquid casting a red glow on a dark bedroom scene, glowing sleep wave disruption pattern above, fragmented sleep cycle visualization with broken arcs, alcohol molecule structure floating nearby, dark moody tones of red and deep blue, sleep science concept, photorealistic wellness illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'burnout-como-identificar-recuperar.webp',
    prompt: '3D render of an exhausted glowing human brain with dim flickering light, dark background, empty battery indicator overlaid, stress cortisol molecules in red and orange floating around, burnout and mental exhaustion concept, emotional depletion science visualization, photorealistic medical illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'valeriana-para-que-serve.webp',
    prompt: '3D render of valerian plant root and flowers in rich purple and cream tones, floating botanical extract capsules, GABA neurotransmitter molecules glowing in soft green-blue light, dark background with botanical and scientific elements, natural sleep supplement science concept, photorealistic illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'cronotipo-o-que-e-matutino-vespertino.webp',
    prompt: '3D render of a glowing sun and moon orbiting a large biological clock face, DNA double helix with circadian rhythm light patterns, split warm gold morning light and cool blue night light, chronotype science concept, photorealistic scientific illustration, dark background',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'jet-lag-como-amenizar.webp',
    prompt: '3D render of a glowing world globe with flight path arc crossing time zones, circadian clock disruption visualization with misaligned clock overlays in different world regions, melatonin molecule floating in dark space, jet lag and time zone science concept, dark navy background, photorealistic scientific illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'ashwagandha-ansiedade-e-sono.webp',
    prompt: '3D render of ashwagandha root and berries with golden warm glow, withanolide molecule structure floating nearby, cortisol molecule being reduced by calming green energy waves, adaptogen botanical supplement science, dark background with earth tones and gold, photorealistic illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'ansiedade-social-sintomas-tratamento.webp',
    prompt: '3D render of a glowing brain with amygdala highlighted in orange-red representing social anxiety, protective neural shield forming around it in blue light, social connection nodes in background as soft bokeh, anxiety treatment and neuroscience concept, dark background, photorealistic medical illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'despertar-de-madrugada-causas-solucoes.webp',
    prompt: '3D render of a dark bedroom with a glowing alarm clock showing 3am, sleep cycle arc diagram floating above with highlighted REM disruption point, cortisol molecule rising in warm orange glow, middle-of-night awakening science concept, dark blue and amber tones, photorealistic wellness illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'l-teanina-calma-sem-sonolencia.webp',
    prompt: '3D render of green tea leaves and L-theanine amino acid molecule glowing in soft jade green and white light, alpha brainwave pattern visualization in blue above, calm focus without drowsiness concept, GABA and glutamate molecular balance, dark background, photorealistic scientific illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'sono-em-idosos-por-que-muda.webp',
    prompt: '3D render of a pineal gland cross-section with dramatically reduced melatonin production shown as dim fading light compared to a brighter young version, sleep architecture chart with reduced N3 deep sleep bars, aging and circadian rhythm concept, dark blue and silver tones, photorealistic medical illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'ansiedade-no-trabalho-como-controlar.webp',
    prompt: '3D render of a glowing human brain with stress cortisol waves in red-orange emanating from prefrontal cortex, work pressure concept with clock and task nodes floating in chaotic orbit, calming breathing wave cutting through tension in blue, occupational anxiety science, dark background, photorealistic medical illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'ruido-branco-para-dormir-funciona.webp',
    prompt: '3D render of sound wave visualization with white noise frequency spectrum in shades of white and silver, dark bedroom background, sound masking concept with irregular noise spikes being smoothed into constant wave, sleep audio science concept, dark background with white and blue sound wave art, photorealistic illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'camomila-cha-efeitos-no-sono.webp',
    prompt: '3D render of chamomile flowers and a steaming herbal tea cup with golden warm glow, apigenin flavonoid molecule structure floating nearby connecting to GABA receptor diagram in soft green-blue light, natural sleep remedy science concept, dark background with amber and cream botanical tones, photorealistic illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
  },
  {
    filename: 'temperatura-do-quarto-ideal-para-dormir.webp',
    prompt: '3D render of a bedroom cross-section showing 18-20°C temperature visualization with blue cooling waves, human body core temperature drop illustrated as glowing blue thermometer going down, peripheral vasodilation concept with warm orange glow at extremities, sleep thermoregulation science, dark background, photorealistic medical illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, person, face',
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

  const result = data?.data?.[0] || data?.[0]
  const imageUrl = result?.imageURL || result?.url || result?.imageUrl

  if (!imageUrl) {
    throw new Error(`No image URL in response: ${JSON.stringify(data).slice(0, 500)}`)
  }

  console.log(`✅ URL recebida`)

  const imgResponse = await fetch(imageUrl)
  if (!imgResponse.ok) throw new Error(`Failed to download image: ${imgResponse.status}`)

  const buffer = await imgResponse.arrayBuffer()
  const outputPath = path.join(OUTPUT_DIR, imageConfig.filename)
  fs.writeFileSync(outputPath, Buffer.from(buffer))

  console.log(`💾 Salvo: ${outputPath} (${Math.round(buffer.byteLength / 1024)}KB)`)
  return outputPath
}

async function main() {
  console.log('🚀 Gerando 14 imagens de capa para artigos de abril...\n')

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
    await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\n📊 Resultado: ${results.filter(r => r.success).length} geradas, ${results.filter(r => !r.success).length} erros`)
  results.filter(r => !r.success).forEach(r => console.log(`  ❌ ${r.filename}: ${r.error}`))
  console.log('\n✅ Pronto!')
}

main().catch(console.error)
