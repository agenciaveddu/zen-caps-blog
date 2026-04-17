// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://zencaps.com.br',
  output: 'static',
  compressHTML: true,
  trailingSlash: 'always',
  build: {
    // Inlineia CSS no HTML — elimina requisição extra (render-blocking)
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.endsWith('https://zencaps.com.br/') &&
        !page.includes('/keystatic') &&
        // Exclui páginas de paginação do sitemap (listagens, não conteúdo único)
        !/\/blog\/\d+\/$/.test(page),
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
