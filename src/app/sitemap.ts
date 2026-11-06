import type { MetadataRoute } from 'next';
import { getPosts, getTags, tagUrl } from '@/lib/posts';
import { site } from '@/lib/site';

// /sitemap.xml: 검색엔진에 사이트의 페이지 목록을 알려준다. 빌드할 때 한 번 만들어진다.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts().filter((post) => !post.draft);

  return [
    { url: site.url, lastModified: posts[0]?.date },
    { url: `${site.url}/about` },
    { url: `${site.url}/tags` },
    ...posts.map((post) => ({ url: `${site.url}${post.url}`, lastModified: post.date })),
    ...getTags().map(({ tag }) => ({ url: `${site.url}${tagUrl(tag)}` })),
  ];
}
