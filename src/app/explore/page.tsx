import type { Metadata } from 'next';
import { GalaxyCanvas } from '@/components/explore/GalaxyCanvas';
import { getGalaxy } from '@/lib/galaxy';

export const metadata: Metadata = {
  title: 'Explore',
  description: '태그 행성을 탐험하며 글을 찾아보세요.',
};

// 페이지는 서버 컴포넌트로 두고 글 데이터를 여기서 읽는다. 3D 부분만 클라이언트 컴포넌트로 넣는다.
// 글을 새로 쓰면 빌드할 때 이 데이터가 다시 만들어져서 행성과 위성이 자동으로 늘어난다.
export default function ExplorePage() {
  return (
    <section className="pt-14">
      <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
      <p className="mt-3 text-muted">태그는 행성, 글은 위성이에요. 행성을 눌러 탐험해 보세요.</p>

      {/* Canvas는 부모 크기를 꽉 채운다. 그래서 부모에 높이를 꼭 줘야 한다 */}
      <div className="mt-8 h-[440px] overflow-hidden rounded-xl border border-line sm:h-[520px]">
        <GalaxyCanvas galaxy={getGalaxy()} />
      </div>
    </section>
  );
}
