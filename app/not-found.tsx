import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        404
      </p>
      <h1 className="font-serif text-3xl font-semibold">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The campaign workspace lives on a single page. Sections are selected
        with the <code className="font-mono">?section=</code> query parameter.
      </p>
      <Link
        href="/"
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand-hover"
      >
        Back to the workspace
      </Link>
    </main>
  );
}
