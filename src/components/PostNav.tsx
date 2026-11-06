import Link from 'next/link';
import type { Post } from '@/lib/posts';

/** 글 맨 아래의 이전/다음 글 링크. 없는 쪽은 빈 칸으로 둬서 좌우 위치가 바뀌지 않게 한다 */
export function PostNav({ prev, next }: { prev?: Post; next?: Post }) {
  if (!prev && !next) return null;

  return (
    <nav aria-label="이전/다음 글" className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
      {prev ? <NavCard post={prev} label="← 이전 글" /> : <div />}
      {next ? <NavCard post={next} label="다음 글 →" align="right" /> : <div />}
    </nav>
  );
}

function NavCard({ post, label, align = 'left' }: { post: Post; label: string; align?: 'left' | 'right' }) {
  return (
    <Link
      href={post.url}
      className={`group rounded-lg border border-line px-4 py-3 transition-colors hover:border-accent ${align === 'right' ? 'sm:text-right' : ''}`}
    >
      <span className="text-xs text-muted">{label}</span>
      <span className="mt-1 block font-medium leading-snug transition-colors group-hover:text-accent">{post.title}</span>
    </Link>
  );
}
