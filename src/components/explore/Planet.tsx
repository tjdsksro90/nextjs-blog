'use client';

import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useRef } from 'react';
import type { Mesh } from 'three';

/** 행성 하나 = Mesh(Geometry + Material). 지금은 항성 오른쪽에 하나만 둔다 */
export function Planet() {
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
    // 항성(원점)에서 x로 6만큼 떨어진 자리. 항성 쪽(왼쪽) 면만 밝고 바깥쪽은 어둡다
    <mesh ref={ref} position={[6, 0, 0]}>
      <icosahedronGeometry args={[planet.radius, planet.detail]} />
      {/* flatShading은 바뀌면 셰이더를 다시 만들어야 해서 key로 Material을 새로 만든다 */}
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
