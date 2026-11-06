'use client';

import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Vector3, type Object3D } from 'three';

/** 태그 이름 → 3D 장면의 기준점(이름표를 붙일 자리) */
export type AnchorMap = Map<string, Object3D>;
/** 태그 이름 → 화면에 그린 이름표 HTML 요소 */
export type LabelMap = Map<string, HTMLElement>;

const point = new Vector3(); // 매 프레임 새로 만들지 않고 재사용한다

/**
 * 이름표 위치 맞추기. Canvas 안에 두지만 화면에 그리는 건 없다 (null을 돌려준다).
 *
 * 매 프레임마다 각 행성의 기준점을 3D 좌표 → 화면 좌표(px)로 바꿔서,
 * Canvas 위에 겹쳐 둔 HTML 이름표를 그 자리로 옮긴다.
 * React state로 하면 1초에 60번 다시 그려야 하니, DOM의 style을 직접 바꾼다.
 */
export function PlanetLabelsUpdater({ anchors, labels }: { anchors: RefObject<AnchorMap>; labels: RefObject<LabelMap> }) {
  useFrame(({ camera, size }) => {
    for (const [tag, anchor] of anchors.current) {
      const el = labels.current.get(tag);
      if (!el) continue;

      anchor.getWorldPosition(point); // 부모들의 위치, 회전을 다 반영한 실제 좌표
      point.project(camera); // 카메라로 찍었을 때 화면의 어디인지: x, y가 -1(왼쪽, 아래) ~ 1(오른쪽, 위)

      const x = ((point.x + 1) / 2) * size.width;
      const y = ((1 - point.y) / 2) * size.height; // 화면은 위가 0이라 y를 뒤집는다
      el.style.transform = `translate(-50%, 0) translate(${x}px, ${y}px)`;
      el.style.opacity = point.z > 1 ? '0' : '1'; // z > 1이면 카메라 뒤쪽이라 숨긴다
    }
  });
  return null;
}
