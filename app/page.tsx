import { Suspense } from "react";
import StrategyApp from "@/components/StrategyApp";

/** The wizard reads its position from the query string, so it needs a boundary. */
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          Loading campaign workspace…
        </div>
      }
    >
      <StrategyApp />
    </Suspense>
  );
}
