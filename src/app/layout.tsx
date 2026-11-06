import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { themeInitScript } from '@/components/ThemeToggle';
import { site } from '@/lib/site';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url), // OG 이미지 등 상대 주소를 전체 주소로 바꿀 때 기준
  title: { default: site.title, template: `%s | ${site.title}` },
  description: site.description,
  // <head>에 <link rel="alternate" type="application/rss+xml">를 넣어 구독기가 피드를 찾게 한다
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
  openGraph: { siteName: site.title, locale: 'ko_KR', type: 'website' },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // 인라인 스크립트가 dark 클래스를 붙이므로 서버 HTML과 class가 달라질 수 있다 → 경고 끔(suppressHydrationWarning)
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      {/* 브라우저 확장 프로그램(LocatorJS 등)이 body에 data-* 속성을 끼워 넣어도 하이드레이션 경고를 내지 않는다.
          suppressHydrationWarning은 이 태그의 속성에만 적용되고, 안쪽 자식들의 불일치는 그대로 잡아낸다. */}
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-5">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
