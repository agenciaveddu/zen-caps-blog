#!/usr/bin/env node
/**
 * generate-thumbnails.mjs
 * Gera versões thumbnail (660px) das imagens do blog para uso nos cards
 * As originais (1280px) ficam para artigos e Google Discover
 */

import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const IMAGES_DIR = './public/images/blog';
const THUMBS_DIR = './public/images/blog/thumbs';
const THUMB_WIDTH = 660;
const QUALITY = 78;

async function main() {
  await mkdir(THUMBS_DIR, { recursive: true });

  const files = await readdir(IMAGES_DIR);
  const webpFiles = files.filter(f => f.endsWith('.webp'));

  console.log(`\n🖼️  Gerando ${webpFiles.length} thumbnails (${THUMB_WIDTH}px)\n`);

  let totalOriginal = 0;
  let totalThumb = 0;

  for (const file of webpFiles) {
    const filePath = join(IMAGES_DIR, file);
    const thumbPath = join(THUMBS_DIR, file);

    try {
      const buffer = await readFile(filePath);
      totalOriginal += buffer.length;

      const thumb = await sharp(buffer)
        .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6 })
        .toBuffer();

      await writeFile(thumbPath, thumb);
      totalThumb += thumb.length;

      console.log(`  ✅ ${file}: ${(buffer.length/1024).toFixed(0)}KB → ${(thumb.length/1024).toFixed(0)}KB`);
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Originais: ${(totalOriginal/1024/1024).toFixed(2)} MB (1280px — artigos + Discover)`);
  console.log(`   Thumbnails: ${(totalThumb/1024/1024).toFixed(2)} MB (${THUMB_WIDTH}px — cards)`);
  console.log(`   Economia nos cards: ${((1 - totalThumb/totalOriginal) * 100).toFixed(1)}%\n`);
}

main().catch(console.error);
