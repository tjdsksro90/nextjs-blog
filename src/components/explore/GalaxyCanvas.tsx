'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import { useRef } from 'react';
import type { Mesh } from 'three';

// 작업용 도구(축, 격자, 슬라이더 패널)는 개발 서버에서만 보인다. 배포된 사이트에는 안 나온다
const isDev = process.env.NODE_ENV === 'development';

/**
 * 3D 장면 전체. WebGL은 브라우저에만 있으니 클라이언트 컴포넌트.
 * <Canvas>가 three.js의 Scene, Camera, Renderer를 한 번에 만들어 준다.
 */
export function GalaxyCanvas() {
  // useControls: 화면 오른쪽 위 패널에 슬라이더를 만들고, 지금 값을 돌려준다.
  // 마음에 드는 값을 찾으면 아래 value를 그 값으로 바꿔 적어 두면 된다.
  const light = useControls('Light', {
    ambient: { value: 0.35, min: 0, max: 2, step: 0.05 },
    point: { value: 60, min: 0, max: 200, step: 1 },
  });

  return (
    // relative: Leva 패널을 이 박스 안 오른쪽 위에 띄우기 위해
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
        {/* 배경색: <color attach="background">는 scene.background = new Color(...) 와 같다 */}
        <color attach="background" args={['#070814']} />

        {/* 조명 두 개: 전체를 살짝 밝히는 빛 + 한 점에서 퍼지는 빛 (나중에 항성 자리) */}
        <ambientLight intensity={light.ambient} color="#8890ff" />
        <pointLight position={[-4, 3, 4]} intensity={light.point} color="#fff0d0" />

        <Planet />

        {isDev && (
          <>
            {/* 축 화살표: 빨강 X(오른쪽), 초록 Y(위), 파랑 Z(화면 앞쪽). 길이 3 */}
            <axesHelper args={[3]} />
            {/* 바닥 격자: 한 변 10, 10칸 → 한 칸이 1. 크기와 거리를 가늠할 때 쓴다 */}
            <gridHelper args={[10, 10, '#3a4170', '#1c2238']} />
          </>
        )}

        {/* 마우스 드래그로 카메라 돌리기, 휠로 확대 */}
        <OrbitControls enablePan={false} minDistance={3} maxDistance={12} />
      </Canvas>

      {/* 슬라이더 패널. 운영 환경에서는 숨긴다. fill: 화면 전체가 아니라 이 박스 안에 띄운다 */}
      <div className="absolute top-3 right-3 w-64">
        <Leva hidden={!isDev} fill collapsed titleBar={{ title: 'Controls' }} />
      </div>
    </div>
  );
}

/** 행성 하나 = Mesh(Geometry + Material) */
function Planet() {
  const ref = useRef<Mesh>(null);

  const planet = useControls('Planet', {
    radius: { value: 1, min: 0.2, max: 3, step: 0.1 },
    detail: { value: 1, min: 0, max: 5, step: 1 }, // 0이면 면 20개, 클수록 동그래진다
    color: '#f0997b',
    roughness: { value: 0.7, min: 0, max: 1, step: 0.05 },
    flatShading: true,
    spin: { value: 0.4, min: 0, max: 3, step: 0.1 },
    wireframe: false, // 켜면 Geometry 뼈대(선)만 보인다
  });

  // useFrame: 매 프레임(1초에 약 60번) 실행된다. delta는 지난 프레임부터 흐른 시간(초)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * planet.spin;
  });

  return (
    <mesh ref={ref}>
      {/* Geometry(모양): 반지름, detail(각진 정도) */}
      <icosahedronGeometry args={[planet.radius, planet.detail]} />
      {/* Material(표면): flatShading은 바뀌면 셰이더를 다시 만들어야 해서 key로 Material을 새로 만든다 */}
      <meshStandardMaterial
        key={String(planet.flatShading)}
        color={planet.color}
        roughness={planet.roughness}
        flatShading={planet.flatShading}
        wireframe={planet.wireframe}
      />
    </mesh>
  );
}
