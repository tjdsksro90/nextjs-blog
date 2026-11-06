import { cacheLife } from 'next/cache';

export type LinkPreview = {
  url: string;
  title: string;
  description: string;
  image?: string;
  domain: string; // developer.mozilla.org
};

/**
 * 링크한 페이지의 HTML에서 OG 정보(og:title, og:description, og:image)를 읽어 온다.
 * 'use cache'라서 빌드할 때 한 번 가져오고, 그 결과를 HTML에 담아 둔다. 방문자가 볼 때마다 요청하지 않는다.
 * 실패하면(사이트가 막거나 느리면) 주소만으로 카드를 만든다.
 */
export async function getLinkPreview(url: string): Promise<LinkPreview> {
  'use cache';
  cacheLife('max');

  const domain = new URL(url).hostname.replace(/^www\./, '');
  const fallback: LinkPreview = { url, title: url, description: '', domain };

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; dev.log link preview)', Accept: 'text/html' },
      signal: AbortSignal.timeout(8000), // 8초 안에 안 오면 포기
    });
    if (!res.ok) return fallback;
    const html = (await res.text()).slice(0, 300_000); // <head>만 있으면 되니 앞부분만

    const title = meta(html, 'og:title') ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
    const description = meta(html, 'og:description') ?? meta(html, 'description');
    const rawImage = meta(html, 'og:image');
    const image = rawImage ? new URL(decode(rawImage), url).href : undefined; // /og.png 같은 상대 주소를 전체 주소로

    return {
      url,
      domain,
      title: decode(title?.trim() || url),
      description: decode(description?.trim() ?? ''),
      // 사이트가 적어 둔 OG 이미지 주소가 실제로는 404인 경우가 있다. 열리는 이미지만 쓴다
      image: image && (await isImage(image)) ? image : undefined,
    };
  } catch {
    return fallback;
  }
}

// 이미지 주소가 정상 응답(200)이고 진짜 이미지(Content-Type: image/...)인지 확인한다
async function isImage(src: string) {
  try {
    const res = await fetch(src, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; dev.log link preview)' },
      signal: AbortSignal.timeout(8000),
    });
    await res.body?.cancel(); // 내용은 필요 없으니 받다가 끊는다
    return res.ok && (res.headers.get('content-type') ?? '').startsWith('image/');
  } catch {
    return false;
  }
}

// <meta property="og:title" content="..."> 와 <meta content="..." name="description"> 둘 다 찾는다 (속성 순서가 사이트마다 다르다)
function meta(html: string, key: string) {
  const k = key.replace(':', '\\:');
  const a = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']*)["']`, 'i'));
  const b = html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${k}["']`, 'i'));
  return (a ?? b)?.[1];
}

// &amp; &#39; &quot; 같은 HTML 엔티티를 글자로 되돌린다
function decode(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
