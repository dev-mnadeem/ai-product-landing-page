"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in campaign workspace", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900">
        The workspace hit an error
      </h1>
      <p className="max-w-md text-sm text-gray-600">
        Nothing entered in this session has been sent anywhere. Retrying
        re-renders the current section.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-gray-400">digest {error.digest}</p>
      )}
      <Button variant="brand" onClick={reset} className="cursor-pointer">
        Try again
      </Button>
    </main>
  );
}
