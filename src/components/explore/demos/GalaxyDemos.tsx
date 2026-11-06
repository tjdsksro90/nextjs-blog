import { GalaxyCanvas } from '../GalaxyCanvas';
import type { GalaxyTag } from '../types';
import { DemoFrame } from './DemoFrame';

// 은하 데이터는 글 페이지(posts/[slug]/page.tsx)가 getGalaxy()로 만들어 넘긴다.
// mdx-components에서 직접 글 목록을 읽으면 "글 → mdx-components → 글 목록 → 글" 순환 import가 생겨서 이렇게 했다.

/** 「블로그 태그로 은하 그리기」 글의 결과: 진짜 태그로 그린 은하 (보기 전용) */
export function GalaxyDemo({ galaxy }: { galaxy: GalaxyTag[] }) {
  return (
    <DemoFrame caption="블로그의 진짜 태그와 글로 그린 은하. 드래그해서 돌려 보세요">
      <GalaxyCanvas galaxy={galaxy} game={false} showControls={false} />
    </DemoFrame>
  );
}

/** 「클릭하면 날아가는 카메라」 글의 결과: Explore 페이지와 같은 탐험 게임 */
export function ExploreDemo({ galaxy }: { galaxy: GalaxyTag[] }) {
  return (
    <DemoFrame caption="행성을 클릭해 보세요. /explore 페이지와 탐험 기록을 같이 쓴다">
      <GalaxyCanvas galaxy={galaxy} showControls={false} />
    </DemoFrame>
  );
}
