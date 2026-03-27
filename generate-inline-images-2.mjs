const RUNWARE_API_KEY = 'akonTJA3Btwjw7zNAYyy1lJ0jyovzniM'
const API_URL = 'https://api.runware.ai/v1'
const OUTPUT_DIR = './public/images/blog'
import fs from 'fs'
import path from 'path'

const images = [
  {
    filename: 'inline-melatonina-pineal-3d.webp',
    prompt: '3D render of the pineal gland glowing in the center of a translucent human brain, emitting soft golden melatonin molecules into the bloodstream, dark space background with subtle circadian wave patterns, biopunk medical illustration, photorealistic wellness aesthetic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, people, faces, realistic person',
  },
  {
    filename: 'inline-melatonina-ritmo-circadiano.webp',
    prompt: '3D render of a glowing circadian rhythm curve graph floating in dark space, melatonin level rising at night shown as blue glowing wave, cortisol rising at dawn shown as golden wave, 24-hour clock overlay with night sky and sunrise gradients, scientific data visualization, premium health concept',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, people',
  },
  {
    filename: 'inline-triptofano-molecular-3d.webp',
    prompt: '3D render of tryptophan amino acid molecule transforming into serotonin then melatonin, glowing molecular chain with cyan-to-purple gradient, arrows showing conversion pathway, dark background with particle effects, biopunk molecular visualization, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, faces',
  },
  {
    filename: 'inline-triptofano-barreira-cerebral.webp',
    prompt: '3D render of the blood-brain barrier as a glowing translucent wall, tryptophan molecules (cyan glowing) competing with BCAA molecules (orange) to pass through protein transporters, cross-section view, scientific neuroscience illustration, dark background, photorealistic biopunk aesthetic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, faces, people',
  },
  {
    filename: 'inline-alimentos-sono-prato-3d.webp',
    prompt: '3D isometric render of a dark elegant dinner plate with glowing sleep-promoting foods: kiwi, cherry, walnuts, salmon, banana, oatmeal arranged artistically, soft blue bioluminescent glow around each item, dark navy background, wellness food photography style, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, people, hands',
  },
  {
    filename: 'inline-alimentos-cardapio-3d.webp',
    prompt: '3D render of a weekly meal calendar displayed as floating holographic panels in dark space, each day showing a different healthy plate with tryptophan-rich foods glowing gently, isometric perspective, wellness nutrition concept, cyan and gold accents, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, people',
  },
  {
    filename: 'inline-sono-profundo-ondas-3d.webp',
    prompt: '3D render of slow delta brain waves as tall glowing blue wave forms floating in dark space, EEG visualization concept with pulsing deep sleep waves, brain silhouette in background emitting rhythmic energy pulses, premium medical visualization, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, faces, people',
  },
  {
    filename: 'inline-sono-profundo-recuperacao.webp',
    prompt: '3D render of human body silhouette in deep sleep position with glowing repair processes visible: muscle fibers regenerating (gold), brain lymphatic cleaning system active (blue), immune cells activating (green), hormone release shown as particles, dark background, biopunk medical concept, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, realistic face, nudity',
  },
  {
    filename: 'inline-estresse-cortisol-hpa-3d.webp',
    prompt: '3D render of the HPA axis as glowing anatomical pathway: hypothalamus to pituitary to adrenal gland, cortisol molecules flowing downward as orange-red particles, stress cycle visualization, dark background with tension energy effects, biopunk medical illustration, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, faces, people',
  },
  {
    filename: 'inline-estresse-sistemas-corporais.webp',
    prompt: '3D render of a human body silhouette with multiple organ systems highlighted in different colors showing stress impact: red heart, orange brain, yellow stomach, green immune cells, dark background with cortisol particles surrounding the figure, systemic stress concept, biopunk medical visualization, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, realistic face, nudity',
  },
  {
    filename: 'inline-meditacao-body-scan-3d.webp',
    prompt: '3D render of a human figure lying in meditation pose on a floating platform in dark serene space, body scan visualization with gentle blue light sweeping from feet upward through the body, peaceful ambient particles, calm nervous system concept, wellness illustration, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, realistic face, nudity',
  },
  {
    filename: 'inline-cronotipos-relogio-3d.webp',
    prompt: '3D render of a large glowing circadian clock in dark space with five chronotype zones marked by different colored light arcs: early morning gold, morning amber, midday white, evening purple, night blue, clock face showing 24 hours, scientific concept art, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, people',
  },
  {
    filename: 'inline-sintomas-privacao-cerebro-3d.webp',
    prompt: '3D render of two brain cross-sections side by side: left brain glowing healthy vibrant blue (well-rested), right brain dimmed with grey areas and flickering connections (sleep deprived), dark background, neuroscience comparison visualization, biopunk medical concept, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, faces, people',
  },
  {
    filename: 'inline-magnesio-tipos-3d.webp',
    prompt: '3D render of different magnesium supplement forms as glowing molecular crystal structures floating in dark space: glycinate (cyan), malate (green), oxide (grey faded), citrate (blue), each with different glow intensity representing bioavailability, scientific comparison visualization, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'inline-suplementos-ansiedade-stack-3d.webp',
    prompt: '3D render of three glowing supplement capsules arranged in a triangular stack in dark space: magnesium (blue crystal), tryptophan (purple molecular structure), melatonin (gold crescent moon), connected by glowing synergy lines, wellness supplement synergy concept, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, people, faces',
  },
]

async function generateImage(img) {
  const outPath = path.join(OUTPUT_DIR, img.filename)
  if (fs.existsSync(outPath)) {
    console.log(`⏭️  Já existe: ${img.filename}`)
    return
  }
  console.log(`🎨 Gerando: ${img.filename}`)
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RUNWARE_API_KEY}` },
    body: JSON.stringify([{
      taskType: 'imageInference',
      taskUUID: crypto.randomUUID(),
      positivePrompt: img.prompt,
      negativePrompt: img.negativePrompt,
      model: 'runware:100@1',
      width: 1280,
      height: 704,
      numberResults: 1,
      outputFormat: 'WEBP',
      outputType: 'URL',
      CFGScale: 7,
      steps: 28
    }]),
  })
  const data = await res.json()
  const imageUrl = data?.data?.[0]?.imageURL
  if (!imageUrl) throw new Error(`Sem URL: ${JSON.stringify(data).slice(0, 200)}`)
  const imgRes = await fetch(imageUrl)
  const buffer = await imgRes.arrayBuffer()
  fs.writeFileSync(outPath, Buffer.from(buffer))
  console.log(`✅ ${img.filename} (${Math.round(buffer.byteLength / 1024)}KB)`)
}

console.log(`🚀 Gerando ${images.length} imagens inline...\n`)
for (const img of images) {
  try {
    await generateImage(img)
  } catch (e) {
    console.error(`❌ ERRO ${img.filename}: ${e.message}`)
  }
  await new Promise(r => setTimeout(r, 1000))
}
console.log('\n✅ Concluído!')
