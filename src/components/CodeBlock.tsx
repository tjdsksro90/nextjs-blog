import type { ComponentProps } from 'react';

/**
 * MDX의 ``` 코드 블록이 그려지는 컴포넌트.
 * ```ts title="파일이름" 처럼 쓰면 fumadocs가 <pre title="파일이름">으로 넘겨준다.
 */
export function CodeBlock({ title, ...props }: ComponentProps<'pre'>) {
  return (
    <figure className="code-block not-prose">
      {title && <figcaption>{title}</figcaption>}
      <pre {...props} />
    </figure>
  );
}
