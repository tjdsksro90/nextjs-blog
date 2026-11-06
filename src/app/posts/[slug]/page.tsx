import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatDate, getPosts } from '@/lib/posts';
import { postSource } from '@/lib/source';

// 빌드할 때 이 목록의 글들을 전부 HTML로 미리 만든다 (초안은 운영 빌드에서 빠진다)
export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

// 모든 글이 빌드 때 HTML로 만들어지므로, 개발 모드의 Instant Navigation 검사는 끈다.
// (켜 두면 params를 <Suspense> 밖에서 읽는다고 경고가 뜬다)
export const instant = false;

// 주소의 slug로 글을 찾는다. 없거나, 운영 환경에서 초안이면 404
function findPost(slug: string) {
  const page = postSource.getPage([slug]);
  if (!page || (page.data.draft && process.env.NODE_ENV !== 'development')) notFound();
  return page;
}

// 글마다 다른 <title>, 설명, OG 태그
export async function generateMetadata({ params }: PageProps<'/posts/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const { data } = findPost(slug);
  return {
    title: data.title,
    description: data.description,
    keywords: data.tags,
    openGraph: { type: 'article', title: data.title, description: data.description },
  };
}

//날짜, 제목, 설명, 태그, 그리고 data.body(fumadocs가 만든 본문 컴포넌트)를 prose로 감싸서 보줌
export default async function PostPage({ params }: PageProps<'/posts/[slug]'>) {
  const { slug } = await params;
  const { data } = findPost(slug);
  const post = getPosts().find((p) => p.slug === slug);
  const MDX = data.body; // fumadocs-mdx가 MDX 본문을 React 컴포넌트로 바꿔 둔 것

  return (
    <article className="pt-14">
      <header className="mb-10 border-b border-line pb-8">
        {post && (
          <time dateTime={post.date} className="font-mono text-sm text-muted">
            {formatDate(post.date)}
          </time>
        )}
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{data.title}</h1>
        {data.description && <p className="mt-4 text-lg leading-relaxed text-muted">{data.description}</p>}
        {data.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
            {data.tags.map((tag) => (
              <span key={tag} className="rounded-md border border-line px-2 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-accent">
        <MDX />
      </div>
    </article>
  );
}
