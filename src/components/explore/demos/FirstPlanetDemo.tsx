'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { Mesh } from 'three';
import { DemoFrame } from './DemoFrame';

/** 「three.js 첫걸음」 글의 결과: 행성 하나 + 축, 격자 도우미. 버튼으로 Geometry 뼈대만 볼 수 있다 */
export function FirstPlanetDemo() {
  const [wireframe, setWireframe] = useState(false);

  return (
    <DemoFrame caption="드래그해서 돌리고, 휠로 확대해 보세요">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
        <color attach="background" args={['#070814']} />
        <ambientLight intensity={0.35} color="#8890ff" />
        <pointLight position={[-4, 3, 4]} intensity={60} color="#fff0d0" />
        <Planet wireframe={wireframe} />
        <axesHelper args={[3]} />
        <gridHelper args={[10, 10, '#3a4170', '#1c2238']} />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={12} />
      </Canvas>
      <WireframeButton on={wireframe} onToggle={() => setWireframe((w) => !w)} />
    </DemoFrame>
  );
}

function Planet({ wireframe }: { wireframe: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#f0997b" roughness={0.7} flatShading wireframe={wireframe} />
    </mesh>
  );
}

/** 데모 오른쪽 위의 "Geometry만 보기" 버튼. 다른 데모에서도 쓴다 */
export function WireframeButton({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute top-3 right-3 rounded-md border border-[#2c3458] bg-[#0d1020]/80 px-2.5 py-1 font-mono text-[11px] text-[#c9cbd6] transition-colors hover:text-[#fac775]"
    >
      {on ? 'Material 입히기' : 'Geometry만 보기'}
    </button>
  );
}
