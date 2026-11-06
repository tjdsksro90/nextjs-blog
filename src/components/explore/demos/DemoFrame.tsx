import type { ReactNode } from 'react';

/**
 * 블로그 글 안에 넣는 3D 데모의 틀. Canvas는 부모 크기를 꽉 채우니 여기서 높이를 정한다.
 * not-prose: 본문 typography 스타일이 안쪽에 들어오지 않게
 */
export function DemoFrame({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-8">
      <div className="relative h-[360px] overflow-hidden rounded-xl border border-line sm:h-[440px]">{children}</div>
      {caption && <figcaption className="mt-2 text-center text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}
