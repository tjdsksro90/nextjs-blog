import Link from 'next/link';
import { formatDate, tagUrl, type Post } from '@/lib/posts';

/** #태그 링크. 누르면 그 태그의 글 목록으로 간다 */
export function TagChip({ tag }: { tag: string }) {
  return (
    <Link
      href={tagUrl(tag)}
      className="rounded-md border border-line px-2 py-0.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
    >
      #{tag}
    </Link>
  );
}

/** 글 목록. 홈과 태그 페이지에서 같이 쓴다 */
export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="py-10 text-muted">아직 글이 없어요.</p>;
  }

  return (
    <ul className="divide-y divide-line border-t border-line">
      {posts.map((post) => (
        <li key={post.url} className="group py-6">
          <Link href={post.url} className="block">
            <h2 className="text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
              {post.draft && <span className="mr-2 text-xs font-normal text-accent">[초안]</span>}
              {post.title}
            </h2>
            {post.description && (
              <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-muted">{post.description}</p>
            )}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
            <time dateTime={post.date} className="ml-auto text-xs text-muted">
              {formatDate(post.date)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}
