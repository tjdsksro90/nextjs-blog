import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: '페이지를 찾을 수 없어요' };

// 없는 주소로 들어오거나, 페이지에서 notFound()를 부르면 이 화면이 보인다.
// 루트 layout 안에서 그려지므로 헤더, 푸터, 다크 모드가 그대로 적용된다.
export default function NotFound() {
  return (
    <section className="py-24 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">페이지를 찾을 수 없어요</h1>
      <p className="mt-4 text-muted">주소가 바뀌었거나 삭제된 글일 수 있어요.</p>
      <div className="mt-8 flex justify-center gap-3 text-sm">
        <Link href="/" className="rounded-md bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-80">
          글 목록으로
        </Link>
        <Link href="/tags" className="rounded-md border border-line px-4 py-2 text-muted transition-colors hover:text-foreground">
          태그 보기
        </Link>
      </div>
    </section>
  );
}
