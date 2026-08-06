import { defineCollection, z } from 'astro:content';

// 注意：frontmatter 的 slug 字段会被 glob loader 提升为条目 ID（Astro 5 行为），
// 因此 schema 中不声明 slug；zh/en 分属两个集合避免同名 slug 冲突。
// 集合目录必须与集合名一致：src/content/zhArticles/、src/content/enArticles/
const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  lang: z.enum(['zh', 'en']),
  author: z.string(),
  skill_name: z.string(),
  install: z.string(),
  original: z.boolean(),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
});

const zhArticles = defineCollection({
  type: 'content',
  schema: articleSchema,
});

const enArticles = defineCollection({
  type: 'content',
  schema: articleSchema,
});

export const collections = { zhArticles, enArticles };
