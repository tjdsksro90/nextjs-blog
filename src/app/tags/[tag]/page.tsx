import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostList } from '@/components/PostList';
import { getPosts, getTags } from '@/lib/posts';

// 모든 태그 페이지를 빌드 때 미리 만든다
export function generateStaticParams() {
  return getTags().map(({ tag }) => ({ tag }));
}

// 글 상세 페이지와 같은 이유로 개발 모드의 Instant Navigation 검사는 끈다
export const instant = false;

// 한글 태그는 주소에서 %ED%9A%8C%EA%B3%A0처럼 인코딩된 채로 들어올 때도, 회고로 들어올 때도 있다.
// 그래서 항상 되돌린다. 이미 되돌려진 값(회고)은 그대로 나온다.
async function readTag(params: PageProps<'/tags/[tag]'>['params']) {
  const { tag } = await params;
  try {
    return decodeURIComponent(tag);
  } catch {
    return tag; // 잘못된 % 표기가 섞인 주소면 받은 그대로 쓴다 (→ 해당 태그가 없으면 404)
  }
}

export async function generateMetadata({ params }: PageProps<'/tags/[tag]'>): Promise<Metadata> {
  return { title: `#${await readTag(params)}` };
}

export default async function TagPage({ params }: PageProps<'/tags/[tag]'>) {
  const tag = await readTag(params);
  const posts = getPosts().filter((post) => post.tags.includes(tag));
  if (posts.length === 0) notFound(); // 없는 태그

  return (
    <section className="pt-16">
      <Link href="/tags" className="text-sm text-muted hover:text-accent">
        ← 모든 태그
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">#{tag}</h1>
      <p className="mt-3 mb-6 text-muted">{posts.length}개의 글</p>
      <PostList posts={posts} />
    </section>
  );
}
