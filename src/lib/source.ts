import { loader } from 'fumadocs-core/source';
import { pageSchema } from 'fumadocs-core/source/schema';
import { defineCollections } from 'fumadocs-mdx/macro';
import { z } from 'zod';

/**
 * 글 frontmatter 규칙. 빌드할 때 모든 글을 이 스키마로 검사하고, 틀리면 빌드가 실패한다.
 * pageSchema에는 title(필수), description(선택)이 이미 들어 있다.
 */
export const postSchema = pageSchema.extend({
  // YAML의 2026-11-05는 Date로 읽히고, 따옴표로 감싸면 문자열이 된다. 둘 다 받는다.
  date: z.iso.date().or(z.date()),
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
