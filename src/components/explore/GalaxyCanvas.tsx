'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import Link from 'next/link';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import type { Object3D } from 'three';
import { CameraRig, HOME_DISTANCE } from './CameraRig';
import { Planet } from './Planet';
import { PlanetLabelsUpdater, type AnchorMap, type LabelMap } from './PlanetLabels';
import { Star } from './Star';
import { Starfield } from './Starfield';
import type { GalaxyTag } from './types';
import { markVisited, useVisited } from './visited';

// 작업용 도구(축, 격자, 슬라이더 패널)는 개발 서버에서만 보인다. 배포된 사이트에는 안 나온다
const isDev = process.env.NODE_ENV === 'development';

const HINT = '행성을 클릭해서 날아가 보세요 · 드래그로 회전';

/**
 * 3D 장면 전체와 그 위에 겹친 게임 화면(탐험 수, 오른쪽 패널, 안내 문구).
 * WebGL은 브라우저에만 있으니 클라이언트 컴포넌트.
 */
export function GalaxyCanvas({ galaxy }: { galaxy: GalaxyTag[] }) {
  // useControls: 슬라이더 패널. 마음에 드는 값을 찾으면 value를 그 값으로 바꿔 적어 두면 된다
  const light = useControls('Light', {
    ambient: { value: 0.35, min: 0, max: 2, step: 0.05 },
    star: { value: 2.2, min: 0, max: 6, step: 0.1 },
  });
  // 행성마다 패널을 만들면 태그 수만큼 늘어나니, 은하 전체에 같이 쓰는 값만 둔다
  const settings = useControls('Galaxy', {
    firstOrbit: { value: 5, min: 2, max: 10, step: 0.5 },
    spacing: { value: 1.6, min: 0.5, max: 4, step: 0.1 },
    speed: { value: 1, min: 0, max: 5, step: 0.1 },
    moonSpeed: { value: 1.2, min: 0, max: 5, step: 0.1 },
    showOrbits: true,
    showLabels: true,
    wireframe: false,
  });
  const helpers = useControls('Helpers', { axes: false, grid: false });

  // 게임 상태
  const [focus, setFocus] = useState<string | null>(null); // 날아가서 보고 있는 행성
  const [hovered, setHovered] = useState<string | null>(null); // 마우스가 올라간 행성
  const [hint, setHint] = useState(HINT);
  const visited = useVisited(); // 탐험한 행성 (localStorage)
  const exploredCount = galaxy.filter(({ tag }) => visited.has(tag)).length; // 지금 있는 태그만 센다
  const focused = galaxy.find(({ tag }) => tag === focus);

  // 3D 물체와 HTML을 태그 이름으로 짝지어 두는 곳
  const anchors = useRef<AnchorMap>(new Map()); // 이름표 기준점
  const labels = useRef<LabelMap>(new Map()); // 이름표 HTML
  const centers = useRef(new Map<string, Object3D>()); // 행성 중심 (카메라 목표)
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);

  function select(tag: string) {
    setFocus(tag);
    const first = markVisited(tag);
    const done = first && exploredCount + 1 === galaxy.length;
    setHint(done ? '모든 행성을 탐험했어요!' : first ? '+1 새 행성 발견!' : '이미 탐험한 행성');
  }

  function backToGalaxy() {
    setFocus(null);
    setHint(HINT);
  }

  // Esc 키로도 은하 전체로 돌아간다
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setFocus(null);
        setHint(HINT);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`relative h-full w-full ${hovered ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}>
      {/* 바깥 궤도까지 보이도록 카메라를 멀리, 비스듬히 위에 둔다 (거리 약 30) */}
      <Canvas camera={{ position: [0, 12, 27.5], fov: 50 }}>
        <color attach="background" args={['#070814']} />

        {/* 전체를 살짝 밝히는 빛: 행성의 그늘진 쪽이 완전히 까맣지 않게 */}
        <ambientLight intensity={light.ambient} color="#8890ff" />
        {/* 항성 자리(원점)에서 사방으로 퍼지는 빛. decay={0}: 멀리 있는 행성도 같은 밝기로 비춘다 */}
        <pointLight position={[0, 0, 0]} intensity={light.star} decay={0} color="#fff0d0" />

        <Star />
        {galaxy.map((data, index) => (
          <Planet
            key={data.tag}
            data={data}
            index={index}
            total={galaxy.length}
            settings={settings}
            anchors={anchors}
            centers={centers}
            hovered={hovered === data.tag}
            onSelect={select}
            onHover={(tag) => setHovered((current) => (tag === null && current !== data.tag ? current : tag))}
          />
        ))}
        <PlanetLabelsUpdater anchors={anchors} labels={labels} />
        <Starfield />

        {isDev && helpers.axes && <axesHelper args={[3]} />}
        {isDev && helpers.grid && <gridHelper args={[40, 40, '#3a4170', '#1c2238']} />}

        <OrbitControls ref={controls} enablePan={false} minDistance={2.5} maxDistance={HOME_DISTANCE * 2} />
        <CameraRig focus={focus} centers={centers} controls={controls} />
      </Canvas>

      {/* ── 여기부터는 Canvas 위에 겹친 HTML ── */}

      {/* 이름표 층. 위치는 PlanetLabelsUpdater가 매 프레임 옮긴다. 탐험 전에는 이름을 가린다 */}
      {settings.showLabels && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {galaxy.map(({ tag }) => {
            const seen = visited.has(tag);
            return (
              <span
                key={tag}
                ref={(el) => {
                  if (el) labels.current.set(tag, el);
                  else labels.current.delete(tag);
                }}
                className={`absolute top-0 left-0 font-mono text-[11px] whitespace-nowrap ${seen ? 'text-[#9fe1cb]' : 'text-[#6b7090]'}`}
              >
                {seen || hovered === tag ? `#${tag}` : '? 미탐험'}
              </span>
            );
          })}
        </div>
      )}

      {/* 왼쪽 위: 탐험한 행성 수 */}
      <div className="pointer-events-none absolute top-3 left-4 font-mono text-xs leading-relaxed text-[#9fe1cb]">
        <p>
          EXPLORED {exploredCount} / {galaxy.length}
        </p>
        <div className="mt-1 h-1.5 w-36 overflow-hidden rounded-full bg-[#1c2238]">
          <div
            className="h-full bg-[#5dcaa5] transition-[width] duration-500"
            style={{ width: `${galaxy.length ? (exploredCount / galaxy.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 오른쪽: 행성을 골랐을 때만 나타나는 패널. 좁은 화면(휴대폰)에서는 행성을 가리지 않게 아래쪽에 */}
      <aside
        aria-hidden={!focused}
        className={`absolute inset-x-3 bottom-3 rounded-lg sm:inset-x-auto sm:top-3 sm:right-3 sm:bottom-auto sm:w-56 border border-[#2c3458] bg-[#0d1020]/90 p-3 font-mono text-xs text-[#e6e8f0] transition-all duration-300 ${
          focused ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-3 opacity-0'
        }`}
      >
        {focused && (
          <>
            <p className="text-[#fac775]">PLANET #{focused.tag}</p>
            <p className="mt-1 text-[#9aa0c0]">위성 {focused.posts.length}개 · 글 {focused.posts.length}편</p>
            <ul className="mt-3 max-h-28 space-y-1.5 overflow-y-auto sm:max-h-48">
              {focused.posts.map((post) => (
                <li key={post.url}>
                  <Link href={post.url} className="block leading-snug text-[#c9cbd6] hover:text-[#fac775]">
                    · {post.title}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={backToGalaxy}
              className="mt-3 w-full rounded-md bg-[#fac775] py-1.5 text-[#070814] transition-opacity hover:opacity-85"
            >
              은하 전체 보기
            </button>
          </>
        )}
      </aside>

      {/* 아래 가운데: 안내 문구. 휴대폰에서 패널이 아래에 열려 있으면 위쪽(탐험 수 아래)으로 */}
      <p
        className={`pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono text-xs text-[#fac775] ${
          focused ? 'max-sm:top-14 max-sm:bottom-auto' : ''
        }`}
      >
        {hint}
      </p>

      {/* 슬라이더 패널(개발 서버에서만). 오른쪽 위는 행성 패널 자리라 오른쪽 아래로. 휴대폰 화면에서는 패널과 겹쳐서 숨긴다 */}
      <div className="absolute right-3 bottom-10 w-64 max-sm:hidden">
        <Leva hidden={!isDev} fill collapsed titleBar={{ title: 'Controls' }} />
      </div>
    </div>
  );
}
