import { NextResponse } from "next/server";
import { validateBrief } from "@/lib/brief/validate";
import { loadConfig } from "@/lib/config";
import { getStrategyProvider } from "@/lib/strategy/registry";
import {
  StrategyError,
  clampCount,
  type StrategyFailureKind,
} from "@/lib/strategy/types";

/** Providers may call out to the network, so this route is never prerendered. */
export const dynamic = "force-dynamic";

const STATUS_BY_KIND: Record<StrategyFailureKind, number> = {
  invalid_request: 400,
  timeout: 504,
  refused: 422,
  upstream_error: 502,
  unparseable: 502,
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const payload = body as { brief?: unknown; count?: unknown };
  const validation = validateBrief(payload?.brief);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "The brief is incomplete.", details: validation.errors },
      { status: 400 }
    );
  }

  const count = clampCount(
    typeof payload.count === "number" ? payload.count : undefined
  );

  const config = loadConfig();
  const provider = getStrategyProvider(config);

  try {
    const result = await provider.generate({ brief: validation.brief, count });
    return NextResponse.json(result, {
      // The local provider is a pure function of the brief, so the answer is
      // safe to reuse. The hosted one is not guaranteed to be.
      headers: {
        "cache-control":
          config.providerName === "local"
            ? "private, max-age=60"
            : "no-store",
      },
    });
  } catch (cause) {
    if (cause instanceof StrategyError) {
      return NextResponse.json(
        { error: cause.message, kind: cause.kind },
        { status: STATUS_BY_KIND[cause.kind] }
      );
    }
    return NextResponse.json(
      { error: "Strategy generation failed.", kind: "upstream_error" },
      { status: 500 }
    );
  }
}
