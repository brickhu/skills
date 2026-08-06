import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    lang: z.enum(['zh', 'en']),
    tags: z.array(z.string()).default([]),
    original: z.string().optional(),
  }),
});

export const collections = { articles };
