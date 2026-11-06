import { loader } from 'fumadocs-core/source';
import { pageSchema } from 'fumadocs-core/source/schema';
import { defineCollections } from 'fumadocs-mdx/macro';
import { z } from 'zod';

/**
 * 글 frontmatter 규칙. 빌드할 때 모든 글을 이 스키마로 검사하고, 틀리면 빌드가 실패한다.
 * pageSchema에는 title(필수), description(선택)이 이미 들어 있다.
 */
export const postSchema = pageSchema.extend({
  // 2026-11-05 또는 같은 날 글 순서를 정하고 싶으면 시간까지: 2026-11-05T20:30
  // YAML은 따옴표 없는 날짜를 Date로 읽기도 해서 Date도 받는다.
  date: z.union([z.iso.date(), z.iso.datetime({ local: true }), z.date()]),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false), // true면 개발 서버에서만 보인다
});

// src/content/posts 안의 .md/.mdx 파일 하나가 글 하나
export const posts = defineCollections({
  type: 'doc',
  dir: 'src/content/posts',
  schema: postSchema,
});

// 파일 이름이 주소가 된다: hello-world.mdx → /posts/hello-world
export const postSource = loader({
  baseUrl: '/posts',
  source: posts.toFumadocsSource(),
});
