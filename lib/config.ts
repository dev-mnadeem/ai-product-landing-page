/**
 * Every environment variable the app reads, resolved in one place.
 *
 * None of these are `NEXT_PUBLIC_*`: the strategy provider runs inside the
 * route handler only, so the API key never reaches the browser bundle.
 */

export type StrategyProviderName = "local" | "openai";

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";

function readInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export interface AppConfig {
  readonly providerName: StrategyProviderName;
  readonly apiKey: string | undefined;
  readonly model: string;
  readonly baseUrl: string;
  readonly requestTimeoutMs: number;
}

/** `env` is injectable so the suite can exercise every branch without mutating process.env. */
export function loadConfig(
  env: Partial<Record<string, string>> = process.env
): AppConfig {
  const requested = (env.STRATEGY_PROVIDER ?? "local").toLowerCase();
  const apiKey = env.STRATEGY_API_KEY?.trim() || undefined;

  // `local` is the default and the fallback. A clone with no .env file still
  // runs, and asking for `openai` without a key degrades loudly-but-safely
  // rather than throwing at import time.
  const providerName: StrategyProviderName =
    requested === "openai" && apiKey ? "openai" : "local";

  return {
    providerName,
    apiKey,
    model: env.STRATEGY_MODEL?.trim() || DEFAULT_MODEL,
    baseUrl: (env.STRATEGY_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(
      /\/+$/,
      ""
    ),
    requestTimeoutMs: readInt(env.STRATEGY_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  };
}
