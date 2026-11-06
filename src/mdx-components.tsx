import type { MDXComponents } from 'mdx/types';

// 모든 MDX 파일에 적용되는 컴포넌트 지도.
// source.config.ts의 providerImportSource가 이 파일의 useMDXComponents를 불러간다.
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
