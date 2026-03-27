/**
 * Gera imagens para todos os artigos novos do blog Zen Caps
 */

const RUNWARE_API_KEY = 'akonTJA3Btwjw7zNAYyy1lJ0jyovzniM'
const API_URL = 'https://api.runware.ai/v1'
const OUTPUT_DIR = './public/images/blog'

import fs from 'fs'
import path from 'path'

const images = [
  {
    filename: 'insonia-cronica-causas-e-tratamentos.webp',
    prompt: '3D render of a person lying in bed awake at night, dark bedroom with moonlight streaming through curtains, floating clock showing late hours, soft blue and purple tones, sleeplessness and insomnia concept, photorealistic wellness illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'quanto-tempo-preciso-dormir-por-noite.webp',
    prompt: '3D render of a large glowing clock surrounded by sleeping stars and moon symbols, cozy bedroom background, soft golden and blue lighting, sleep duration science concept, modern wellness aesthetic, photorealistic 3D illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'ansiedade-noturna-como-tratar.webp',
    prompt: '3D render of a brain with glowing anxiety waves at night, dark background with calming blue and purple light halos, neuroscience and mental wellness concept, floating calming particles dissolving tension, photorealistic 3D render',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'melatonina-como-funciona-no-corpo.webp',
    prompt: '3D render of a glowing melatonin molecule floating in a dark blue space, pineal gland brain anatomy in background with soft luminescent light, golden and cyan molecular bonds, sleep hormone science illustration, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'respiracao-para-ansiedade-tecnicas.webp',
    prompt: '3D render of a person breathing deeply with visible glowing breath waves flowing out in calming blue and gold, lungs visible as translucent glowing organs, peaceful dark background, mindfulness and breathing technique concept, photorealistic wellness art',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'alimentos-que-ajudam-a-dormir-melhor.webp',
    prompt: '3D render of healthy sleep foods floating in space — banana, almonds, warm milk glass, cherries, dark chocolate — surrounded by soft golden glow, dark background, sleep nutrition concept, photorealistic 3D food illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'sono-profundo-como-conseguir-mais.webp',
    prompt: '3D render of deep sleep brainwave visualization, dark bedroom with person sleeping peacefully, glowing blue delta brainwaves floating above, sleep science and neuroscience concept, modern wellness aesthetic, photorealistic illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'estresse-cronico-consequencias-para-saude.webp',
    prompt: '3D render of a stressed human silhouette with glowing red cortisol molecules around the brain and body, dark background with orange and red tension waves, chronic stress health concept, photorealistic medical illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'triptofano-para-que-serve-beneficios.webp',
    prompt: '3D render of tryptophan amino acid molecule glowing in golden light, serotonin and melatonin conversion pathway illustrated with glowing arrows in blue and gold, dark background, supplement science concept, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'celular-antes-de-dormir-prejudica-sono.webp',
    prompt: '3D render of a smartphone screen emitting blue light in a dark bedroom, blue light waves disrupting a sleeping brain nearby, alarm clock in background, sleep disruption concept, dark moody blue tones, photorealistic wellness illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'dormir-cedo-beneficios-para-saude.webp',
    prompt: '3D render of an early bedtime scene, cozy bedroom with warm lamp, moon rising through window, person settling into bed at 10pm, golden and navy blue tones, healthy sleep schedule concept, photorealistic lifestyle illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'magnesio-para-sono-e-ansiedade.webp',
    prompt: '3D render of magnesium mineral crystals and supplement capsules floating in dark blue space, glowing crystalline structures in white and blue tones, GABA neurotransmitter molecules nearby, sleep and relaxation mineral concept, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'como-relaxar-antes-de-dormir-rotina.webp',
    prompt: '3D render of a calming bedtime routine scene, herbal tea on nightstand, warm dim lamp, lavender candle, open book, soft golden and purple lighting, cozy bedroom atmosphere, wellness lifestyle concept, photorealistic 3D illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'sintomas-de-falta-de-sono-no-corpo.webp',
    prompt: '3D render of a tired human body silhouette with glowing orange warning indicators on brain, eyes, heart and immune system, dark background, sleep deprivation health effects concept, medical wellness illustration, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'suplementos-naturais-para-ansiedade.webp',
    prompt: '3D render of natural supplement capsules and herbs floating in dark space — passionflower, valerian root, ashwagandha — surrounded by golden calming energy waves, supplement science and nature concept, photorealistic illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'vitamina-b6-serotonina-e-sono.webp',
    prompt: '3D render of vitamin B6 molecule structure glowing in amber and gold, serotonin neurotransmitter pathway in blue light connecting to a sleeping brain, dark background, neuronutrition science concept, photorealistic medical illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'meditacao-para-insonia-como-praticar.webp',
    prompt: '3D render of a person meditating in lotus position on a floating platform in dark space, glowing golden mindfulness energy rings around them, stars and moon in background, insomnia meditation concept, photorealistic wellness art',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'como-acordar-disposto-sem-cansaco.webp',
    prompt: '3D render of a person waking up energized in the morning, sunrise light through window, bright golden rays, alarm clock showing early hour, refreshed and vital energy concept, warm golden and blue tones, photorealistic lifestyle illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'cafeina-e-sono-quanto-afeta.webp',
    prompt: '3D render of a coffee cup with glowing caffeine molecules rising as steam in dark background, adenosine receptor blocking mechanism illustrated with molecular diagrams in red and orange, sleep disruption concept, photorealistic scientific illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'acido-folico-saude-cerebral-sono.webp',
    prompt: '3D render of folic acid vitamin B9 molecular structure glowing in green and gold, brain silhouette in background with neural network connections, cognitive health and sleep supplement concept, dark background, photorealistic medical illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'exercicio-fisico-melhora-sono.webp',
    prompt: '3D render of a running figure transforming into a peacefully sleeping person, physical exercise to sleep quality journey, glowing blue and golden energy, endorphin molecules floating, wellness lifestyle concept, dark background, photorealistic illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'ansiedade-generalizada-tratamento-natural.webp',
    prompt: '3D render of a calm serene person surrounded by floating natural remedy elements — herbs, supplements capsules, breathing waves — anxiety dissolving into tranquility, soft blue and golden light, mental wellness concept, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'apneia-do-sono-o-que-e-sintomas.webp',
    prompt: '3D render of airway cross-section anatomy with glowing obstruction visualization during sleep apnea, oxygen molecules and breathing disruption concept, dark blue medical illustration, sleep disorder science, photorealistic medical art',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'tecnicas-de-relaxamento-muscular-para-dormir.webp',
    prompt: '3D render of a human body silhouette with muscles progressively relaxing shown as glowing tension releasing from head to toe, dark background with calming blue waves, progressive muscle relaxation concept, photorealistic wellness illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'zen-caps-composicao-completa-ingredientes.webp',
    prompt: '3D render of premium supplement capsules opened to reveal floating natural ingredients — melatonin crystals, magnesium minerals, tryptophan molecules, vitamin B6 — dark luxurious background with golden and blue bokeh lights, product and science concept, photorealistic',
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
  console.log('🚀 Gerando imagens para 25 artigos...\n')

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const results = []
  let count = 0

  for (const img of images) {
    const outputPath = path.join(OUTPUT_DIR, img.filename)
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Pulando ${img.filename} (já existe)`)
      continue
    }
    count++
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
