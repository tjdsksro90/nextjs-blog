'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group, Mesh } from 'three';
import type { AnchorMap } from './PlanetLabels';
import type { GalaxyTag } from './types';

/** 행성 색. n번째 태그는 n번째 색 (개수보다 태그가 많으면 처음부터 다시) */
const PALETTE = ['#f0997b', '#85b7eb', '#5dcaa5', '#afa9ec', '#fac775', '#ed93b1', '#97c459'];

/** 은하 전체에 같이 적용하는 값. GalaxyCanvas의 Leva 패널에서 조절한다 */
export type GalaxySettings = {
  firstOrbit: number; // 첫 번째(가장 안쪽) 궤도 반지름
  spacing: number; // 궤도 사이 간격
  speed: number; // 공전 속도 배율
  moonSpeed: number;
  showOrbits: boolean;
  showLabels: boolean;
  wireframe: boolean;
};

type PlanetProps = {
  data: GalaxyTag;
  index: number; // 몇 번째 태그인지 (0 = 글이 가장 많은 태그)
  total: number; // 태그 수
  settings: GalaxySettings;
  anchors: RefObject<AnchorMap>; // 이름표 자리를 등록해 두는 곳 (PlanetLabels가 읽는다)
};

/**
 * 태그 하나 = 행성 하나, 그 태그의 글 하나 = 위성 하나.
 * 위치, 크기, 색, 속도는 손으로 정하지 않고 index와 글 수로 계산한다.
 * 그래서 태그가 4개든 40개든 같은 코드로 그려진다.
 *
 * group: 궤도면 기울기 + 시작 각도 (고정)
 *  └─ group: 공전축 (원점 = 항성 자리, 매 프레임 y축으로 돈다)
 *      ├─ mesh: 궤도선 (얇은 도넛)
 *      └─ group: 행성 자리 (공전축에서 x로 distance만큼 떨어짐)
 *          ├─ mesh: 행성 본체 (혼자 자전)
 *          ├─ mesh: 고리 (글 3편 이상일 때만)
 *          ├─ group: 이름표 기준점 (행성 바로 아래. 화면에 그리는 건 PlanetLabels)
 *          └─ group × 글 수: 위성 시작 각도 (고정)
 *              └─ group: 위성 공전축 (행성 중심에서 돈다)
 *                  └─ mesh: 위성
 *
 * 자식은 부모의 위치와 회전을 그대로 물려받는다.
 * 그래서 공전축만 돌리면, 그 안의 행성은 sin, cos 계산 없이도 원을 그리며 항성 주위를 돈다.
 */
export function Planet({ data, index, total, settings, anchors }: PlanetProps) {
  const orbit = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const moonOrbits = useRef<(Group | null)[]>([]);

  const postCount = data.posts.length;
  const distance = settings.firstOrbit + index * settings.spacing; // 안쪽부터 차례로 바깥 궤도
  const size = Math.min(0.35 + postCount * 0.12, 1.2); // 글이 많을수록 크게, 너무 커지지 않게 1.2까지
  const color = PALETTE[index % PALETTE.length];
  const hasRing = postCount >= 3;
  const orbitSpeed = (0.15 / (1 + index * 0.25)) * settings.speed; // 바깥 궤도일수록 느리게
  const startAngle = (index / total) * Math.PI * 2; // 처음에 한 줄로 서 있지 않게 둘레에 고르게
  const tilt = Math.sin(index * 7.3) * 0.15; // 궤도마다 조금씩 다른 기울기 (난수 대신 sin으로, 항상 같은 값)

  useFrame((_, delta) => {
    if (orbit.current) orbit.current.rotation.y += delta * orbitSpeed; // 공전
    if (body.current) body.current.rotation.y += delta * 0.4; // 자전
    moonOrbits.current.forEach((moonOrbit, k) => {
      // 안쪽 위성일수록 빠르게 (실제 행성계도 가까울수록 빨리 돈다)
      if (moonOrbit) moonOrbit.rotation.y += delta * settings.moonSpeed * (1 - k * 0.05);
    });
  });

  return (
    // 바깥 group은 기울기와 시작 각도만, 안쪽 group(공전축)은 useFrame이 y로 계속 돌린다.
    // 한 group에 둘 다 주면, 다시 그릴 때 rotation prop이 돌던 각도를 처음 값으로 되돌려 버린다
    <group rotation={[tilt, startAngle, 0]}>
      <group ref={orbit}>
        {settings.showOrbits && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[distance, 0.01, 4, 160]} />
            <meshBasicMaterial color="#2c3458" />
          </mesh>
        )}

        {/* 행성 자리 */}
        <group position={[distance, 0, 0]}>
          <mesh ref={body}>
            <icosahedronGeometry args={[size, 1]} />
            <meshStandardMaterial color={color} roughness={0.7} flatShading wireframe={settings.wireframe} />
          </mesh>

          {hasRing && (
            <mesh rotation={[1.3, 0, 0]}>
              <torusGeometry args={[size * 1.7, 0.03, 8, 64]} />
              <meshBasicMaterial color={color} transparent opacity={0.6} wireframe={settings.wireframe} />
            </mesh>
          )}

          {/* 이름표 기준점: 모양이 없는 빈 group. 행성과 같이 움직이니, 이 점의 좌표를 읽으면 이름표 자리가 된다 */}
          <group
            position={[0, -(size + 0.45), 0]}
            ref={(el) => {
              if (el) anchors.current.set(data.tag, el);
              else anchors.current.delete(data.tag);
            }}
          />

          {/* 글 하나 = 위성 하나 */}
          {data.posts.map((post, k) => (
            <group key={post.url} rotation={[Math.sin(k * 1.7) * 0.4, (k / postCount) * Math.PI * 2, 0]}>
              <group
                ref={(el) => {
                  moonOrbits.current[k] = el;
                }}
              >
                {/* 위성이 많으면 간격을 좁혀서 너무 멀리 퍼지지 않게 */}
                <mesh position={[size + 0.35 + k * 0.08, 0, 0]}>
                  <octahedronGeometry args={[0.08]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive={color}
                    emissiveIntensity={0.6}
                    flatShading
                    wireframe={settings.wireframe}
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
