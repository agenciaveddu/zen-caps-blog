import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET: APIRoute = async () => {
  const allPosts = await getCollection('blog')
  const now = new Date()
  const posts = allPosts.filter(post => post.data.publishedAt <= now)

  const base = 'https://zencaps.com.br'

  const staticUrls = [
    { loc: `${base}/blog/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${base}/blog/categoria/sono/`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${base}/blog/categoria/ansiedade/`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${base}/blog/categoria/ingredientes/`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${base}/blog/categoria/habitos/`, priority: '0.8', changefreq: 'weekly' },
  ]

  const postUrls = posts.map(post => ({
    loc: `${base}/blog/${post.id}/`,
    lastmod: post.data.publishedAt.toISOString().split('T')[0],
    priority: '0.9',
    changefreq: 'monthly',
  }))

  const allUrls = [...staticUrls, ...postUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
