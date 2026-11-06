import { getPosts } from '@/lib/posts';
import { site } from '@/lib/site';

// /rss.xml: RSS 구독기(Feedly 등)가 새 글을 가져가는 피드.
// page.tsx는 항상 HTML(레이아웃 포함)을 만들기 때문에, XML을 그대로 돌려주려면 route.ts로 Response를 직접 만든다.
// 요청 정보(headers 등)를 쓰지 않으니 빌드할 때 미리 만들어진다.
export function GET() {
  const posts = getPosts().filter((post) => !post.draft);

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${site.url}${post.url}</link>
      <guid>${site.url}${post.url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
    <language>ko</language>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}

// 제목에 & < > 같은 글자가 있으면 XML이 깨지므로 바꿔 준다
function escapeXml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
