/**
 * Public type barrel. The definitions live next to the modules that own them
 * under `lib/`; this file exists so components can keep importing `@/types`.
 */
export type { CampaignBrief, Competitor, Kpi, MetricGroup, Objective } from "@/lib/brief/types";
export type { Persona, PersonaSummary } from "@/lib/personas/types";
export type {
  RejectedFile,
  UploadValidationResult,
  UploadedDocument,
} from "@/lib/uploads/types";
export type {
  StrategyRecommendation,
  StrategyRequest,
  StrategyResult,
} from "@/lib/strategy/types";
export type { SectionId, StepId, WorkflowSection, WorkflowStep } from "@/lib/workflow/steps";
