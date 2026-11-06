'use client';

import { useState } from 'react';

/** MDX 글 안에 넣는 인터랙티브 예제. 클릭(state)이 필요하니 클라이언트 컴포넌트 */
export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);

  return (
    <div className="not-prose my-6 flex items-center gap-4 rounded-lg border border-line p-4">
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background transition-opacity hover:opacity-80"
      >
        +1
      </button>
      <button
        type="button"
        onClick={() => setCount(initial)}
        className="rounded-md border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        초기화
      </button>
      <span className="font-mono text-sm">count = {count}</span>
    </div>
  );
}
