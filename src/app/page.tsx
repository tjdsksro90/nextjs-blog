import { PostList } from '@/components/PostList';
import { getPosts, groupByYear } from '@/lib/posts';
import { site } from '@/lib/site';

export default function Home() {
  const groups = groupByYear(getPosts());

  return (
    <>
      <section className="pt-16 pb-10">
        <h1 className="text-3xl font-bold tracking-tight">{site.title}</h1>
        <p className="mt-3 text-muted">{site.description}</p>
      </section>

      {groups.length === 0 ? (
        <PostList posts={[]} />
      ) : (
        groups.map(({ year, posts }) => (
          <section key={year} className="mb-12">
            <h2 className="mb-2 flex items-baseline gap-2 font-mono text-sm font-semibold text-muted">
              {year}
              <span className="text-xs font-normal">{posts.length}편</span>
            </h2>
            <PostList posts={posts} />
          </section>
        ))
      )}
    </>
  );
}
