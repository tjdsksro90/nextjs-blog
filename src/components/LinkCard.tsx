import { getLinkPreview } from '@/lib/link-preview';
import { LinkThumb } from './LinkThumb';

/**
 * MDX 글 안에서 <LinkCard href="https://..." /> 로 쓰는 링크 미리보기 카드.
 * 제목, 설명, 썸네일은 그 페이지의 OG 정보를 빌드 때 읽어 와서 채운다.
 * title, description을 직접 주면 그 값을 우선한다.
 */
export async function LinkCard({ href, title, description }: { href: string; title?: string; description?: string }) {
  const preview = await getLinkPreview(href);
  const shownTitle = title ?? preview.title;
  const shownDescription = description ?? preview.description;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="not-prose group my-3 flex overflow-hidden rounded-lg border border-line bg-background transition-colors hover:border-accent"
    >
      {/* 썸네일: OG 이미지가 없으면 도메인 첫 글자 */}
      <div className="hidden w-28 shrink-0 items-center justify-center overflow-hidden border-r border-line bg-code-bg sm:flex">
        <LinkThumb src={preview.image} domain={preview.domain} />
      </div>

      <div className="min-w-0 flex-1 px-3 py-3">
        <p className="flex items-center gap-1.5 font-semibold leading-snug transition-colors group-hover:text-accent">
          <span className="truncate text-sm">{shownTitle}</span>
          <span aria-hidden className="shrink-0 text-xs text-muted">
            ↗
          </span>
        </p>
        {shownDescription && <p className="mt-1 line-clamp-1 text-sm text-muted">{shownDescription}</p>}
        <p className="mt-1.5 font-mono text-xs text-muted">{preview.domain}</p>
      </div>
    </a>
  );
}
