import type { Metadata } from 'next';
import Link from 'next/link';
import { getTags, tagUrl } from '@/lib/posts';

export const metadata: Metadata = { title: 'Tags' };

export default function TagsPage() {
  const tags = getTags();

  return (
    <section className="pt-16">
      <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
      <p className="mt-3 text-muted">{tags.length}개의 태그</p>

      <ul className="mt-10 flex flex-wrap gap-3">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={tagUrl(tag)}
              className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 transition-colors hover:border-accent hover:text-accent"
            >
              #{tag}
              <span className="font-mono text-xs text-muted">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
