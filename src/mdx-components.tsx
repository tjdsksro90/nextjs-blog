import type { MDXComponents } from 'mdx/types';
import { Callout } from '@/components/Callout';
import { CodeBlock } from '@/components/CodeBlock';
import { Counter } from '@/components/Counter';

// 모든 MDX 파일에 적용되는 컴포넌트 지도.
// source.config.ts의 providerImportSource가 이 파일의 useMDXComponents를 불러간다.
const components: MDXComponents = {
  // 소문자 키: 마크다운이 만드는 HTML 태그를 바꿔치기한다
  pre: CodeBlock, // 코드 블록에 파일 이름(title)을 보여준다

  // 대문자 키: 글에서 import 없이 <Callout>, <Counter>로 바로 쓸 수 있다
  Callout,
  Counter,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
