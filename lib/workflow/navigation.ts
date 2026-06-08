import {
  FIRST_SECTION_ID,
  WORKFLOW_STEPS,
  type SectionId,
  type StepId,
  type WorkflowSection,
  type WorkflowStep,
} from "./steps";

/** Every section id in wizard order, flattened across the four steps. */
export const SECTION_ORDER: readonly SectionId[] = WORKFLOW_STEPS.flatMap(
  (step) => step.sections.map((section) => section.id)
);

export const TOTAL_SECTIONS = SECTION_ORDER.length;

const SECTIONS_BY_ID = new Map<SectionId, WorkflowSection>(
  WORKFLOW_STEPS.flatMap((step) =>
    step.sections.map((section) => [section.id, section] as const)
  )
);

const STEP_BY_SECTION_ID = new Map<SectionId, WorkflowStep>(
  WORKFLOW_STEPS.flatMap((step) =>
    step.sections.map((section) => [section.id, step] as const)
  )
);

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === "string" && SECTIONS_BY_ID.has(value as SectionId);
}

/**
 * Coerce anything (a query string, a stale localStorage value) to a section id,
 * falling back to the first section rather than rendering an empty wizard.
 */
export function toSectionId(value: unknown): SectionId {
  return isSectionId(value) ? value : FIRST_SECTION_ID;
}

export function getSection(id: SectionId): WorkflowSection {
  const section = SECTIONS_BY_ID.get(id);
  if (!section) {
    throw new Error(`Unknown section id: ${id}`);
  }
  return section;
}

export function getStepForSection(id: SectionId): WorkflowStep {
  const step = STEP_BY_SECTION_ID.get(id);
  if (!step) {
    throw new Error(`Unknown section id: ${id}`);
  }
  return step;
}

export function getStepNumber(id: SectionId): StepId {
  return getStepForSection(id).id;
}

/** The previous section, or the same id when already at the start. */
export function previousSection(id: SectionId): SectionId {
  const index = SECTION_ORDER.indexOf(id);
  return index > 0 ? SECTION_ORDER[index - 1] : id;
}

/** The next section, or the same id when already at the end. */
export function nextSection(id: SectionId): SectionId {
  const index = SECTION_ORDER.indexOf(id);
  return index >= 0 && index < SECTION_ORDER.length - 1
    ? SECTION_ORDER[index + 1]
    : id;
}

export function isFirstSection(id: SectionId): boolean {
  return SECTION_ORDER.indexOf(id) === 0;
}

export function isLastSection(id: SectionId): boolean {
  return SECTION_ORDER.indexOf(id) === SECTION_ORDER.length - 1;
}

/**
 * Completion as a 0-100 percentage. Unknown ids in `completed` are ignored and
 * duplicates are collapsed, so the progress bar can never exceed 100%.
 */
export function completionPercent(completed: readonly string[]): number {
  const known = new Set(completed.filter(isSectionId));
  return Math.round((known.size / TOTAL_SECTIONS) * 100);
}

/**
 * A step counts as complete once every one of its sections has been visited
 * and confirmed with Next.
 */
export function isStepComplete(
  step: WorkflowStep,
  completed: readonly string[]
): boolean {
  const known = new Set(completed);
  return step.sections.every((section) => known.has(section.id));
}
