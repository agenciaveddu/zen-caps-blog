import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const content = `User-agent: *
Allow: /
Disallow: /keystatic/

Sitemap: https://zencaps.com.br/blog/sitemap.xml
`
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
