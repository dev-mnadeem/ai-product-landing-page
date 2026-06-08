import { describe, expect, it } from "vitest";
import { WORKFLOW_STEPS } from "@/lib/workflow/steps";
import {
  SECTION_ORDER,
  TOTAL_SECTIONS,
  completionPercent,
  getSection,
  getStepNumber,
  isFirstSection,
  isLastSection,
  isSectionId,
  isStepComplete,
  nextSection,
  previousSection,
  toSectionId,
} from "@/lib/workflow/navigation";

describe("workflow definition", () => {
  it("declares four steps covering every section exactly once", () => {
    expect(WORKFLOW_STEPS).toHaveLength(4);
    expect(new Set(SECTION_ORDER).size).toBe(SECTION_ORDER.length);
    expect(TOTAL_SECTIONS).toBe(SECTION_ORDER.length);
  });

  it("gives every section a label and a description", () => {
    for (const id of SECTION_ORDER) {
      const section = getSection(id);
      expect(section.label.trim()).not.toBe("");
      expect(section.description.trim()).not.toBe("");
    }
  });

  it("maps each section back to the step that owns it", () => {
    for (const step of WORKFLOW_STEPS) {
      for (const section of step.sections) {
        expect(getStepNumber(section.id)).toBe(step.id);
      }
    }
  });
});

describe("navigation", () => {
  it("walks forward through every section and stops at the end", () => {
    let current = SECTION_ORDER[0];
    const visited = [current];
    for (let i = 0; i < TOTAL_SECTIONS + 3; i += 1) {
      const next = nextSection(current);
      if (next === current) break;
      current = next;
      visited.push(current);
    }
    expect(visited).toEqual([...SECTION_ORDER]);
  });

  it("clamps rather than wrapping at both ends", () => {
    const first = SECTION_ORDER[0];
    const last = SECTION_ORDER[SECTION_ORDER.length - 1];
    expect(previousSection(first)).toBe(first);
    expect(nextSection(last)).toBe(last);
    expect(isFirstSection(first)).toBe(true);
    expect(isLastSection(last)).toBe(true);
    expect(isFirstSection(last)).toBe(false);
  });

  it("recognises known section ids and rejects anything else", () => {
    expect(isSectionId("strategy-selection")).toBe(true);
    expect(isSectionId("does-not-exist")).toBe(false);
    expect(isSectionId(undefined)).toBe(false);
  });

  it("falls back to the first section for junk query values", () => {
    expect(toSectionId("concept-refinement")).toBe("concept-refinement");
    expect(toSectionId("../../etc/passwd")).toBe(SECTION_ORDER[0]);
    expect(toSectionId(null)).toBe(SECTION_ORDER[0]);
  });
});

describe("progress", () => {
  it("reports 0 and 100 at the extremes", () => {
    expect(completionPercent([])).toBe(0);
    expect(completionPercent(SECTION_ORDER)).toBe(100);
  });

  it("cannot exceed 100 when given duplicates or unknown ids", () => {
    const noisy = [...SECTION_ORDER, ...SECTION_ORDER, "bogus", "bogus"];
    expect(completionPercent(noisy)).toBe(100);
  });

  it("marks a step complete only once all of its sections are done", () => {
    const step = WORKFLOW_STEPS[0];
    const partial = step.sections.slice(0, 2).map((s) => s.id);
    expect(isStepComplete(step, partial)).toBe(false);
    expect(isStepComplete(step, step.sections.map((s) => s.id))).toBe(true);
  });
});
