import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

// /robots.txt: 모든 검색엔진 로봇에게 전체 허용, sitemap 위치를 알려준다
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
