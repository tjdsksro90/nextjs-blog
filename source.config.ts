import { defineConfig } from 'fumadocs-mdx/config';

// fumadocs-mdx 전역 설정. 글 컬렉션은 Macro API(lib/source.ts)에서 정의한다.
export default defineConfig({
  mdxOptions: {
    // page.mdx 같은 MDX 파일이 src/mdx-components.tsx의 컴포넌트를 쓰게 연결한다
    providerImportSource: '@/mdx-components',
  },
});
