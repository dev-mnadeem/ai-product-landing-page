import { describe, expect, it } from "vitest";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { buildSectionContent, sectionsWithoutContent } from "@/lib/content/sections";
import { SECTION_ORDER } from "@/lib/workflow/navigation";

const content = buildSectionContent(SAMPLE_BRIEF);

describe("section content", () => {
  it("covers every section in the workflow", () => {
    expect(Object.keys(content).sort()).toEqual([...SECTION_ORDER].sort());
  });

  it("leaves no section rendering an empty page", () => {
    expect(sectionsWithoutContent(content)).toEqual([]);
  });

  it("reflects the brief rather than hard-coded copy", () => {
    const altered = buildSectionContent({
      ...SAMPLE_BRIEF,
      clientDetails: "A completely different client description.",
    });
    const block = altered["campaign-basics"][0];
    expect(block.kind).toBe("prose");
    if (block.kind !== "prose") return;
    expect(block.body).toBe("A completely different client description.");
  });

  it("places the upload, audience and generator widgets in the right sections", () => {
    const widget = (section: keyof typeof content) =>
      content[section]
        .filter((block) => block.kind === "interactive")
        .map((block) => (block.kind === "interactive" ? block.component : ""));

    expect(widget("campaign-basics")).toContain("file-upload");
    expect(widget("market-intelligence")).toContain("audience-picker");
    expect(widget("strategy-selection")).toContain("strategy-generator");
  });

  it("carries the brief's KPI rows into the objectives section", () => {
    const rows = content["strategic-objectives"].find(
      (block) => block.kind === "key-values"
    );
    expect(rows?.kind).toBe("key-values");
    if (rows?.kind !== "key-values") return;
    expect(rows.rows).toEqual(SAMPLE_BRIEF.kpis);
  });
});
