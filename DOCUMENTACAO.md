# Documentação Técnica — Blog Zen Caps

> **Projeto:** Blog de conteúdo para a marca Zen Caps
> **URL de produção:** https://zencaps.com.br/blog
> **Repositório:** https://github.com/agenciaveddu/zen-caps-blog
> **Última atualização:** Março 2026

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Como Rodar Localmente](#4-como-rodar-localmente)
5. [Arquitetura de Páginas](#5-arquitetura-de-páginas)
6. [Layouts](#6-layouts)
7. [Componentes](#7-componentes)
8. [Schema dos Artigos (Frontmatter)](#8-schema-dos-artigos-frontmatter)
9. [Como Criar um Novo Artigo](#9-como-criar-um-novo-artigo)
10. [Sistema de Imagens](#10-sistema-de-imagens)
11. [Busca do Blog](#11-busca-do-blog)
12. [SEO e AEO](#12-seo-e-aeo)
13. [CTAs e Estratégia de Conversão](#13-ctas-e-estratégia-de-conversão)
14. [Deploy e CI/CD](#14-deploy-e-cicd)
15. [Integração com o Site Principal (Cloudflare Worker)](#15-integração-com-o-site-principal-cloudflare-worker)
16. [Scripts de Automação](#16-scripts-de-automação)
17. [Identidade Visual e Design System](#17-identidade-visual-e-design-system)
18. [Categorias de Conteúdo](#18-categorias-de-conteúdo)
19. [Decisões de Arquitetura](#19-decisões-de-arquitetura)

---

## 1. Visão Geral

O blog Zen Caps é um **site estático de conteúdo** construído com Astro, hospedado no Vercel e acessado pelo usuário via `zencaps.com.br/blog` (o domínio principal está num VPS/Cloudflare, e o `/blog` é roteado para o Vercel via Worker).

**Objetivo do blog:**
- Atrair tráfego orgânico do Google e das IAs (ChatGPT, Perplexity, etc.) com artigos sobre sono, ansiedade, melatonina e suplementação natural
- Converter leitores em compradores do Zen Caps via CTAs estratégicos ao longo dos artigos
- Construir autoridade de marca no nicho de saúde e bem-estar natural

**Estado atual:** 33 artigos publicados, todos com imagens IA (capa + inline), links internos entre artigos, Schema.org, sitemap e SEO completo.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão | Motivo |
|---|---|---|---|
| Framework | **Astro** | 6.x | Zero JS por padrão, excelente para blogs estáticos, Core Web Vitals máximo |
| Estilização | **Tailwind CSS** | 4.x (via Vite plugin) | Utility-first, rápido para prototipar |
| Tipagem | **TypeScript** | strict | Validação de frontmatter dos artigos em build time |
| Hospedagem | **Vercel** | Free tier | CDN global, CI/CD automático no push ao GitHub |
| Proxy de URL | **Cloudflare Worker** | — | Roteia `zencaps.com.br/blog*` para o Vercel |
| Busca | **Fuse.js** | CDN | Fuzzy search client-side, sem backend |
| Imagens IA | **Runware AI** | API v1 | Geração de renders 3D para capas e inline |

**Node.js:** `>=20.0.0` (obrigatório)

---

## 3. Estrutura de Pastas

```
zen-caps-blog/
│
├── src/
│   ├── content/
│   │   ├── config.ts               # Schema (Zod) de validação dos artigos
│   │   └── blog/
│   │       ├── melatonina-como-funciona-no-corpo.md
│   │       └── ...                 # 33 artigos em Markdown
│   │
│   ├── pages/
│   │   ├── index.astro             # Redirect 301 → /blog
│   │   ├── robots.txt.ts           # Robots.txt dinâmico
│   │   └── blog/
│   │       ├── index.astro         # Listagem de artigos (homepage do blog)
│   │       ├── [slug].astro        # Página individual de artigo
│   │       ├── busca.astro         # Página de busca
│   │       ├── search.json.ts      # Endpoint JSON para o índice de busca
│   │       ├── sitemap.xml.ts      # Sitemap dinâmico
│   │       └── categoria/
│   │           └── [cat].astro     # Listagem por categoria
│   │
│   ├── layouts/
│   │   ├── ArticleLayout.astro     # Layout completo de artigo (SEO + conversão)
│   │   └── BlogLayout.astro        # Layout base (header + footer) para listagens
│   │
│   ├── components/
│   │   ├── ArticleCard.astro       # Card de artigo nas listagens
│   │   ├── CTABanner.astro         # Banners de conversão (3 variantes)
│   │   ├── Header.astro            # Cabeçalho com navegação + busca
│   │   └── Footer.astro            # Rodapé com links e redes sociais
│   │
│   └── styles/
│       └── global.css              # Variáveis CSS, estilos base, classes utilitárias
│
├── public/
│   ├── images/
│   │   └── blog/                   # Todas as imagens dos artigos (.webp)
│   │       ├── melatonina-como-funciona-no-corpo.webp   # Imagem de capa
│   │       ├── inline-melatonina-pineal-3d.webp         # Imagem inline
│   │       └── ...
│   ├── favicon.svg
│   └── og-image.jpg               # OG image padrão do blog
│
├── astro.config.mjs               # Configuração do Astro (site URL, sitemap, Vite)
├── vercel.json                    # Instruções de build para o Vercel
├── package.json
├── tsconfig.json
│
└── [Scripts de automação — ver seção 16]
```

---

## 4. Como Rodar Localmente

### Pré-requisitos
- Node.js 20+
- npm

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/agenciaveddu/zen-caps-blog.git
cd zen-caps-blog

# 2. Instalar dependências
npm install

# 3. Rodar em desenvolvimento
npm run dev
# → Disponível em http://localhost:4321/blog

# 4. Build de produção (opcional — para checar antes do deploy)
npm run build
npm run preview
```

### Comandos disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Gera o site estático em `/dist` |
| `npm run preview` | Serve o `/dist` localmente para validar o build |

---

## 5. Arquitetura de Páginas

### 5.1 Homepage do Blog — `/blog`
**Arquivo:** `src/pages/blog/index.astro`

- Busca todos os artigos publicados (data ≤ hoje) via `getCollection('blog')`
- Ordena por data decrescente
- Renderiza: Hero section → Banner CTA → Cards de artigos → Footer
- Filtragem por categoria via links para `/blog/categoria/[cat]`

### 5.2 Artigo Individual — `/blog/[slug]`
**Arquivo:** `src/pages/blog/[slug].astro`

- `getStaticPaths()` gera uma rota para cada artigo publicado em build time
- A página **não tem lógica própria** — apenas passa os dados para `ArticleLayout`
- Injeta 3 CTAs: `inline` no início, `full` no meio/fim, `end` no final (este último está dentro do ArticleLayout)
- O conteúdo Markdown é renderizado via `<Content />` do Astro

```astro
// Estrutura simplificada de [slug].astro
<ArticleLayout {...post.data} slug={post.id}>
  <CTABanner variant="inline" />   ← CTA topo
  <Content />                       ← Corpo do artigo
  <CTABanner variant="full" />     ← CTA meio
</ArticleLayout>
// CTABanner variant="end" está dentro do ArticleLayout
```

### 5.3 Categoria — `/blog/categoria/[cat]`
**Arquivo:** `src/pages/blog/categoria/[cat].astro`

- Gera 4 rotas: `sono`, `ansiedade`, `ingredientes`, `habitos`
- Filtra artigos pela categoria e lista em cards

### 5.4 Busca — `/blog/busca`
**Arquivo:** `src/pages/blog/busca.astro`

- Página com campo de busca; JavaScript client-side faz fetch em `/blog/search.json`
- Usa **Fuse.js** (carregado via CDN) para fuzzy search
- Busca em: título, excerpt, quickAnswer, seoDescription, categoria
- Suporta parâmetro `?q=` na URL (linkável e compartilhável)

### 5.5 Endpoint de Busca — `/blog/search.json`
**Arquivo:** `src/pages/blog/search.json.ts`

- Retorna JSON com todos os artigos publicados
- Campos: `slug`, `title`, `excerpt`, `category`, `coverImage`, `publishedAt`, `quickAnswer`, `seoDescription`
- Cache de 1 hora (`Cache-Control: public, max-age=3600`)

### 5.6 Sitemap — `/blog/sitemap.xml`
**Arquivo:** `src/pages/blog/sitemap.xml.ts`

- XML dinâmico gerado em build time
- Inclui: homepage do blog, 4 páginas de categoria, todos os artigos publicados
- Prioridades: blog homepage = 1.0, categorias = 0.8, artigos = 0.9

### 5.7 Robots.txt — `/robots.txt`
**Arquivo:** `src/pages/robots.txt.ts`

```
User-agent: *
Allow: /
Disallow: /keystatic/

Sitemap: https://zencaps.com.br/blog/sitemap.xml
```

---

## 6. Layouts

### 6.1 ArticleLayout.astro
**Arquivo:** `src/layouts/ArticleLayout.astro`

O layout mais complexo do projeto. Recebe todos os metadados do artigo via props e monta:

**No `<head>`:**
- `<title>` com seoTitle ou title + " | Zen Caps Blog"
- `<meta name="description">` com seoDescription ou excerpt
- `<link rel="canonical">` apontando para `https://zencaps.com.br/blog/[slug]`
- Open Graph: og:title, og:description, og:image (URL absoluta), og:type article
- Twitter Card: summary_large_image
- Schema.org JSON-LD:
  - `Article` — headline, description, image, datePublished, author, publisher
  - `BreadcrumbList` — Blog → Categoria → Artigo
  - `Organization` — Zen Caps com sameAs (Instagram, Facebook)
  - `WebSite` — blog
  - `FAQPage` — se o artigo tiver FAQ definido no frontmatter

**No `<body>`:**
1. Barra de progresso de leitura (CSS + JS inline)
2. Header
3. Barra de topo CTA ("Conheça o Zen Caps →")
4. Breadcrumb (Blog > Categoria > Artigo)
5. Artigo:
   - Badge de categoria (linkado para /categoria/[cat])
   - `<h1>` com o título
   - Excerpt/subtítulo
   - Autor + Data + Tempo de leitura
   - Caixa "💡 Resposta Rápida" (se `quickAnswer` estiver preenchido)
   - Divisor decorativo colorido por categoria
   - **Imagem de capa** (`coverImage`)
   - `<slot />` — conteúdo vindo de `[slug].astro` (CTABanners + Content)
   - Seção de FAQ expansível (se `faq` estiver preenchido)
   - CTABanner variant="end"
   - Link para "Ver todos os artigos de [categoria]"
6. Footer
7. Botão WhatsApp flutuante
8. Script de progresso de leitura + toggle do FAQ

**OG Image — atenção:**
```typescript
// A imagem deve ser URL absoluta para o og:image funcionar
const ogImage = coverImage
  ? (coverImage.startsWith('http') ? coverImage : `https://zencaps.com.br${coverImage}`)
  : 'https://zencaps.com.br/og-image.jpg'
```

### 6.2 BlogLayout.astro
**Arquivo:** `src/layouts/BlogLayout.astro`

Layout mais simples, usado nas listagens. Monta o `<head>` com SEO básico e inclui Header + Footer em volta do `<slot />`.

---

## 7. Componentes

### 7.1 ArticleCard.astro
Card usado nas listagens (blog index, categoria, busca). Exibe:
- Imagem de capa (com fallback de gradiente se não houver imagem)
- Badge de categoria
- Título
- Excerpt (2 linhas, truncado com CSS)
- Data de publicação + tempo de leitura

### 7.2 CTABanner.astro
Componente de conversão com **3 variantes**:

| Variante | Aparece onde | Visual | Texto |
|---|---|---|---|
| `inline` | No início do artigo (logo após o header) | Caixa azul com borda esquerda | "Conheça o Zen Caps" + texto contextual por categoria |
| `full` | No meio/fim do conteúdo | Card escuro com gradiente, impactante | "Durma melhor. Controle a ansiedade. Sem tarja preta." |
| `end` | Final do artigo (dentro do ArticleLayout) | Card claro com ícone de lua | "Pronto para transformar sua noite de sono?" |

O variant `inline` aceita prop `context` que personaliza o texto com a problemática da categoria:
- `sono` → "insônia e dificuldade para dormir"
- `ansiedade` → "ansiedade e estresse"
- `ingredientes` → "dúvidas sobre suplementação"
- `habitos` → "melhorar a qualidade do sono"

Todos os CTAs apontam para `https://zencaps.com.br` com `target="_blank" rel="noopener noreferrer"`.

### 7.3 Header.astro
- Logo "ZEN *caps* Blog" linkando para `/blog`
- Navegação desktop: Sono & Insônia, Ansiedade, Ingredientes, Hábitos
- Ícone de lupa linkando para `/blog/busca`
- Botão "Comprar Zen Caps" → `https://zencaps.com.br` (hidden em mobile)
- Menu hamburger para mobile (toggle JS inline)
- Menu mobile com os mesmos links + link de busca

### 7.4 Footer.astro
- Logo + descrição curta
- Links de navegação por categoria
- Ícones de redes sociais: Instagram (`@zencapsoficial`), Facebook (`zencapsoficial`)
- Link para o site principal

---

## 8. Schema dos Artigos (Frontmatter)

**Arquivo de configuração:** `src/content/config.ts`

Todo artigo é um arquivo `.md` em `src/content/blog/`. O frontmatter define todos os metadados. Campos disponíveis:

```yaml
---
# OBRIGATÓRIOS
title: "Título do artigo"
publishedAt: 2026-03-19          # Data de publicação (YYYY-MM-DD). Artigos futuros não são exibidos.
excerpt: "Subtítulo/resumo curto do artigo para cards e meta description."
category: sono                   # Enum: sono | ansiedade | ingredientes | habitos

# SEO — altamente recomendados
focusKeyword: "palavra-chave principal"
seoTitle: "Título SEO (máx 60 caracteres)"
seoDescription: "Meta description (máx 160 caracteres)"

# AEO — featured snippets e IAs
quickAnswer: "Resposta direta e concisa à pergunta do título (2-4 linhas). Aparece na caixa azul no topo do artigo e no índice de busca."

# IMAGEM
coverImage: "/images/blog/nome-do-arquivo.webp"   # Caminho relativo a /public

# METADADOS ADICIONAIS
readingTime: 8                   # Em minutos (número inteiro)
author: "Equipe Zen Caps"        # Padrão se omitido: "Equipe Zen Caps"
tags: ["tag1", "tag2"]           # Array de strings — para SEO semântico

# FAQ — Schema.org FAQPage (melhora SEO e aparece no Google)
faq:
  - question: "Pergunta 1?"
    answer: "Resposta completa em texto corrido."
  - question: "Pergunta 2?"
    answer: "Resposta 2."
---
```

**Importante:**
- `publishedAt` controla quando o artigo fica visível. Você pode criar artigos com datas futuras para publicação programada.
- `coverImage` deve ser o caminho a partir de `/public` (ex: `/images/blog/arquivo.webp`)
- O campo `quickAnswer` é crítico para AEO (Answer Engine Optimization) — responde diretamente a query do usuário

---

## 9. Como Criar um Novo Artigo

### Passo a passo

**1. Criar o arquivo Markdown**

Crie `src/content/blog/slug-do-artigo.md`. O slug vira a URL: `/blog/slug-do-artigo`

**2. Preencher o frontmatter completo**

```yaml
---
title: "Título Principal com Keyword"
publishedAt: 2026-04-01
excerpt: "Descrição de 1-2 linhas para o card e meta description."
category: sono
focusKeyword: "palavra-chave principal"
seoTitle: "Título SEO Otimizado (máx 60 chars)"
seoDescription: "Meta description que aparece no Google (máx 160 chars)."
quickAnswer: "Resposta direta e concisa. Será exibida em destaque no topo do artigo."
readingTime: 7
author: "Equipe Zen Caps"
coverImage: "/images/blog/slug-do-artigo.webp"
tags: ["tag1", "tag2", "tag3"]
faq:
  - question: "Pergunta frequente 1?"
    answer: "Resposta."
---
```

**3. Escrever o conteúdo**

```markdown
## Primeira Seção

Texto introdutório da seção...

![Descrição da imagem alt](/images/blog/inline-nome-da-imagem.webp)

## Segunda Seção

Conteúdo...

## Artigos Relacionados

- [Título do artigo relacionado 1](/blog/slug-do-artigo-1)
- [Título do artigo relacionado 2](/blog/slug-do-artigo-2)
- [Título do artigo relacionado 3](/blog/slug-do-artigo-3)
- [Título do artigo relacionado 4](/blog/slug-do-artigo-4)
```

**Boas práticas de conteúdo:**
- Palavra-chave no H1 (title), no primeiro parágrafo, e 3-5x no texto
- Mínimo de 1.000 palavras no corpo (sem contar frontmatter)
- Imagem inline posicionada APÓS o texto introdutório da seção (nunca antes do primeiro H2)
- Seção `## Artigos Relacionados` ao final com 4 links internos relevantes
- FAQ com 4-6 perguntas reais de busca

**4. Adicionar a imagem de capa**

Coloque o arquivo `.webp` em `public/images/blog/` com o mesmo nome definido em `coverImage`.

**5. Deploy**

```bash
git add src/content/blog/slug-do-artigo.md public/images/blog/slug-do-artigo.webp
git commit -m "feat: adiciona artigo sobre [tema]"
git push origin master
# Vercel faz deploy automático em ~2 minutos
```

---

## 10. Sistema de Imagens

### Tipos de imagens

| Tipo | Formato | Dimensões recomendadas | Localização | Uso |
|---|---|---|---|---|
| Capa do artigo | `.webp` | 1280×704px | `public/images/blog/nome-artigo.webp` | Cards nas listagens + topo do artigo + og:image |
| Inline (dentro do artigo) | `.webp` | 1280×704px | `public/images/blog/inline-nome.webp` | Ilustrações dentro do texto |
| OG fallback | `.jpg` | 1200×630px | `public/og-image.jpg` | og:image quando artigo não tem capa |

### Convenção de nomenclatura

```
Capa:   [slug-do-artigo].webp
Inline: inline-[descricao-curta].webp
```

Exemplos:
```
melatonina-como-funciona-no-corpo.webp         ← capa
inline-melatonina-pineal-3d.webp               ← inline
inline-melatonina-ritmo-circadiano.webp        ← inline
```

### Como gerar imagens com IA (Runware)

Os scripts `generate-images-all.mjs`, `generate-inline-images.mjs` e `generate-inline-images-2.mjs` usam a API do Runware para gerar renders 3D. Para gerar novas imagens:

```javascript
// Estrutura de cada item nos scripts:
{
  filename: 'nome-do-arquivo.webp',
  prompt: 'descrição detalhada do render 3D',
  negativePrompt: 'text, watermark, ugly, low quality, blurry, cartoon',
}
```

**Modelo usado:** `runware:100@1`
**Dimensões:** 1280×704px
**Configuração:** CFGScale 7, Steps 28

**Regra importante:** Apenas renders 2D/3D científicos e visualizações de dados — NUNCA fotografias de pessoas reais.

**Para rodar:**
```bash
node generate-inline-images-2.mjs
# O script pula arquivos que já existem (verifica antes de gerar)
```

---

## 11. Busca do Blog

**URL:** `/blog/busca` (link no header — ícone de lupa)

### Como funciona

1. `busca.astro` carrega o Fuse.js via CDN
2. No carregamento da página, faz `fetch('/blog/search.json')` para obter o índice
3. O usuário digita → Fuse.js busca em tempo real (debounce de 150ms)
4. Resultados mostram: imagem, categoria, título, excerpt, link

### Campos buscados (com pesos)

| Campo | Peso | Descrição |
|---|---|---|
| `title` | 0.4 | Maior peso — título é o mais relevante |
| `quickAnswer` | 0.3 | Resposta rápida com termos técnicos |
| `excerpt` | 0.15 | Subtítulo do artigo |
| `seoDescription` | 0.1 | Meta description |
| `category` | 0.05 | Nome da categoria |

### Parâmetro de URL

```
/blog/busca?q=melatonina
```

A busca é executada automaticamente se `?q=` estiver na URL, permitindo links diretos para resultados.

---

## 12. SEO e AEO

### O que está implementado automaticamente em cada artigo

**Meta tags (geradas pelo ArticleLayout):**
- `<title>` otimizado (seoTitle + " | Zen Caps Blog")
- `<meta name="description">` (seoDescription ou excerpt)
- `<link rel="canonical">` com URL absoluta

**Open Graph:**
- og:title, og:description, og:image (URL absoluta), og:url, og:type, og:site_name
- article:published_time

**Twitter Card:**
- summary_large_image com título, descrição e imagem

**Schema.org (JSON-LD):**
- `Article` com headline, image, datePublished, author (Organization), publisher
- `BreadcrumbList` com 3 níveis (Blog → Categoria → Artigo)
- `Organization` com sameAs para Instagram e Facebook
- `WebSite` do blog
- `FAQPage` — gerado automaticamente se o frontmatter tiver `faq` preenchido

**Sitemap:** `/blog/sitemap.xml` — atualizado a cada deploy, inclui todos os artigos publicados

**Robots.txt:** `/robots.txt` — permite tudo exceto `/keystatic/`

### AEO (Answer Engine Optimization)

Para ranquear nas IAs (ChatGPT, Perplexity, Google SGE):

1. **`quickAnswer`** no frontmatter → exibido como caixa de destaque no topo do artigo. Deve responder diretamente a pergunta do título em 2-4 linhas.
2. **`faq`** no frontmatter → vira `FAQPage` Schema.org. As IAs extraem essas respostas diretamente.
3. **Headings claros** (`##`) com perguntas explícitas (ex: "Por que isso acontece?")
4. **Tabelas** para comparações e listas de dados estruturados

---

## 13. CTAs e Estratégia de Conversão

Cada artigo tem **3 pontos de CTA** para o site de vendas (`https://zencaps.com.br`):

```
[Topo] Barra fixa "Conheça o Zen Caps →"  (sempre visível, sutil)
       ↓
[Início do artigo] CTABanner variant="inline"  (contextual à categoria)
       ↓
[Conteúdo Markdown do artigo]
       ↓
[Meio/fim] CTABanner variant="full"  (impactante, com proposta de valor completa)
       ↓
[Final] CTABanner variant="end"  (dentro do ArticleLayout, após o conteúdo)
       ↓
[Sempre visível] Botão WhatsApp flutuante (canto inferior direito)
```

**Mensagem do WhatsApp:** pré-preenchida com "Olá, quero saber mais sobre o Zen Caps"
**Número:** +55 11 98820-4942

---

## 14. Deploy e CI/CD

### Fluxo de deploy

```
Código local
    ↓
git push origin master
    ↓
GitHub (repositório: agenciaveddu/zen-caps-blog)
    ↓
Vercel detecta push → executa npm run build
    ↓
Build bem-sucedido → publica em cdn.vercel.com
    ↓
Cloudflare Worker redireciona zencaps.com.br/blog/* → Vercel
    ↓
Usuário acessa zencaps.com.br/blog ✓
```

### Deploy automático diário

Há um cron job configurado (cron-job.org) que dispara o Vercel Deploy Hook diariamente às **6h BRT**. Isso garante que artigos com `publishedAt` no futuro sejam publicados na data certa, sem necessidade de push manual.

O arquivo `daily-deploy.bat` é o script local alternativo (Windows) para disparar o hook manualmente.

### Variáveis de ambiente

O projeto não usa variáveis de ambiente em produção. O Vercel não precisa de configuração extra além das que o `vercel.json` define:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "astro"
}
```

---

## 15. Integração com o Site Principal (Cloudflare Worker)

O domínio principal `zencaps.com.br` é servido por um VPS ou Cloudflare Pages. O blog está no Vercel. Para o usuário acessar `zencaps.com.br/blog`, existe um **Cloudflare Worker** que faz proxy reverso.

### Lógica do Worker

```javascript
// Pseudocódigo do Worker
if (url.pathname.startsWith('/blog') ||
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/images/blog/') ||
    url.pathname === '/favicon.svg') {
  // Redireciona para o Vercel
  fetch('https://zen-caps-blog.vercel.app' + url.pathname)
} else {
  // Serve o site principal normalmente
  fetch(request)
}
```

### Como o Astro está configurado para isso

```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://zencaps.com.br',   // ← URL canônica sempre aponta para o domínio principal
  output: 'static',
  // ...
})
```

As páginas são geradas em `/blog/[slug]` (não na raiz) porque os arquivos ficam em `src/pages/blog/`. Isso faz o Astro gerar URLs `/blog/...` automaticamente, sem precisar de `base` config.

---

## 16. Scripts de Automação

Os scripts na raiz do projeto foram usados para criação e expansão de conteúdo em massa. **Não são executados no deploy** — são ferramentas de linha de comando.

### generate-images-all.mjs
Gera imagens de capa para todos os artigos via Runware API.

```bash
node generate-images-all.mjs
```

### generate-inline-images.mjs / generate-inline-images-2.mjs
Geram imagens inline para seções específicas de artigos. O script pula arquivos que já existem.

```bash
node generate-inline-images-2.mjs
```

### inject-links.cjs
Injeta a seção `## Artigos Relacionados` com 4 links internos no final de cada artigo, com base em mapeamentos de relevância pré-definidos.

```bash
node inject-links.cjs
```

### expand-critical-articles.cjs
Reescreve artigos com conteúdo insuficiente (< 1.000 palavras), expandindo para 1.500–2.000+ palavras com novas seções, tabelas, e dados científicos.

```bash
node expand-critical-articles.cjs
```

### expand-medium-articles.cjs
Similar ao anterior, para artigos de tamanho médio (1.000–1.400 palavras) que precisavam de seções adicionais.

```bash
node expand-medium-articles.cjs
```

### write-gap-articles.cjs
Gerou artigos para preencher gaps de conteúdo identificados na estratégia de SEO.

---

## 17. Identidade Visual e Design System

### Paleta de Cores

| Token | Valor | Uso |
|---|---|---|
| `primary-dark` | `#0D1B3E` | Background do header, títulos principais |
| `primary-mid` | `#172851` | Cards escuros, hover states |
| `accent-blue` | `#1DB8E8` | Links, badges sono/ingredientes, destaques |
| `accent-purple` | `#5B6FDE` | Badges ansiedade |
| `accent-gold` | `#C9A84C` | Badges hábitos, botões CTA (zen-btn-gold) |
| `text-main` | `#0D1B3E` | Texto principal dos artigos |
| `text-muted` | `#6B7A9A` | Textos secundários, datas, autor |
| `bg-light` | `#F4F8FC` | Background das páginas de conteúdo |
| `border-light` | `#e8eef6` | Bordas, separadores |

### Tipografia

| Fonte | Peso | Uso |
|---|---|---|
| **Sora** | 700–900 | Títulos (H1, H2, nome da marca) |
| **DM Sans** | 400–600 | Corpo do texto, navigação, meta info |

Carregadas do Google Fonts. Ambas com `display=swap`.

### Botão CTA (zen-btn-gold)

```css
.zen-btn-gold {
  background: linear-gradient(135deg, #C9A84C, #e8c56a);
  color: #0D1B3E;
  font-weight: 700;
  border-radius: 10px;
  /* ... definido em global.css */
}
```

### Badges de Categoria

```css
.category-badge     { background: rgba(29,184,232,0.1); color: #1DB8E8; }
.badge-ansiedade    { background: rgba(91,111,222,0.1); color: #5B6FDE; }
.badge-habitos      { background: rgba(201,168,76,0.1); color: #C9A84C; }
```

---

## 18. Categorias de Conteúdo

| Categoria | Slug | Cor | Tema |
|---|---|---|---|
| Sono & Insônia | `sono` | `#1DB8E8` (azul) | Insônia, fases do sono, higiene do sono, melatonina, ritmo circadiano |
| Ansiedade & Estresse | `ansiedade` | `#5B6FDE` (roxo) | Controle de ansiedade, cortisol, estresse crônico, técnicas de respiração |
| Ingredientes & Ciência | `ingredientes` | `#1DB8E8` (azul) | Melatonina, triptofano, magnésio, vitamina B6, ácido fólico |
| Hábitos Saudáveis | `habitos` | `#C9A84C` (dourado) | Rotina noturna, alimentação, exercício, celular, ambiente |

### Artigos publicados (33 no total)

**Sono & Insônia**
- `como-dormir-melhor-guia-completo` — Guia pilar com 15 estratégias
- `insonia-cronica-causas-e-tratamentos` — Artigo-pilar de insônia
- `nao-consigo-dormir-o-que-fazer` — Resposta imediata, alto volume de busca
- `quanto-tempo-preciso-dormir-por-noite` — Com seção de dívida de sono
- `sono-profundo-como-conseguir-mais` — NREM fase 3, sistema glinfático
- `sintomas-de-falta-de-sono-no-corpo` — Sintomas físicos e cognitivos
- `apneia-do-sono-o-que-e-sintomas` — Diagnóstico e impacto
- `cafeina-e-sono-quanto-afeta` — Meia-vida da cafeína
- `celular-antes-de-dormir-prejudica-sono` — Luz azul + protocolo 7 dias
- `dormir-cedo-beneficios-para-saude` — Cronotipos + protocolo de mudança
- `exercicio-fisico-melhora-sono` — Metanálise, timing ideal
- `como-acordar-disposto-sem-cansaco` — Inércia do sono, alarmes

**Ansiedade & Estresse**
- `como-controlar-ansiedade-naturalmente` — **Hub principal** da categoria
- `ansiedade-noturna-como-tratar` — Ansiedade e insônia simultâneas
- `ansiedade-generalizada-tratamento-natural` — TAG, critérios DSM
- `crise-de-ansiedade-agora-protocolo-5-minutos` — Protocolo de ação imediata
- `respiracao-para-ansiedade-tecnicas` — 4-7-8, box breathing, coerência cardíaca
- `estresse-cronico-consequencias-para-saude` — Eixo HPA, cortisol, 10 consequências

**Ingredientes & Ciência**
- `melatonina-como-funciona-no-corpo` — Glândula pineal, ritmo circadiano, doses
- `triptofano-para-que-serve-beneficios` — Cadeia Trp→5-HTP→Sero→Mela, BHE
- `magnesio-para-sono-e-ansiedade` — Tipos de magnésio, biodisponibilidade
- `vitamina-b6-serotonina-e-sono` — Coenzimas, medicamentos que esgotam B6
- `acido-folico-saude-cerebral-sono` — Metilfolato, saúde cerebral
- `melatonina-triptofano-magnesio-sono` — Sinergia dos 3 ingredientes do Zen Caps
- `melatonina-vs-magnesio-qual-tomar-primeiro` — Comparativo direto
- `suplementos-naturais-para-ansiedade` — Stack: magnésio + triptofano + melatonina
- `zen-caps-composicao-completa-ingredientes` — Artigo de produto educativo

**Hábitos Saudáveis**
- `rotina-noturna-para-dormir-melhor` — Protocolo completo de wind-down
- `alimentos-que-ajudam-a-dormir-melhor` — Kiwi, cereja, nozes, triptofano alimentar
- `meditacao-para-insonia-como-praticar` — Body scan, breathing space
- `tecnicas-de-relaxamento-muscular-para-dormir` — PMR progressiva
- `como-relaxar-antes-de-dormir-rotina` — Técnicas combinadas
- `teste-sono-saudavel-checklist-10-pontos` — Formato quiz/checklist

---

## 19. Decisões de Arquitetura

### Por que Astro (e não Next.js)?

Astro gera HTML estático puro por padrão — zero JavaScript enviado ao browser. Para um blog de conteúdo, isso significa:
- LCP (Largest Contentful Paint) < 1s
- CLS zero
- Google PageSpeed 95–100 em mobile

### Por que não usar CMS headless (Contentful, Sanity)?

O blog usa arquivos Markdown no Git como CMS. Vantagens:
- Histórico de versões no Git (rastreabilidade total)
- Sem custo de CMS
- Deploy sem dependência de API externa
- Edição local com qualquer editor

Para uma interface visual, `keystatic.config.ts` está configurado para rodar `npm run dev` localmente em `localhost:4321/keystatic` (nunca em produção — bloqueado pelo robots.txt e não deployado).

### Por que a URL é `zencaps.com.br/blog` e não `blog.zencaps.com.br`?

SEO. Um subdomínio é tratado pelo Google como site separado, perdendo a autoridade de domínio acumulada pelo `zencaps.com.br`. Com subfolder (`/blog`), todo o authority do domínio principal beneficia o blog.

### Por que imagens em `/public` e não otimizadas pelo Astro?

As imagens são geradas externamente (Runware AI) já em formato WebP otimizado (1280×704). Usar a pasta `/public` as serve diretamente sem reprocessamento, o que é mais rápido no build e suficiente para o tamanho atual do projeto. Se o acervo crescer muito, pode-se migrar para `src/assets/` com `<Image />` do Astro para otimização automática.

### Por que Fuse.js client-side e não Algolia?

Para o volume atual (33–100 artigos), Fuse.js é mais que suficiente, gratuito e sem dependência de conta externa. O índice JSON tem ~10-20KB — carrega em <100ms. Se o blog chegar a 500+ artigos, Algolia ou Pagefind (solução nativa do Astro) seriam a migração natural.

### Publicação programada

Artigos com `publishedAt` no futuro não são incluídos no build. O cron diário às 6h BRT garante que o Vercel refaça o build e publique os artigos agendados automaticamente.

---

## Contato e Responsáveis

| Papel | Contato |
|---|---|
| Produto / Estratégia de conteúdo | Bruno (Zen Caps) |
| Repositório GitHub | github.com/agenciaveddu/zen-caps-blog |
| Vercel (deploy) | Conta conectada ao repositório acima |
| Cloudflare (proxy) | Conta da Zen Caps |

---

*Documentação gerada em Março 2026. Para atualizar, edite este arquivo e faça um push.*
