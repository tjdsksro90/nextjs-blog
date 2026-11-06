'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { Object3D } from 'three';
import { Planet, type GalaxySettings } from '../Planet';
import type { AnchorMap } from '../PlanetLabels';
import { Star } from '../Star';
import { Starfield } from '../Starfield';
import type { GalaxyTag } from '../types';
import { DemoFrame } from './DemoFrame';
import { WireframeButton } from './FirstPlanetDemo';

// 글 4편짜리 가짜 태그 하나 → 고리 있는 행성 + 위성 4개
const DEMO_TAG: GalaxyTag = {
  tag: 'demo',
  posts: [1, 2, 3, 4].map((n) => ({ title: `글 ${n}`, url: `#moon-${n}` })),
};

const noop = () => {};

/** 「three.js로 행성계 만들기」 글의 결과: 항성, 별, 고리와 위성이 있는 행성 하나가 공전 */
export function SolarSystemDemo() {
  const [wireframe, setWireframe] = useState(false);
  const anchors = useRef<AnchorMap>(new Map()); // 이 데모에서는 이름표를 안 쓰지만 Planet이 받는 값이라 빈 Map
  const centers = useRef(new Map<string, Object3D>());

  const settings: GalaxySettings = {
    firstOrbit: 6,
    spacing: 0,
    speed: 1.5,
    moonSpeed: 1.2,
    showOrbits: true,
    showLabels: false,
    wireframe,
  };

  return (
    <DemoFrame caption="드래그해서 돌려 보세요. 행성이 항성 주위를, 위성이 행성 주위를 돈다">
      <Canvas camera={{ position: [0, 6, 14], fov: 50 }}>
        <color attach="background" args={['#070814']} />
        <ambientLight intensity={0.35} color="#8890ff" />
        <pointLight position={[0, 0, 0]} intensity={2.2} decay={0} color="#fff0d0" />
        <Star />
        <Planet
          data={DEMO_TAG}
          index={0}
          total={1}
          settings={settings}
          anchors={anchors}
          centers={centers}
          hovered={false}
          onSelect={noop}
          onHover={noop}
        />
        <Starfield />
        <OrbitControls enablePan={false} minDistance={4} maxDistance={40} />
      </Canvas>
      <WireframeButton on={wireframe} onToggle={() => setWireframe((w) => !w)} />
    </DemoFrame>
  );
}
