'use client';

import { useSyncExternalStore } from 'react';

// <html>의 class가 바뀌면 다시 그리도록 구독한다
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
const getSnapshot = () => document.documentElement.classList.contains('dark');
const getServerSnapshot = () => null; // 서버는 사용자가 고른 테마를 모른다

/** 라이트/다크 전환 버튼. 고른 값은 localStorage에 저장한다. */
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-line hover:text-foreground"
    >
      {/* 서버에서 그린 첫 화면에는 아이콘을 비워 둔다 (해 ↔ 달 아이콘이 바뀌며 깜빡이지 않게) */}
      {dark === null ? null : dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
    </svg>
  );
}

/**
 * 화면이 그려지기 전에 <head>에서 바로 실행되는 스크립트.
 * 저장된 값이 있으면 그 값, 없으면 OS 설정(prefers-color-scheme)을 따라 <html>에 dark를 붙인다.
 * React가 실행된 뒤에 붙이면 새로고침할 때마다 흰 화면이 한 번 번쩍인다.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;
