'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';

/**
 * 가운데 항성. 스스로 빛나는 물체라 조명을 받지 않는 MeshBasicMaterial을 쓴다.
 * 실제로 주변을 밝히는 빛은 같은 자리에 둔 pointLight가 맡는다 (GalaxyCanvas).
 */
export function Star() {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.2; // 천천히 자전
  });

  return (
    <mesh ref={ref}>
      {/* detail 2: 면이 320개라 행성(detail 1)보다 동그랗다 */}
      <icosahedronGeometry args={[0.9, 2]} />
      <meshBasicMaterial color="#ffd27a" />

      {/* 빛 번짐: 조금 더 큰 반투명 구를 겹친다. 자식이라 항성과 같이 움직인다 */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        {/* depthWrite={false}: 반투명 물체가 뒤에 있는 별을 가리지 않게 */}
        <meshBasicMaterial color="#ffb347" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </mesh>
  );
}
