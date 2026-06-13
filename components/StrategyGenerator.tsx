"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 h-4 w-1/3 rounded bg-gray-200" />
      <div className="mb-2 h-3 w-full rounded bg-gray-100" />
      <div className="mb-2 h-3 w-5/6 rounded bg-gray-100" />
      <div className="h-3 w-2/3 rounded bg-gray-100" />
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
    <Card className="border border-gray-200 bg-gray-50">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Sparkles className="h-4 w-4 text-brand" />
            Generated Strategy Recommendations
          </CardTitle>
          <p className="mt-1 text-sm text-gray-600">
            Derived from the brief above
            {provider ? ` · ${provider} provider` : ""}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="brandOutline"
          onClick={generate}
          disabled={status === "loading"}
          className="shrink-0 cursor-pointer gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`}
          />
          {status === "loading" ? "Generating" : "Regenerate"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {status === "loading" && (
          <div className="space-y-3" aria-busy="true">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {status === "error" && error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {error.kind === "refused"
                  ? "The model declined this brief"
                  : "Strategy generation did not complete"}
              </p>
              <p className="mt-1 text-sm text-amber-800">{error.message}</p>
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
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
            No strategies came back for this brief. Add more detail to the brief
            and regenerate.
          </p>
        )}

        {status === "ready" &&
          strategies.map((strategy) => {
            const isSelected = strategy.id === selectedStrategyId;
            return (
              <article
                key={strategy.id}
                className={`rounded-lg border p-4 transition-colors ${
                  isSelected
                    ? "border-brand bg-white ring-1 ring-brand"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-semibold text-gray-900">
                    {strategy.title}
                  </h4>
                  {isSelected && (
                    <Badge className="shrink-0 gap-1 bg-brand text-brand-foreground">
                      <Check className="h-3 w-3" />
                      Selected
                    </Badge>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-gray-800">
                  {strategy.positioning}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {strategy.rationale}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {strategy.channels.map((channel) => (
                    <span
                      key={channel}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                    >
                      {channel}
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">
                    First move:{" "}
                  </span>
                  {strategy.firstMove}
                </p>

                <Button
                  type="button"
                  size="sm"
                  variant={isSelected ? "brand" : "brandOutline"}
                  onClick={() => onSelect(strategy)}
                  className="mt-4 cursor-pointer"
                >
                  {isSelected ? "Keep this strategy" : "Select this strategy"}
                </Button>
              </article>
            );
          })}
      </CardContent>
    </Card>
  );
}
