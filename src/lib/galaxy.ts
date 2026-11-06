import type { GalaxyTag } from '@/components/explore/types';
import { getPosts, getTags } from './posts';

/**
 * Explore 은하에 그릴 데이터: 태그마다 그 태그의 글 목록.
 * getTags()는 글이 많은 태그부터 정렬되어 있다 → 글이 많은 태그일수록 항성 가까운 안쪽 궤도.
 * /explore 페이지와 블로그 글 속 데모가 같이 쓴다.
 */
export function getGalaxy(): GalaxyTag[] {
  const posts = getPosts();
  return getTags().map(({ tag }) => ({
    tag,
    posts: posts.filter((post) => post.tags.includes(tag)).map(({ title, url }) => ({ title, url })),
  }));
}
