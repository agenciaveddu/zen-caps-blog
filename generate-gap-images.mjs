const RUNWARE_API_KEY = 'akonTJA3Btwjw7zNAYyy1lJ0jyovzniM'
const API_URL = 'https://api.runware.ai/v1'
const OUTPUT_DIR = './public/images/blog'
import fs from 'fs'
import path from 'path'

const images = [
  {
    filename: 'melatonina-vs-magnesio-qual-tomar-primeiro.webp',
    prompt: '3D render of melatonin molecule and magnesium crystal side by side in dark blue space, glowing golden comparison scales between them, scientific decision concept, premium supplement aesthetic, photorealistic illustration',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'teste-sono-saudavel-checklist-10-pontos.webp',
    prompt: '3D render of a glowing sleep quality checklist floating in dark space, checkmarks in cyan and gold, sleeping brain in background with healthy blue waves, self-assessment health concept, modern wellness aesthetic, photorealistic',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
  },
  {
    filename: 'crise-de-ansiedade-agora-protocolo-5-minutos.webp',
    prompt: '3D render of a person breathing calmly surrounded by glowing blue calming waves dissolving red anxiety energy, dark background, emergency calm protocol concept, vagus nerve activation visualization, photorealistic wellness art',
    negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
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
