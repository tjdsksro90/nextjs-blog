'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import { Planet } from './Planet';
import { Star } from './Star';
import { Starfield } from './Starfield';

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
    star: { value: 2.2, min: 0, max: 6, step: 0.1 },
  });
  const helpers = useControls('Helpers', { axes: false, grid: false });

  return (
    // relative: Leva 패널을 이 박스 안 오른쪽 위에 띄우기 위해
    <div className="relative h-full w-full">
      {/* 은하 전체가 보이도록 카메라를 멀리, 비스듬히 위에 둔다 */}
      <Canvas camera={{ position: [0, 6, 16], fov: 50 }}>
        <color attach="background" args={['#070814']} />

        {/* 전체를 살짝 밝히는 빛: 행성의 그늘진 쪽이 완전히 까맣지 않게 */}
        <ambientLight intensity={light.ambient} color="#8890ff" />
        {/* 항성 자리(원점)에서 사방으로 퍼지는 빛.
            decay={0}: 거리에 따라 약해지지 않게 (멀리 있는 행성도 같은 밝기로 비춘다) */}
        <pointLight position={[0, 0, 0]} intensity={light.star} decay={0} color="#fff0d0" />

        <Star />
        <Planet />
        <Starfield />

        {/* 작업용 도우미: 은하에서는 화면을 가려서 기본으로 꺼 두고 패널에서 켠다 */}
        {isDev && helpers.axes && <axesHelper args={[3]} />}
        {isDev && helpers.grid && <gridHelper args={[40, 40, '#3a4170', '#1c2238']} />}

        <OrbitControls enablePan={false} minDistance={3} maxDistance={40} />
      </Canvas>

      {/* 슬라이더 패널. 운영 환경에서는 숨긴다. fill: 화면 전체가 아니라 이 박스 안에 띄운다 */}
      <div className="absolute top-3 right-3 w-64">
        <Leva hidden={!isDev} fill collapsed titleBar={{ title: 'Controls' }} />
      </div>
    </div>
  );
}
