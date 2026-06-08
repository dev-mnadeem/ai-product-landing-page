import type { ReactNode } from "react";

/** Shared chrome for every content block, so spacing is defined once. */
export default function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <h3 className="mb-3 font-serif text-xl font-semibold text-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
