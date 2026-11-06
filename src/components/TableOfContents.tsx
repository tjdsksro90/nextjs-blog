import { AnchorProvider, TOCItem, type TOCItemType } from 'fumadocs-core/toc';

/**
 * 글 오른쪽 목차. 지금 읽고 있는 제목을 강조한다.
 *
 * 이 파일에는 "use client"가 없다. 스크롤을 지켜보는 일(IntersectionObserver)은
 * fumadocs-core/toc의 AnchorProvider, TOCItem(이미 클라이언트 컴포넌트)이 맡고,
 * 여기서는 그 둘을 배치하고 스타일만 입힌다.
 */
export function TableOfContents({ toc }: { toc: TOCItemType[] }) {
  if (toc.length === 0) return null;

  return (
    // single: 강조되는 제목을 한 번에 하나만
    <AnchorProvider toc={toc} single>
      <nav aria-label="목차" className="sticky top-24 text-sm">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">On this page</p>
        <ul className="space-y-2 border-l border-line">
          {toc.map((item) => (
            <li key={item.url}>
              <TOCItem
                href={item.url}
                // TOCItem이 지금 보이는 제목에 data-active="true"를 붙여 준다
                className={`-ml-px block border-l border-transparent leading-snug text-muted transition-colors hover:text-foreground data-[active=true]:border-accent data-[active=true]:text-accent ${
                  item.depth >= 3 ? 'pl-7' : 'pl-4'
                }`}
              >
                {item.title}
              </TOCItem>
            </li>
          ))}
        </ul>
      </nav>
    </AnchorProvider>
  );
}
