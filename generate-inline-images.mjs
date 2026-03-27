const RUNWARE_API_KEY = 'akonTJA3Btwjw7zNAYyy1lJ0jyovzniM'
const API_URL = 'https://api.runware.ai/v1'
const OUTPUT_DIR = './public/images/blog'
import fs from 'fs'
import path from 'path'

const images = [
  {
    filename: 'inline-divida-sono-ciclos.webp',
    prompt: '3D render of sleep debt visualization, stack of glowing blue sleep cycles represented as translucent discs being depleted day by day, dark background with cyan energy fading, scientific infographic concept, premium wellness aesthetic, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, people, faces',
  },
  {
    filename: 'inline-respiracao-nervo-vago.webp',
    prompt: '3D render of human torso cross-section showing glowing vagus nerve pathway from brain stem through chest to abdomen, breathing air flow visualized as blue light waves, calm nervous system activation concept, dark background, biopunk medical illustration, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, faces',
  },
  {
    filename: 'inline-box-breathing-diagram.webp',
    prompt: '3D render of geometric box or square floating in dark space with glowing cyan arrows flowing along each side — inhale top, hold right, exhale bottom, hold left — breathing cycle visualization, golden particles tracing the path, premium wellness concept, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'inline-celular-7dias-protocolo.webp',
    prompt: '3D render of minimalist dark bedroom with glowing calendar showing 7 days, phone charging station outside bedroom door with lock symbol, peaceful blue ambient light, phone-free sleep environment concept, modern design, photorealistic illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, people',
  },
  {
    filename: 'inline-cronotipo-coruja.webp',
    prompt: '3D render of an owl and a lark bird on opposite ends of a glowing circadian clock, dark galaxy background, owl glowing amber on night side, lark glowing gold on morning side, chronotype concept, scientific wellness illustration, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'inline-b6-medicamentos.webp',
    prompt: '3D render of vitamin B6 molecule glowing in cyan being blocked by red pharmaceutical pill capsules forming a barrier, molecular pathway visualization, dark background, nutrient depletion concept, biopunk aesthetic, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon, faces',
  },
]

async function generateImage(img) {
  console.log(`Gerando: ${img.filename}`)
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RUNWARE_API_KEY}` },
    body: JSON.stringify([{ taskType: 'imageInference', taskUUID: crypto.randomUUID(), positivePrompt: img.prompt, negativePrompt: img.negativePrompt, model: 'runware:100@1', width: 1280, height: 704, numberResults: 1, outputFormat: 'WEBP', outputType: 'URL', CFGScale: 7, steps: 28 }]),
  })
  const data = await res.json()
  const imageUrl = data?.data?.[0]?.imageURL
  if (!imageUrl) throw new Error(`No URL: ${JSON.stringify(data).slice(0,200)}`)
  const imgRes = await fetch(imageUrl)
  const buffer = await imgRes.arrayBuffer()
  fs.writeFileSync(path.join(OUTPUT_DIR, img.filename), Buffer.from(buffer))
  console.log(`OK: ${img.filename} (${Math.round(buffer.byteLength/1024)}KB)`)
}

for (const img of images) {
  try { await generateImage(img) } catch(e) { console.error(`ERRO ${img.filename}: ${e.message}`) }
  await new Promise(r => setTimeout(r, 800))
}
console.log('Pronto!')
