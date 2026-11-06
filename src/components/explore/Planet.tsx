'use client';

import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';

/**
 * 행성 하나와 그 궤도, 위성들.
 *
 * group: 궤도면 기울기 (고정)
 *  └─ group: 공전축 (원점 = 항성 자리, 매 프레임 y축으로 돈다)
 *      ├─ mesh: 궤도선 (얇은 도넛)
 *      └─ group: 행성 자리 (공전축에서 x로 distance만큼 떨어짐)
 *          ├─ mesh: 행성 본체 (혼자 자전)
 *          ├─ mesh: 고리 (기울어진 채 고정)
 *          └─ group × n: 위성 시작 각도 (고정)
 *              └─ group: 위성 공전축 (행성 중심에서 돈다)
 *                  └─ mesh: 위성 (공전축에서 조금 떨어진 자리)
 *
 * 자식은 부모의 위치와 회전을 그대로 물려받는다.
 * 그래서 공전축만 돌리면, 그 안의 행성은 sin, cos 계산 없이도 원을 그리며 항성 주위를 돈다.
 * 위성도 같다. 위성 공전축만 돌리면 행성 주위를 돌고, 행성이 움직이면 같이 따라간다.
 */
export function Planet() {
  const orbit = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const moonOrbits = useRef<(Group | null)[]>([]);

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
    moonSpeed: { value: 1.2, min: 0, max: 5, step: 0.1 },
  });
  const orbitControls = useControls('Orbit', {
    distance: { value: 6, min: 3, max: 20, step: 0.5 }, // 항성에서 행성까지 거리
    speed: { value: 0.15, min: 0, max: 2, step: 0.01 }, // 1초에 도는 각도(라디안)
    tilt: { value: 0.1, min: -0.6, max: 0.6, step: 0.01 }, // 궤도면 기울기
    showOrbit: true,
  });

  // useFrame: 매 프레임(1초에 약 60번) 실행된다. delta는 지난 프레임부터 흐른 시간(초)
  useFrame((_, delta) => {
    if (orbit.current) orbit.current.rotation.y += delta * orbitControls.speed; // 공전
    if (body.current) body.current.rotation.y += delta * planet.spin; // 자전
    moonOrbits.current.forEach((moonOrbit, k) => {
      // 안쪽 위성일수록 빠르게 (실제 행성계도 가까울수록 빨리 돈다)
      if (moonOrbit) moonOrbit.rotation.y += delta * extras.moonSpeed * (1 - k * 0.06);
    });
  });

  return (
    // 바깥 group은 궤도면 기울기만, 안쪽 group(공전축)은 useFrame이 y로 계속 돌린다.
    // 한 group에 둘 다 주면, 슬라이더를 움직여 다시 그릴 때 rotation prop이 돌던 각도를 0으로 되돌려 버린다
    <group rotation={[orbitControls.tilt, 0, 0]}>
      <group ref={orbit}>
        {/* 궤도선: 공전축 안에 있으니 궤도면과 같이 기울어진다. 도넛은 돌아도 모양이 같아서 공전해도 티가 안 난다 */}
        {orbitControls.showOrbit && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[orbitControls.distance, 0.01, 4, 160]} />
            <meshBasicMaterial color="#2c3458" />
          </mesh>
        )}

        {/* 행성 자리 */}
        <group position={[orbitControls.distance, 0, 0]}>
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

          {/* 위성마다 공전축을 하나씩 둔다.
              바깥 group: 시작 각도와 기울기(고정). 조금씩 달리해서 한 줄로 겹치지 않게
              안쪽 group: 위성 공전축(useFrame이 돌림) */}
          {Array.from({ length: extras.moons }, (_, k) => (
            <group key={k} rotation={[Math.sin(k * 1.7) * 0.4, (k / extras.moons) * Math.PI * 2, 0]}>
              <group
                ref={(el) => {
                  moonOrbits.current[k] = el;
                }}
              >
                <mesh position={[planet.radius + 0.45 + k * 0.12, 0, 0]}>
                  {/* 팔면체: 꼭짓점 6개짜리 각진 보석 모양 */}
                  <octahedronGeometry args={[0.09]} />
                  {/* emissive: 빛을 받지 않아도 스스로 내는 색. 행성 색으로 은은하게 빛나게 */}
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive={planet.color}
                    emissiveIntensity={0.6}
                    flatShading
                    wireframe={planet.wireframe}
                  />
                </mesh>
              </group>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
