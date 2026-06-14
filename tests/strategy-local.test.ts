import { describe, expect, it } from "vitest";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { STRATEGY_ANGLES, extractFacts } from "@/lib/strategy/angles";
import { LocalStrategyProvider, hashBrief } from "@/lib/strategy/local-provider";
import { clampCount, MAX_STRATEGIES } from "@/lib/strategy/types";

const provider = new LocalStrategyProvider();

describe("LocalStrategyProvider", () => {
  it("returns the requested number of recommendations", async () => {
    const result = await provider.generate({ brief: SAMPLE_BRIEF, count: 3 });
    expect(result.provider).toBe("local");
    expect(result.strategies).toHaveLength(3);
  });

  it("is deterministic: the same brief yields the same strategies", async () => {
    const a = await provider.generate({ brief: SAMPLE_BRIEF, count: 3 });
    const b = await provider.generate({ brief: SAMPLE_BRIEF, count: 3 });
    expect(b.strategies).toEqual(a.strategies);
  });

  it("changes the selection when the brief changes", async () => {
    const original = await provider.generate({ brief: SAMPLE_BRIEF, count: 3 });
    const altered = await provider.generate({
      brief: { ...SAMPLE_BRIEF, client: "Northwind Logistics", product: "Freightly" },
      count: 3,
    });
    expect(altered.strategies.map((s) => s.id)).not.toEqual(
      original.strategies.map((s) => s.id)
    );
  });

  it("never repeats an angle within one response", async () => {
    const result = await provider.generate({ brief: SAMPLE_BRIEF, count: MAX_STRATEGIES });
    expect(new Set(result.strategies.map((s) => s.id)).size).toBe(MAX_STRATEGIES);
  });

  it("fills every field with non-empty prose", async () => {
    const { strategies } = await provider.generate({ brief: SAMPLE_BRIEF });
    for (const strategy of strategies) {
      expect(strategy.title.trim().length).toBeGreaterThan(0);
      expect(strategy.positioning.length).toBeGreaterThan(40);
      expect(strategy.rationale.length).toBeGreaterThan(40);
      expect(strategy.firstMove.length).toBeGreaterThan(20);
      expect(strategy.channels.length).toBeGreaterThan(0);
    }
  });

  it("grounds the output in the brief rather than emitting boilerplate", async () => {
    const { strategies } = await provider.generate({ brief: SAMPLE_BRIEF, count: MAX_STRATEGIES });
    const text = strategies
      .map((s) => `${s.positioning} ${s.rationale} ${s.firstMove}`)
      .join(" ");
    expect(text).toContain(SAMPLE_BRIEF.product);
    expect(text).toContain(SAMPLE_BRIEF.client);
    expect(text).toContain(SAMPLE_BRIEF.competitors[0].name);
  });

  it("leaves no unreplaced template slots", async () => {
    const { strategies } = await provider.generate({ brief: SAMPLE_BRIEF, count: MAX_STRATEGIES });
    for (const strategy of strategies) {
      expect(`${strategy.positioning}${strategy.rationale}${strategy.firstMove}`).not.toMatch(
        /[{}]/
      );
    }
  });

  it("clamps an absurd count into range", async () => {
    expect(clampCount(0)).toBe(1);
    expect(clampCount(99)).toBe(MAX_STRATEGIES);
    expect(clampCount(undefined)).toBe(3);
    const result = await provider.generate({ brief: SAMPLE_BRIEF, count: 99 });
    expect(result.strategies).toHaveLength(MAX_STRATEGIES);
  });
});

describe("brief facts", () => {
  it("substitutes placeholders when the brief is thin", () => {
    const facts = extractFacts({
      ...SAMPLE_BRIEF,
      competitors: [],
      objectives: [],
      kpis: [],
      previousCampaigns: [],
    });
    expect(facts.leadCompetitor).toBe("the category leader");
    expect(facts.topObjective).toBe("the primary objective");
    expect(facts.headlineMetric).toBe("the headline KPI");
  });
});

describe("hashBrief", () => {
  it("is stable and differs between inputs", () => {
    expect(hashBrief("novaflow")).toBe(hashBrief("novaflow"));
    expect(hashBrief("novaflow")).not.toBe(hashBrief("freightly"));
  });

  it("stays inside the angle catalogue when used as an index", () => {
    for (const seed of ["a", "bb", "ccc", "TechNova", ""]) {
      const index = hashBrief(seed) % STRATEGY_ANGLES.length;
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(STRATEGY_ANGLES.length);
    }
  });
});
