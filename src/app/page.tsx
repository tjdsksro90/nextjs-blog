import Link from 'next/link';
import { formatDate, getPosts } from '@/lib/posts';
import { site } from '@/lib/site';

export default function Home() {
  const posts = getPosts();

  return (
    <>
      <section className="pt-16 pb-10">
        <h1 className="text-3xl font-bold tracking-tight">{site.title}</h1>
        <p className="mt-3 text-muted">{site.description}</p>
      </section>

      {posts.length === 0 ? (
        <p className="py-10 text-muted">아직 글이 없어요.</p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {posts.map((post) => (
            <li key={post.url} className="group py-6">
              {/* 글 상세 페이지(/posts/[slug])는 다음 단계에서 만든다 */}
              <Link href={post.url} className="block">
                <h2 className="text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
                  {post.draft && <span className="mr-2 text-xs font-normal text-accent">[초안]</span>}
                  {post.title}
                </h2>
                {post.description && (
                  <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-muted">{post.description}</p>
                )}
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-line px-2 py-0.5">
                    #{tag}
                  </span>
                ))}
                <time dateTime={post.date} className="ml-auto">
                  {formatDate(post.date)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
