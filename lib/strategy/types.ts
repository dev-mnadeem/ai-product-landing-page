import type { CampaignBrief } from "@/lib/brief/types";

export interface StrategyRecommendation {
  readonly id: string;
  readonly title: string;
  /** One sentence a planner could read out in a pitch. */
  readonly positioning: string;
  /** Why this angle fits *this* brief. */
  readonly rationale: string;
  readonly channels: readonly string[];
  /** The concrete thing to do in week one. */
  readonly firstMove: string;
}

export interface StrategyRequest {
  readonly brief: CampaignBrief;
  /** How many recommendations to return. Clamped by the provider. */
  readonly count?: number;
}

export interface StrategyResult {
  readonly provider: string;
  readonly strategies: readonly StrategyRecommendation[];
}

/**
 * The seam every strategy source implements. Swapping the deterministic local
 * generator for a hosted model is a config change, not a code change.
 */
export interface StrategyProvider {
  readonly name: string;
  generate(request: StrategyRequest): Promise<StrategyResult>;
}

export type StrategyFailureKind =
  | "invalid_request"
  | "timeout"
  | "refused"
  | "upstream_error"
  | "unparseable";

/** A provider failure the route handler can map onto an HTTP status. */
export class StrategyError extends Error {
  constructor(
    readonly kind: StrategyFailureKind,
    message: string,
    readonly detail?: string
  ) {
    super(message);
    this.name = "StrategyError";
  }
}

export const MIN_STRATEGIES = 1;
export const MAX_STRATEGIES = 5;
export const DEFAULT_STRATEGY_COUNT = 3;

export function clampCount(count: number | undefined): number {
  if (!Number.isFinite(count)) return DEFAULT_STRATEGY_COUNT;
  return Math.min(MAX_STRATEGIES, Math.max(MIN_STRATEGIES, Math.trunc(count!)));
}
