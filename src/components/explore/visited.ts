'use client';

import { useMemo, useSyncExternalStore } from 'react';

const KEY = 'explore:visited'; // localStorage에 저장할 이름
const EVENT = 'explore-visited'; // 같은 탭 안에서 바뀐 걸 알리는 이벤트

/**
 * 탐험한 행성(태그) 기록. 새로고침하거나 다음에 와도 남도록 localStorage에 저장한다.
 * 다크 모드 버튼처럼 useSyncExternalStore로 React 바깥의 값을 읽는다.
 */
export function useVisited() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // raw는 문자열이라 내용이 같으면 같은 값 → 바뀔 때만 Set을 새로 만든다
  return useMemo(() => new Set(parse(raw)), [raw]);
}

/** 탐험 기록에 추가한다. 처음 탐험한 행성이면 true */
export function markVisited(tag: string) {
  const visited = new Set(parse(getSnapshot()));
  if (visited.has(tag)) return false;
  visited.add(tag);
  try {
    localStorage.setItem(KEY, JSON.stringify([...visited]));
  } catch {
    // 브라우저 설정으로 저장이 막혀 있으면 이번 방문 동안만 기억하지 못한다. 페이지는 그대로 동작한다
  }
  window.dispatchEvent(new Event(EVENT)); // 같은 탭의 useVisited에게 알린다
  return true;
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange); // 다른 탭에서 바뀐 경우
  window.addEventListener(EVENT, onChange); // 이 탭에서 바뀐 경우
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

const getServerSnapshot = () => '[]'; // 서버는 방문 기록을 모른다

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}
