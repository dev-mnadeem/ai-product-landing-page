import { STRATEGY_ANGLES, extractFacts } from "./angles";
import {
  clampCount,
  type StrategyProvider,
  type StrategyRecommendation,
  type StrategyRequest,
  type StrategyResult,
} from "./types";

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/**
 * FNV-1a over the brief's own text. Two runs of the same brief pick the same
 * angles in the same order, which is what makes the suite assertable and the
 * screenshots reproducible.
 */
export function hashBrief(seed: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

function seedFor(request: StrategyRequest): string {
  const { brief } = request;
  return [
    brief.client,
    brief.product,
    brief.audience,
    brief.marketBackground,
    brief.objectives.map((o) => o.title).join("|"),
    brief.competitors.map((c) => c.name).join("|"),
  ].join("::");
}

/**
 * The default strategy source: no network, no key, no cost, same answer every
 * time. It composes recommendations from a catalogue of planning angles and
 * the facts in the brief, so the output is specific to the campaign rather
 * than boilerplate.
 */
export class LocalStrategyProvider implements StrategyProvider {
  readonly name = "local";

  async generate(request: StrategyRequest): Promise<StrategyResult> {
    const count = clampCount(request.count);
    const facts = extractFacts(request.brief);
    const offset = hashBrief(seedFor(request)) % STRATEGY_ANGLES.length;

    const strategies: StrategyRecommendation[] = [];
    for (let i = 0; i < count; i += 1) {
      const angle = STRATEGY_ANGLES[(offset + i) % STRATEGY_ANGLES.length];
      strategies.push({
        id: angle.key,
        title: angle.title,
        positioning: angle.positioning(facts),
        rationale: angle.rationale(facts),
        channels: angle.channels,
        firstMove: angle.firstMove(facts),
      });
    }

    return { provider: this.name, strategies };
  }
}
