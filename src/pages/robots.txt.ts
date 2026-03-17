import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const content = `User-agent: *
Allow: /blog/
Disallow: /keystatic/

Sitemap: https://zencaps.com.br/sitemap-index.xml
`
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
