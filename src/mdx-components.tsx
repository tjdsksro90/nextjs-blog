import type { MDXComponents } from 'mdx/types';

// 모든 MDX 파일에 적용되는 컴포넌트 지도.
// App Router에서 @next/mdx를 쓰려면 이 파일이 꼭 있어야 한다 (비어 있어도 됨).
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
