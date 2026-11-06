'use client';

import { useMemo } from 'react';

const COUNT = 2000; // 배경 별 개수
const SPREAD = 160; // 별이 흩어지는 정육면체 한 변의 길이

/**
 * 배경 별 2,000개.
 * Mesh 2,000개를 만들면 물체마다 그리기 명령이 따로 나가서 느려진다.
 * Points는 점 2,000개를 Geometry 하나에 담아 한 번에 그린다.
 */
export function Starfield() {
  // [x, y, z, x, y, z, ...] 이렇게 좌표를 한 줄로 늘어놓은 배열
  const positions = useMemo(() => {
    const random = seededRandom(42);
    const array = new Float32Array(COUNT * 3);
    for (let i = 0; i < array.length; i++) array[i] = (random() - 0.5) * SPREAD;
    return array;
  }, []);

  return (
    <points>
      <bufferGeometry>
        {/* attributes-position: geometry.attributes.position = new BufferAttribute(positions, 3) 과 같다. 3은 점 하나에 숫자 3개(x, y, z) */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      {/* size: 점 크기. sizeAttenuation(기본 켜짐) 덕분에 멀리 있는 별은 작게 보인다 */}
      <pointsMaterial color="#ffffff" size={0.12} />
    </points>
  );
}

/**
 * 항상 같은 순서로 나오는 난수 (mulberry32).
 * Math.random()을 쓰면 서버와 브라우저, 새로고침마다 별 위치가 달라진다.
 * 씨앗(seed)이 같으면 매번 같은 하늘이 된다.
 */
function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
