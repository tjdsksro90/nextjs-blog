'use client';

import type { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, type ComponentRef, type RefObject } from 'react';
import { Vector3, type Object3D } from 'three';

export const HOME_DISTANCE = 30; // 은하 전체를 볼 때 카메라 거리
const FOCUS_DISTANCE = 3; // 행성을 볼 때 카메라 거리 = 이 값 + 행성 크기 × FOCUS_SCALE
const FOCUS_SCALE = 3.5;
const SPEED = 3; // 클수록 빨리 날아간다

// 매 프레임 new Vector3()를 만들지 않도록 미리 만들어 재사용한다
const goal = new Vector3();
const before = new Vector3();
const move = new Vector3();
const offset = new Vector3();

type CameraRigProps = {
  focus: string | null; // 지금 보고 있는 태그 (null = 은하 전체)
  centers: RefObject<Map<string, Object3D>>; // 태그 → 행성 중심
  controls: RefObject<ComponentRef<typeof OrbitControls> | null>;
};

/**
 * 카메라 날아가기. 화면에 그리는 건 없다.
 *
 * OrbitControls는 target(바라보는 점)을 중심으로 카메라를 돌린다. 그래서
 * 1. target을 고른 행성 쪽으로 조금씩 옮기고
 * 2. 카메라도 target이 움직인 만큼 같이 옮기고 (행성이 공전해도 따라간다)
 * 3. 날아가는 동안에는 target과의 거리도 조금씩 목표 거리로 맞춘다
 * 드래그로 돌리는 건 그대로 OrbitControls가 한다.
 */
export function CameraRig({ focus, centers, controls }: CameraRigProps) {
  const flying = useRef(false);

  // 고른 행성이 바뀌면 다시 날아가기 시작
  useEffect(() => {
    flying.current = true;
  }, [focus]);

  useFrame(({ camera }, delta) => {
    const c = controls.current;
    if (!c) return;

    const planet = focus ? centers.current.get(focus) : undefined;
    if (planet) planet.getWorldPosition(goal);
    else goal.set(0, 0, 0); // 은하 전체: 항성(원점)을 본다

    // 남은 거리의 일정 비율씩 다가간다 → 처음엔 빠르고 도착할수록 느려진다.
    // delta를 넣어서 화면 주사율(60Hz, 120Hz)이 달라도 같은 속도로 날아간다
    const t = 1 - Math.exp(-SPEED * delta);

    before.copy(c.target);
    c.target.lerp(goal, t); // 1. target 옮기기
    camera.position.add(move.subVectors(c.target, before)); // 2. 카메라도 같은 만큼

    if (flying.current) {
      // 3. 거리 맞추기 (방향은 그대로 두고 길이만 바꾼다)
      // 큰 행성(고리 포함)은 더 멀리서 봐야 화면에 다 들어온다
      const planetSize = Number(planet?.userData.size ?? 1);
      const want = planet ? FOCUS_DISTANCE + planetSize * FOCUS_SCALE : HOME_DISTANCE;
      offset.subVectors(camera.position, c.target);
      const distance = offset.length() + (want - offset.length()) * t;
      camera.position.copy(c.target).add(offset.setLength(distance));

      // 거의 도착하면 그만 맞춘다 → 그 뒤로는 휠로 마음대로 확대, 축소할 수 있다
      if (Math.abs(distance - want) < 0.05 && c.target.distanceTo(goal) < 0.05) flying.current = false;
    }
  });

  return null;
}
