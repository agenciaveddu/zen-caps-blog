import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET: APIRoute = async () => {
  const allPosts = await getCollection('blog')
  const now = new Date()

  const index = allPosts
    .filter(post => post.data.publishedAt <= now)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
    .map(post => ({
      slug: post.id,
      title: post.data.title,
      excerpt: post.data.excerpt,
      category: post.data.category,
      coverImage: post.data.coverImage ?? null,
      publishedAt: post.data.publishedAt.toISOString(),
      // Include quickAnswer and seoDescription for richer search
      quickAnswer: post.data.quickAnswer ?? '',
      seoDescription: post.data.seoDescription ?? '',
    }))

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
