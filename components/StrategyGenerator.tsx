"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CampaignBrief } from "@/lib/brief/types";
import {
  DEFAULT_STRATEGY_COUNT,
  type StrategyRecommendation,
} from "@/lib/strategy/types";

/** How long the browser waits before giving up on the route handler. */
const CLIENT_TIMEOUT_MS = 30_000;

interface StrategyGeneratorProps {
  brief: CampaignBrief;
  selectedStrategyId: string | null;
  onSelect: (strategy: StrategyRecommendation) => void;
}

type Status = "idle" | "loading" | "ready" | "error";

interface ErrorState {
  readonly message: string;
  readonly kind: string;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-5">
      <div className="mb-3 h-5 w-1/3 rounded bg-muted" />
      <div className="mb-2 h-3 w-full rounded bg-muted" />
      <div className="mb-2 h-3 w-5/6 rounded bg-muted" />
      <div className="h-3 w-2/3 rounded bg-muted" />
    </div>
  );
}

export default function StrategyGenerator({
  brief,
  selectedStrategyId,
  onSelect,
}: StrategyGeneratorProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [strategies, setStrategies] = useState<StrategyRecommendation[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/strategies", {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief, count: DEFAULT_STRATEGY_COUNT }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError({
          message:
            payload?.error ??
            `Strategy generation failed with status ${response.status}.`,
          kind: payload?.kind ?? "upstream_error",
        });
        setStatus("error");
        return;
      }

      setStrategies(payload?.strategies ?? []);
      setProvider(payload?.provider ?? null);
      setStatus("ready");
    } catch {
      if (controller.signal.aborted && inFlight.current !== controller) {
        // Superseded by a newer request; leave that one to update the state.
        return;
      }
      setError({
        message: controller.signal.aborted
          ? "The request timed out before the strategies came back."
          : "Could not reach the strategy service.",
        kind: controller.signal.aborted ? "timeout" : "network",
      });
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  }, [brief]);

  // Generate once on mount so the section is never an empty panel with a
  // button on it. Fetching on mount is exactly what an effect is for, and the
  // state it sets is the response — the lint rule targets synchronous cascades.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch
    void generate();
    return () => inFlight.current?.abort();
  }, [generate]);

  return (
    <section aria-labelledby="strategy-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3
            id="strategy-heading"
            className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground"
          >
            <Sparkles aria-hidden="true" className="h-4 w-4 text-brand" />
            Generated Strategy Recommendations
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Derived from the brief
            {provider ? (
              <>
                {" · "}
                <span className="font-mono text-xs">{provider} provider</span>
              </>
            ) : null}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="brandOutline"
          onClick={generate}
          disabled={status === "loading"}
          className="shrink-0 cursor-pointer gap-2 self-start sm:self-auto"
        >
          <RefreshCw
            aria-hidden="true"
            className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`}
          />
          {status === "loading" ? "Generating" : "Regenerate"}
        </Button>
      </div>

      {status === "loading" && (
        <div className="space-y-3" aria-busy="true" role="status">
          <span className="sr-only">Generating strategies</span>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {status === "error" && error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-brand/40 bg-marker/50 p-4"
        >
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-brand"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {error.kind === "refused"
                ? "The model declined this brief"
                : "Strategy generation did not complete"}
            </p>
            <p className="mt-1 text-sm text-foreground/80">{error.message}</p>
            <Button
              type="button"
              size="sm"
              variant="brand"
              onClick={generate}
              className="mt-3 cursor-pointer"
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {status === "ready" && strategies.length === 0 && (
        <p className="rounded-lg border border-dashed border-input bg-card p-4 text-sm text-muted-foreground">
          No strategies came back for this brief. Add more detail to the brief
          and regenerate.
        </p>
      )}

      {status === "ready" && strategies.length > 0 && (
        <ol className="space-y-4">
          {strategies.map((strategy, index) => {
            const isSelected = strategy.id === selectedStrategyId;
            return (
              <li key={strategy.id}>
                <article
                  aria-labelledby={`strategy-${strategy.id}`}
                  className={`rounded-lg border bg-card p-5 transition-colors sm:p-6 ${
                    isSelected
                      ? "border-brand shadow-[inset_4px_0_0_var(--brand)]"
                      : "border-border hover:border-input"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                        Route {String.fromCharCode(65 + index)}
                      </p>
                      <h4
                        id={`strategy-${strategy.id}`}
                        className="font-serif text-xl font-semibold text-foreground"
                      >
                        {strategy.title}
                      </h4>
                    </div>
                    {isSelected && (
                      <Badge className="shrink-0 gap-1 border-transparent bg-brand text-brand-foreground">
                        <Check aria-hidden="true" className="h-3 w-3" />
                        Selected
                      </Badge>
                    )}
                  </div>

                  <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground">
                    {strategy.positioning}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {strategy.rationale}
                  </p>

                  <ul aria-label="Channels" className="mt-4 flex flex-wrap gap-2">
                    {strategy.channels.map((channel) => (
                      <li
                        key={channel}
                        className="rounded-sm border border-border bg-muted px-2 py-0.5 font-mono text-xs text-foreground"
                      >
                        {channel}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 border-l-2 border-moss pl-3 text-sm text-foreground">
                    <span className="font-semibold">First move: </span>
                    {strategy.firstMove}
                  </p>

                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "brand" : "brandOutline"}
                    onClick={() => onSelect(strategy)}
                    className="mt-5 cursor-pointer"
                  >
                    {isSelected ? "Keep this strategy" : "Select this strategy"}
                  </Button>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
