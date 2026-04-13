#!/usr/bin/env node
/**
 * optimize-images.mjs
 * Comprime imagens WebP do blog mantendo 1200px de largura (requisito Google Discover)
 * Uso: node optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat, writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const IMAGES_DIR = './public/images/blog';
// Google Discover exige min 1200px de largura para card com imagem grande
const MAX_WIDTH = 1200;
const QUALITY = 80;

async function optimizeImages() {
  const files = await readdir(IMAGES_DIR);
  const webpFiles = files.filter(f => f.endsWith('.webp'));

  console.log(`\n🖼️  Encontradas ${webpFiles.length} imagens WebP para otimizar`);
  console.log(`   Max largura: ${MAX_WIDTH}px | Qualidade: ${QUALITY}\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let optimized = 0;
  let tooSmall = 0;

  for (const file of webpFiles) {
    const filePath = join(IMAGES_DIR, file);
    const originalBuffer = await readFile(filePath);
    const before = originalBuffer.length;
    totalBefore += before;

    try {
      const image = sharp(originalBuffer);
      const metadata = await image.metadata();

      // Só redimensiona se for MAIOR que MAX_WIDTH
      const pipeline = metadata.width > MAX_WIDTH
        ? image.resize(MAX_WIDTH, null, { withoutEnlargement: true })
        : image;

      // Aviso se a imagem original já é menor que 1200px
      if (metadata.width < 1200) {
        tooSmall++;
      }

      const optimizedBuffer = await pipeline
        .webp({ quality: QUALITY, effort: 6 })
        .toBuffer();

      // Só substitui se ficou menor
      if (optimizedBuffer.length < before) {
        await writeFile(filePath, optimizedBuffer);
        const after = optimizedBuffer.length;
        totalAfter += after;
        const saved = ((1 - after / before) * 100).toFixed(1);
        const dims = metadata.width > MAX_WIDTH
          ? `${metadata.width}→${MAX_WIDTH}px`
          : `${metadata.width}px`;
        console.log(`  ✅ ${file}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${saved}%) [${dims}]`);
        optimized++;
      } else {
        totalAfter += before;
        console.log(`  ⏭️  ${file}: já otimizada (${(before/1024).toFixed(0)}KB) [${metadata.width}px]`);
      }
    } catch (err) {
      totalAfter += before;
      console.error(`  ❌ ${file}: erro — ${err.message}`);
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Imagens otimizadas: ${optimized}/${webpFiles.length}`);
  console.log(`   Antes:  ${(totalBefore/1024/1024).toFixed(2)} MB`);
  console.log(`   Depois: ${(totalAfter/1024/1024).toFixed(2)} MB`);
  console.log(`   Economia: ${((1 - totalAfter/totalBefore) * 100).toFixed(1)}%`);
  if (tooSmall > 0) {
    console.log(`   ⚠️  ${tooSmall} imagem(s) com largura < 1200px (ideal para Google Discover)`);
  }
  console.log();
}

optimizeImages().catch(console.error);
