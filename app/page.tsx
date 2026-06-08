import { Suspense } from "react";
import StrategyApp from "@/components/StrategyApp";

/** The wizard reads its position from the query string, so it needs a boundary. */
export default function Home() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="flex min-h-screen items-center justify-center font-mono text-sm text-muted-foreground"
        >
          Loading campaign workspace…
        </div>
      }
    >
      <StrategyApp />
    </Suspense>
  );
}
