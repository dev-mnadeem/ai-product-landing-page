import { describe, expect, it } from "vitest";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { MAX_TEXT_FIELD_LENGTH, validateBrief } from "@/lib/brief/validate";

describe("validateBrief", () => {
  it("accepts the sample brief unchanged in its required fields", () => {
    const result = validateBrief(SAMPLE_BRIEF);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.brief.client).toBe(SAMPLE_BRIEF.client);
    expect(result.brief.competitors).toHaveLength(
      SAMPLE_BRIEF.competitors.length
    );
    expect(result.brief.successMetrics).toHaveLength(
      SAMPLE_BRIEF.successMetrics.length
    );
  });

  it("rejects a non-object body", () => {
    for (const input of [null, "a string", 42, ["array"]]) {
      expect(validateBrief(input).ok).toBe(false);
    }
  });

  it("names every missing required field", () => {
    const result = validateBrief({});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "client must be a string",
        "product must be a string",
        "audience must be a string",
      ])
    );
  });

  it("rejects a required field that is only whitespace", () => {
    const result = validateBrief({ ...SAMPLE_BRIEF, client: "   " });
    expect(result.ok).toBe(false);
  });

  it("rejects a field longer than the prompt-size cap", () => {
    const result = validateBrief({
      ...SAMPLE_BRIEF,
      marketBackground: "x".repeat(MAX_TEXT_FIELD_LENGTH + 1),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toContain("marketBackground");
  });

  it("drops malformed array entries instead of trusting them", () => {
    const result = validateBrief({
      ...SAMPLE_BRIEF,
      competitors: [{ name: "Real", note: "ok" }, { name: 5 }, "nope", null],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.brief.competitors).toEqual([{ name: "Real", note: "ok" }]);
  });

  it("rejects an array field that is not an array", () => {
    const result = validateBrief({ ...SAMPLE_BRIEF, objectives: "many" });
    expect(result.ok).toBe(false);
  });

  it("keeps only string metrics inside a success-metric group", () => {
    const result = validateBrief({
      ...SAMPLE_BRIEF,
      successMetrics: [{ title: "Reach", metrics: ["ok", 3, null] }],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.brief.successMetrics[0].metrics).toEqual(["ok"]);
  });
});
