'use client';

import { useState } from 'react';

/**
 * 링크 카드 썸네일. 빌드 때 확인한 이미지도 나중에 사이트가 막거나 지우면 깨질 수 있어서,
 * 브라우저에서 불러오기에 실패하면(onError) 도메인 첫 글자로 바꾼다.
 */
export function LinkThumb({ src, domain }: { src?: string; domain: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className="font-mono text-2xl font-semibold text-muted uppercase">{domain[0]}</span>;
  }

  return (
    // 바깥 사이트 이미지라 next/image 대신 img (도메인마다 설정을 추가하지 않으려고)
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
  );
}
