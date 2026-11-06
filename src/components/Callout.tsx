import type { ReactNode } from 'react';

// 종류별 제목과 색. 배경은 반투명이라 라이트/다크 둘 다 자연스럽다
const variants = {
  note: { label: 'Note', className: 'border-sky-500/50 bg-sky-500/5 [&>strong]:text-sky-600 dark:[&>strong]:text-sky-400' },
  warn: { label: 'Warning', className: 'border-amber-500/60 bg-amber-500/5 [&>strong]:text-amber-600 dark:[&>strong]:text-amber-400' },
  tip: { label: 'Tip', className: 'border-emerald-500/50 bg-emerald-500/5 [&>strong]:text-emerald-600 dark:[&>strong]:text-emerald-400' },
} as const;

type CalloutProps = {
  type?: keyof typeof variants;
  title?: string; // 없으면 종류 이름(Note, Warning, Tip)
  children: ReactNode;
};

/** MDX 글 안에서 <Callout type="warn">...</Callout> 로 쓰는 강조 박스 */
export function Callout({ type = 'note', title, children }: CalloutProps) {
  const variant = variants[type];
  return (
    // not-prose: 바깥 prose 스타일을 끊고, 박스 안 여백과 글자 크기는 여기서 직접 정한다
    <aside className={`not-prose my-6 rounded-r-lg border-l-4 px-4 py-3 text-[15px] leading-relaxed ${variant.className}`}>
      <strong className="mb-1 block text-sm font-semibold">{title ?? variant.label}</strong>
      {/* MDX는 박스 안 글을 <p>로 감싸서 넘겨준다. 문단 사이만 살짝 띄운다 */}
      <div className="[&_code]:font-mono [&_code]:text-[0.9em] [&>p+p]:mt-2">{children}</div>
    </aside>
  );
}
