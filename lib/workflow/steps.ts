/**
 * The single source of truth for the campaign workflow.
 *
 * Every step, every section, its label and its blurb live here. The sidebar,
 * the section header, the Back/Next buttons and the content renderer all read
 * from this one array, so adding a section is a one-file change.
 */

export type SectionId =
  | "campaign-basics"
  | "market-intelligence"
  | "strategic-objectives"
  | "strategy-selection"
  | "strategy-customization"
  | "strategy-validation"
  | "concept-generation"
  | "concept-refinement"
  | "concept-finalization"
  | "execution-planning"
  | "resource-allocation"
  | "timeline-management";

export type StepId = 1 | 2 | 3 | 4;

export type StepIconName = "brief" | "strategy" | "concept" | "execution";

export interface WorkflowSection {
  readonly id: SectionId;
  readonly label: string;
  /** Shown under the page title, and used as the sidebar sub-item tooltip. */
  readonly description: string;
}

export interface WorkflowStep {
  readonly id: StepId;
  readonly title: string;
  readonly icon: StepIconName;
  readonly description: string;
  readonly sections: readonly WorkflowSection[];
}

export const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    id: 1,
    title: "Brief",
    icon: "brief",
    description:
      "The more details you provide, the more accurate your generated strategy will be.",
    sections: [
      {
        id: "campaign-basics",
        label: "Campaign Basics",
        description:
          "Provide essential info about client, product, and resources.",
      },
      {
        id: "market-intelligence",
        label: "Market Intelligence",
        description:
          "Analyze market landscape, competitors, and target audience insights.",
      },
      {
        id: "strategic-objectives",
        label: "Strategic Objectives",
        description:
          "Define clear objectives, success metrics, and key performance indicators.",
      },
    ],
  },
  {
    id: 2,
    title: "Strategy",
    icon: "strategy",
    description:
      "We've designed strategies aligned with your objectives. Pick the one that feels right.",
    sections: [
      {
        id: "strategy-selection",
        label: "Strategy Selection",
        description:
          "Choose the most effective strategy from the generated recommendations.",
      },
      {
        id: "strategy-customization",
        label: "Strategy Customization",
        description:
          "Customize your selected strategy to match your specific requirements.",
      },
      {
        id: "strategy-validation",
        label: "Strategy Validation",
        description:
          "Validate and refine your strategy before moving to concept development.",
      },
    ],
  },
  {
    id: 3,
    title: "Concept",
    icon: "concept",
    description: "Concepts for your selected strategy",
    sections: [
      {
        id: "concept-generation",
        label: "Concept Generation",
        description: "Generate creative concepts based on your validated strategy.",
      },
      {
        id: "concept-refinement",
        label: "Concept Refinement",
        description:
          "Refine and improve your concepts through iterative feedback.",
      },
      {
        id: "concept-finalization",
        label: "Concept Finalization",
        description:
          "Finalize your concepts and prepare them for execution planning.",
      },
    ],
  },
  {
    id: 4,
    title: "Execution",
    icon: "execution",
    description: "Bring your strategy to life with detailed execution plans",
    sections: [
      {
        id: "execution-planning",
        label: "Execution Planning",
        description: "Create detailed execution plans for your finalized concepts.",
      },
      {
        id: "resource-allocation",
        label: "Resource Allocation",
        description:
          "Allocate resources and assign responsibilities for execution.",
      },
      {
        id: "timeline-management",
        label: "Timeline Management",
        description:
          "Set timelines and milestones for successful project delivery.",
      },
    ],
  },
] as const;

export const FIRST_SECTION_ID: SectionId = WORKFLOW_STEPS[0].sections[0].id;
