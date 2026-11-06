export default function AboutLayout({ children }: LayoutProps<'/about'>) {
  return <div className="prose prose-neutral max-w-none pt-16 dark:prose-invert prose-a:text-accent">{children}</div>;
}
