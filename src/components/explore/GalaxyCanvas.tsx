'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import { useRef } from 'react';
import { Planet } from './Planet';
import { PlanetLabelsUpdater, type AnchorMap, type LabelMap } from './PlanetLabels';
import { Star } from './Star';
import { Starfield } from './Starfield';
import type { GalaxyTag } from './types';

// 작업용 도구(축, 격자, 슬라이더 패널)는 개발 서버에서만 보인다. 배포된 사이트에는 안 나온다
const isDev = process.env.NODE_ENV === 'development';

/**
 * 3D 장면 전체. WebGL은 브라우저에만 있으니 클라이언트 컴포넌트.
 * <Canvas>가 three.js의 Scene, Camera, Renderer를 한 번에 만들어 준다.
 */
export function GalaxyCanvas({ galaxy }: { galaxy: GalaxyTag[] }) {
  // useControls: 화면 오른쪽 위 패널에 슬라이더를 만들고, 지금 값을 돌려준다.
  // 마음에 드는 값을 찾으면 아래 value를 그 값으로 바꿔 적어 두면 된다.
  const light = useControls('Light', {
    ambient: { value: 0.35, min: 0, max: 2, step: 0.05 },
    star: { value: 2.2, min: 0, max: 6, step: 0.1 },
  });
  // 행성마다 패널을 만들면 태그 수만큼 늘어나니, 은하 전체에 같이 쓰는 값만 둔다
  const settings = useControls('Galaxy', {
    firstOrbit: { value: 5, min: 2, max: 10, step: 0.5 },
    spacing: { value: 1.6, min: 0.5, max: 4, step: 0.1 },
    speed: { value: 1, min: 0, max: 5, step: 0.1 },
    moonSpeed: { value: 1.2, min: 0, max: 5, step: 0.1 },
    showOrbits: true,
    showLabels: true,
    wireframe: false,
  });
  const helpers = useControls('Helpers', { axes: false, grid: false });

  // 이름표: 3D 장면의 기준점(anchors)과 화면 위 HTML(labels)을 태그 이름으로 짝지어 둔다
  const anchors = useRef<AnchorMap>(new Map());
  const labels = useRef<LabelMap>(new Map());

  return (
    // relative: Leva 패널을 이 박스 안 오른쪽 위에 띄우기 위해
    <div className="relative h-full w-full">
      {/* 바깥 궤도까지 보이도록 카메라를 멀리, 비스듬히 위에 둔다 */}
      <Canvas camera={{ position: [0, 12, 28], fov: 50 }}>
        <color attach="background" args={['#070814']} />

        {/* 전체를 살짝 밝히는 빛: 행성의 그늘진 쪽이 완전히 까맣지 않게 */}
        <ambientLight intensity={light.ambient} color="#8890ff" />
        {/* 항성 자리(원점)에서 사방으로 퍼지는 빛.
            decay={0}: 거리에 따라 약해지지 않게 (멀리 있는 행성도 같은 밝기로 비춘다) */}
        <pointLight position={[0, 0, 0]} intensity={light.star} decay={0} color="#fff0d0" />

        <Star />
        {galaxy.map((data, index) => (
          <Planet key={data.tag} data={data} index={index} total={galaxy.length} settings={settings} anchors={anchors} />
        ))}
        <PlanetLabelsUpdater anchors={anchors} labels={labels} />
        <Starfield />

        {/* 작업용 도우미: 은하에서는 화면을 가려서 기본으로 꺼 두고 패널에서 켠다 */}
        {isDev && helpers.axes && <axesHelper args={[3]} />}
        {isDev && helpers.grid && <gridHelper args={[40, 40, '#3a4170', '#1c2238']} />}

        <OrbitControls enablePan={false} minDistance={3} maxDistance={60} />
      </Canvas>

      {/* 이름표 층: Canvas 위에 겹친 HTML. 위치는 PlanetLabelsUpdater가 매 프레임 옮긴다.
          pointer-events-none: 이름표가 마우스를 가로채지 않아 아래 Canvas를 그대로 드래그할 수 있다 */}
      {settings.showLabels && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {galaxy.map(({ tag }) => (
            <span
              key={tag}
              ref={(el) => {
                if (el) labels.current.set(tag, el);
                else labels.current.delete(tag);
              }}
              className="absolute top-0 left-0 font-mono text-[11px] whitespace-nowrap text-[#c9cbd6]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 슬라이더 패널. 운영 환경에서는 숨긴다. fill: 화면 전체가 아니라 이 박스 안에 띄운다 */}
      <div className="absolute top-3 right-3 w-64">
        <Leva hidden={!isDev} fill collapsed titleBar={{ title: 'Controls' }} />
      </div>
    </div>
  );
}
