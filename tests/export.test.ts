import { describe, expect, it } from "vitest";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { buildCampaignExport, exportFileName } from "@/lib/export";
import { SEED_PERSONAS, emptyPersona } from "@/lib/personas/defaults";

describe("buildCampaignExport", () => {
  const base = {
    brief: SAMPLE_BRIEF,
    personas: SEED_PERSONAS,
    selectedAudienceIds: [SEED_PERSONAS[0].id, SEED_PERSONAS[3].id],
    selectedStrategy: null,
    attachments: [],
    completedSections: ["campaign-basics"] as const,
    now: new Date("2024-03-01T12:00:00.000Z"),
  };

  it("includes only the selected audiences", () => {
    const result = buildCampaignExport({ ...base });
    expect(result.selectedAudiences.map((p) => p.id)).toEqual([
      SEED_PERSONAS[0].id,
      SEED_PERSONAS[3].id,
    ]);
  });

  it("round-trips through JSON without losing anything", () => {
    const result = buildCampaignExport({ ...base });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("stamps the supplied time", () => {
    expect(buildCampaignExport({ ...base }).exportedAt).toBe(
      "2024-03-01T12:00:00.000Z"
    );
  });
});

describe("exportFileName", () => {
  it("slugifies the project name", () => {
    expect(exportFileName("NovaFlow Launch Campaign")).toBe(
      "novaflow-launch-campaign-export.json"
    );
  });

  it("falls back when the name has no usable characters", () => {
    expect(exportFileName("!!!")).toBe("campaign-export.json");
  });
});

describe("personas", () => {
  it("are fully serialisable, holding document metadata rather than File handles", () => {
    for (const persona of SEED_PERSONAS) {
      expect(() => JSON.stringify(persona)).not.toThrow();
      expect(Array.isArray(persona.documents)).toBe(true);
    }
  });

  it("seed personas arrive populated so editing one shows a filled form", () => {
    for (const persona of SEED_PERSONAS) {
      expect(persona.name.trim()).not.toBe("");
      expect(persona.description.trim()).not.toBe("");
      expect(persona.demographic.trim()).not.toBe("");
    }
  });

  it("gives every persona a unique id", () => {
    expect(new Set(SEED_PERSONAS.map((p) => p.id)).size).toBe(
      SEED_PERSONAS.length
    );
  });

  it("creates blank personas with distinct ids", () => {
    expect(emptyPersona().id).not.toBe(emptyPersona().id);
  });
});
