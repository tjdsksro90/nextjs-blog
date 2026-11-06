import { postSource } from './source';

export type Post = {
  slug: string;
  url: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  draft: boolean;
};

const showDrafts = process.env.NODE_ENV === 'development';

/** 목록용: 모든 글, 최신순. 초안은 개발 서버에서만 포함한다. */
export function getPosts(): Post[] {
  return postSource
    .getPages()
    .map((page) => ({
      slug: page.slugs.join('/'),
      url: page.url,
      title: page.data.title,
      description: page.data.description ?? '',
      date: toDateString(page.data.date),
      tags: page.data.tags,
      draft: page.data.draft,
    }))
    .filter((post) => showDrafts || !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function toDateString(date: string | Date) {
  return typeof date === 'string' ? date : date.toISOString().slice(0, 10);
}

/** 2026-11-05 → 2026년 11월 5일 */
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
