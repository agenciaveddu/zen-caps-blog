// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://zencaps.com.br',
  output: 'static',
  compressHTML: true,
  build: {
    // Inlineia CSS no HTML — elimina requisição extra (render-blocking)
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      // Exclude root redirect page and keystatic admin from sitemap
      filter: (page) =>
        !page.endsWith('https://zencaps.com.br/') &&
        !page.includes('/keystatic'),
    }),
  ],
  image: {
    // Otimiza imagens automaticamente no build
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        quality: 80,
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // CSS code splitting para carregar apenas o necessário
      cssCodeSplit: true,
    },
  },
});
