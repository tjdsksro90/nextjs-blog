'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';

/**
 * 3D 장면 전체. WebGL은 브라우저에만 있으니 클라이언트 컴포넌트.
 * <Canvas>가 three.js의 Scene, Camera, Renderer를 한 번에 만들어 준다.
 */
export function GalaxyCanvas() {
  return (
    <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
      {/* 배경색: <color attach="background">는 scene.background = new Color(...) 와 같다 */}
      <color attach="background" args={['#070814']} />

      {/* 조명 두 개: 전체를 살짝 밝히는 빛 + 한 점에서 퍼지는 빛 (나중에 항성 자리) */}
      <ambientLight intensity={0.35} color="#8890ff" />
      <pointLight position={[-4, 3, 4]} intensity={60} color="#fff0d0" />

      <Planet />

      {/* 마우스 드래그로 카메라 돌리기, 휠로 확대 */}
      <OrbitControls enablePan={false} minDistance={3} maxDistance={12} />
    </Canvas>
  );
}

/** 행성 하나 = Mesh(Geometry + Material) */
function Planet() {
  const ref = useRef<Mesh>(null);

  // useFrame: 매 프레임(1초에 약 60번) 실행된다. delta는 지난 프레임부터 흐른 시간(초)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4; // 1초에 0.4 라디안 자전
  });

  return (
    <mesh ref={ref}>
      {/* Geometry(모양): 반지름 1, detail 1 → 면이 80개인 각진 구 */}
      <icosahedronGeometry args={[1, 1]} />
      {/* Material(표면): 주황색, 빛을 받아 명암이 생기는 재질. flatShading으로 면마다 각지게 */}
      <meshStandardMaterial color="#f0997b" roughness={0.7} flatShading />
    </mesh>
  );
}
