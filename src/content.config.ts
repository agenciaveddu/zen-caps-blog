import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    excerpt: z.string(),
    category: z.enum(['sono', 'ansiedade', 'ingredientes', 'habitos']),
    focusKeyword: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    coverImage: z.string().optional(),
    quickAnswer: z.string().optional(),
    readingTime: z.number().optional(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    updatedAt: z.coerce.date().optional(),
  }),
})

export const collections = { blog }
