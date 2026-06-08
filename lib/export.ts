import type { CampaignBrief } from "@/lib/brief/types";
import type { Persona } from "@/lib/personas/types";
import type { StrategyRecommendation } from "@/lib/strategy/types";
import type { UploadedDocument } from "@/lib/uploads/types";
import type { SectionId } from "@/lib/workflow/steps";

export interface CampaignExport {
  readonly exportedAt: string;
  readonly brief: CampaignBrief;
  readonly selectedAudiences: readonly Persona[];
  readonly selectedStrategy: StrategyRecommendation | null;
  readonly attachments: readonly UploadedDocument[];
  readonly completedSections: readonly SectionId[];
}

/**
 * Serialise the whole working state. This is the reason personas hold document
 * metadata instead of `File` handles — the export is plain JSON.
 */
export function buildCampaignExport(input: {
  brief: CampaignBrief;
  personas: readonly Persona[];
  selectedAudienceIds: readonly string[];
  selectedStrategy: StrategyRecommendation | null;
  attachments: readonly UploadedDocument[];
  completedSections: readonly SectionId[];
  now?: Date;
}): CampaignExport {
  return {
    exportedAt: (input.now ?? new Date()).toISOString(),
    brief: input.brief,
    selectedAudiences: input.personas.filter((persona) =>
      input.selectedAudienceIds.includes(persona.id)
    ),
    selectedStrategy: input.selectedStrategy,
    attachments: input.attachments,
    completedSections: input.completedSections,
  };
}

/** Filesystem-safe file name for a downloaded export. */
export function exportFileName(projectName: string): string {
  const slug =
    projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "campaign";
  return `${slug}-export.json`;
}
