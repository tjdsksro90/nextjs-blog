/** 은하에 그릴 데이터. 서버(page.tsx)에서 만들어 클라이언트(GalaxyCanvas)로 넘긴다 */
export type GalaxyTag = {
  tag: string; // 행성 하나
  posts: { title: string; url: string }[]; // 위성들
};
