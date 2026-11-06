import type { MDXComponents } from 'mdx/types';
import { Callout } from '@/components/Callout';
import { CodeBlock } from '@/components/CodeBlock';
import { Counter } from '@/components/Counter';
import { FirstPlanetDemo } from '@/components/explore/demos/FirstPlanetDemo';
import { SolarSystemDemo } from '@/components/explore/demos/SolarSystemDemo';
import { LinkCard } from '@/components/LinkCard';

// 모든 MDX 파일에 적용되는 컴포넌트 지도.
// source.config.ts의 providerImportSource가 이 파일의 useMDXComponents를 불러간다.
const components: MDXComponents = {
  // 소문자 키: 마크다운이 만드는 HTML 태그를 바꿔치기한다
  pre: CodeBlock, // 코드 블록에 파일 이름(title)을 보여준다

  // 대문자 키: 글에서 import 없이 <Callout>, <Counter>로 바로 쓸 수 있다
  Callout,
  Counter,
  LinkCard,

  // three.js 글 속 3D 데모. 은하 데모(GalaxyDemo, ExploreDemo)는 글 데이터가 필요해서 글 페이지에서 넘긴다
  FirstPlanetDemo,
  SolarSystemDemo,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
