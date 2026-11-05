import { site } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted">
        <span>© {site.author}</span>
        <div className="flex gap-4">
          <a href={site.links.github} target="_blank" rel="noreferrer" className="hover:text-foreground">
            GitHub
          </a>
          <a href={site.links.portfolio} target="_blank" rel="noreferrer" className="hover:text-foreground">
            Portfolio
          </a>
        </div>
      </div>
    </footer>
  );
}
