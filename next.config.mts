import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';

// fumadocs-mdx는 ESM 전용이라 .mts 확장자를 쓴다 (Node 22.18+의 네이티브 TS 지원으로 실행됨)
const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

// .mdx를 React 컴포넌트로 바꾸는 로더를 붙인다. 위의 turbopack.rules는 그대로 합쳐진다.
const withMDX = createMDX();

export default withMDX(nextConfig);
