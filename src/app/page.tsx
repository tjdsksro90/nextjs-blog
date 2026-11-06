import { PostList } from '@/components/PostList';
import { getPosts } from '@/lib/posts';
import { site } from '@/lib/site';

export default function Home() {
  return (
    <>
      <section className="pt-16 pb-10">
        <h1 className="text-3xl font-bold tracking-tight">{site.title}</h1>
        <p className="mt-3 text-muted">{site.description}</p>
      </section>

      <PostList posts={getPosts()} />
    </>
  );
}
