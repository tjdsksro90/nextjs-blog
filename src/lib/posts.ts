import { postSource } from './source';

export type Post = {
  slug: string;
  url: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD (화면에 보이는 날짜)
  sortKey: string; // YYYY-MM-DDTHH:mm (정렬용. 시간을 안 적었으면 날짜만)
  tags: string[];
  draft: boolean;
  readingMinutes: number; // 읽는 데 걸리는 시간(분)
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
      date: toDateTime(page.data.date).slice(0, 10),
      sortKey: toDateTime(page.data.date),
      tags: page.data.tags,
      draft: page.data.draft,
      readingMinutes: readingMinutes(page.data.structuredData.contents),
    }))
    .filter((post) => showDrafts || !post.draft)
    .sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1)); // 최신순. 같은 날이면 시간이 늦은 글이 위
}

/** 최신순 글 목록을 연도별로 묶는다: [{ year: '2026', posts: [...] }, { year: '2025', ... }] */
export function groupByYear(posts: Post[]) {
  const groups: { year: string; posts: Post[] }[] = [];
  for (const post of posts) {
    const year = post.date.slice(0, 4); // '2026-11-05' → '2026'
    const last = groups.at(-1);
    // 이미 최신순이라 같은 해 글은 붙어 있다. 마지막 묶음과 같은 해면 거기에, 아니면 새 묶음
    if (last?.year === year) last.posts.push(post);
    else groups.push({ year, posts: [post] });
  }
  return groups;
}

/**
 * 글 페이지 아래에 보일 이전(더 오래된) 글과 다음(더 최신) 글.
 * getPosts()는 최신순이라 인덱스가 클수록 오래된 글이다.
 */
export function getAdjacentPosts(slug: string) {
  const posts = getPosts();
  const i = posts.findIndex((post) => post.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  return { prev: posts[i + 1], next: posts[i - 1] }; // 범위를 벗어나면 undefined
}

/** 태그별 글 개수. 글이 많은 태그부터, 같으면 이름순 */
export function getTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** 태그 페이지 주소. 한글이나 점(.)이 있어도 주소에 안전하게 넣는다: 회고 → /tags/%ED%9A%8C%EA%B3%A0 */
export function tagUrl(tag: string) {
  return `/tags/${encodeURIComponent(tag)}`;
}

const CHARS_PER_MINUTE = 500; // 한국어는 1분에 약 500자를 읽는다고 본다

/**
 * structuredData: fumadocs가 빌드할 때 본문에서 뽑아 둔 문단, 제목, 표 텍스트 (검색용).
 * 코드 블록은 들어 있지 않아서 "글"만 센다. 공백은 빼고 센다.
 */
function readingMinutes(contents: { content: string }[]) {
  const chars = contents.reduce((sum, { content }) => sum + content.replace(/\s/g, '').length, 0);
  return Math.max(1, Math.round(chars / CHARS_PER_MINUTE));
}

/**
 * frontmatter 날짜를 'YYYY-MM-DD' 또는 'YYYY-MM-DDTHH:mm' 문자열로 맞춘다.
 * YAML이 Date로 읽은 값은 시간대 없이 적힌 그대로를 UTC로 보관하므로, toISOString()으로 꺼내면 적은 값과 같다.
 */
function toDateTime(date: string | Date) {
  if (typeof date !== 'string') {
    const iso = date.toISOString(); // 2026-11-06T20:38:00.000Z
    return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso.slice(0, 16);
  }
  return date.slice(0, 16);
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
