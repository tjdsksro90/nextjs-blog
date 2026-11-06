'use client';

import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useRef } from 'react';
import type { Mesh } from 'three';

/**
 * 행성 하나. 지금은 항성 오른쪽에 하나만 둔다.
 *
 * group (자리만 잡는 빈 상자, x = 6)
 *  ├─ mesh: 행성 본체 (혼자 자전)
 *  ├─ mesh: 고리 (기울어진 채 고정)
 *  └─ mesh × n: 위성
 *
 * 고리를 행성 본체의 자식으로 넣으면 본체가 자전할 때 기울어진 고리도 같이 돌아서 흔들린다.
 * 그래서 자리는 group이 잡고, 자전은 본체만 한다.
 */
export function Planet() {
  const body = useRef<Mesh>(null);

  const planet = useControls('Planet', {
    radius: { value: 1, min: 0.2, max: 3, step: 0.1 },
    detail: { value: 1, min: 0, max: 5, step: 1 }, // 0이면 면 20개, 클수록 동그래진다
    color: '#f0997b',
    roughness: { value: 0.7, min: 0, max: 1, step: 0.05 },
    flatShading: true,
    spin: { value: 0.4, min: 0, max: 3, step: 0.1 },
    wireframe: false, // 켜면 Geometry 뼈대(선)만 보인다
  });
  const extras = useControls('Ring & Moons', {
    ring: true,
    ringTilt: { value: 1.3, min: 0, max: Math.PI, step: 0.05 }, // 라디안. π/2(1.57)면 수평
    moons: { value: 4, min: 0, max: 10, step: 1 }, // 나중에는 이 태그의 글 수
  });

  // useFrame: 매 프레임(1초에 약 60번) 실행된다. delta는 지난 프레임부터 흐른 시간(초)
  useFrame((_, delta) => {
    if (body.current) body.current.rotation.y += delta * planet.spin;
  });

  return (
    <group position={[6, 0, 0]}>
      {/* 행성 본체 */}
      <mesh ref={body}>
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

      {/* 고리: 도넛 모양(TorusGeometry). args = [중심에서 관 가운데까지 반지름, 관 굵기, 관 둘레 분할, 도넛 둘레 분할] */}
      {extras.ring && (
        <mesh rotation={[extras.ringTilt, 0, 0]}>
          <torusGeometry args={[planet.radius * 1.7, 0.03, 8, 64]} />
          <meshBasicMaterial color={planet.color} transparent opacity={0.6} wireframe={planet.wireframe} />
        </mesh>
      )}

      {/* 위성: 행성 둘레에 고르게 늘어놓는다. 아직 돌지는 않는다 (다음 조각에서 공전) */}
      {Array.from({ length: extras.moons }, (_, k) => {
        const angle = (k / extras.moons) * Math.PI * 2; // 한 바퀴(2π)를 위성 수로 나눈 각도
        const distance = planet.radius + 0.45 + k * 0.12; // 안쪽 위성부터 조금씩 멀리
        return (
          <mesh key={k} position={[Math.cos(angle) * distance, Math.sin(k * 1.7) * 0.25, Math.sin(angle) * distance]}>
            {/* 팔면체: 꼭짓점 6개짜리 각진 보석 모양 */}
            <octahedronGeometry args={[0.09]} />
            {/* emissive: 빛을 받지 않아도 스스로 내는 색. 행성 색으로 은은하게 빛나게 */}
            <meshStandardMaterial color="#ffffff" emissive={planet.color} emissiveIntensity={0.6} flatShading wireframe={planet.wireframe} />
          </mesh>
        );
      })}
    </group>
  );
}
