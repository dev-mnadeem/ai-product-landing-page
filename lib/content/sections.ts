import type { CampaignBrief } from "@/lib/brief/types";
import type { SectionId } from "@/lib/workflow/steps";
import { SECTION_ORDER } from "@/lib/workflow/navigation";
import type { ContentBlock } from "./blocks";

/**
 * Build the block list for every section from a brief. Everything a section
 * shows is derived from the brief object, so a change to the campaign is
 * reflected everywhere at once instead of in one hand-edited card.
 */
export function buildSectionContent(
  brief: CampaignBrief
): Record<SectionId, readonly ContentBlock[]> {
  const content: Record<SectionId, readonly ContentBlock[]> = {
    "campaign-basics": [
      { kind: "prose", title: "Client Details", body: brief.clientDetails },
      { kind: "prose", title: "Product / Service", body: brief.productDetails },
      {
        kind: "prose",
        title: "Mandatory Requirements",
        body: brief.mandatoryRequirements,
      },
      { kind: "interactive", component: "file-upload" },
    ],

    "market-intelligence": [
      {
        kind: "prose",
        title: "Market & Product Background",
        body: brief.marketBackground,
      },
      {
        kind: "definition-list",
        title: "Competitors",
        items: brief.competitors.map((competitor) => ({
          label: competitor.name,
          detail: competitor.note,
        })),
      },
      { kind: "interactive", component: "audience-picker" },
      {
        kind: "definition-list",
        title: "Previous Campaigns & Learnings",
        items: brief.previousCampaigns.map((entry) => ({
          label: entry.label,
          detail: entry.detail,
        })),
      },
    ],

    "strategic-objectives": [
      {
        kind: "numbered-points",
        title: "Primary Objectives",
        items: brief.objectives,
      },
      {
        kind: "metric-groups",
        title: "Success Metrics",
        groups: brief.successMetrics,
      },
      {
        kind: "key-values",
        title: "Key Performance Indicators",
        rows: brief.kpis,
      },
    ],

    "strategy-selection": [{ kind: "interactive", component: "strategy-generator" }],

    "strategy-customization": [
      {
        kind: "prose",
        title: "Strategy Customization",
        body: `Adjust the selected strategy so it fits ${brief.client} specifically: tighten the audience definition, set the messaging register, and decide which channels carry the argument versus which ones only support it.`,
      },
      {
        kind: "checklist",
        title: "Customisation checklist",
        items: [
          `Narrow "${brief.audience}" to the two segments the budget can actually reach`,
          "Agree the messaging register with the brand team",
          "Assign a primary and a supporting channel to each objective",
          "Confirm nothing conflicts with the mandatory requirements",
        ],
      },
    ],

    "strategy-validation": [
      {
        kind: "prose",
        title: "Strategy Validation",
        body: "Validate through stakeholder review, a small-scale message test, and a feasibility pass against budget and timeline before any concept work begins.",
      },
      {
        kind: "checklist",
        title: "Before you move to concept",
        items: [
          "Stakeholder sign-off recorded with named approvers",
          "Message tested with at least one segment of the target audience",
          `Plan checked against the lead objective: ${
            brief.objectives[0]?.title ?? "not set"
          }`,
          "Budget and timeline confirmed as feasible by delivery",
        ],
      },
    ],

    "concept-generation": [
      {
        kind: "prose",
        title: "Concept Generation",
        body: `Turn the chosen strategy into concrete creative territories for ${brief.product}. Aim for three distinct routes rather than three variations of one idea.`,
      },
      {
        kind: "checklist",
        title: "What a finished concept needs",
        items: [
          "A one-line idea that survives being read aloud",
          "A hero execution in the primary channel",
          "Proof that it holds up in the two supporting channels",
          "A reason it could only belong to this brand",
        ],
      },
    ],

    "concept-refinement": [
      {
        kind: "prose",
        title: "Concept Refinement",
        body: "Refine the shortlisted routes through structured feedback: one round with the brand team, one with the client, one against the mandatory requirements.",
      },
      {
        kind: "checklist",
        title: "Refinement rounds",
        items: [
          "Internal creative review",
          "Client review with written feedback captured",
          "Compliance and brand-guideline pass",
        ],
      },
    ],

    "concept-finalization": [
      {
        kind: "prose",
        title: "Concept Finalization",
        body: "Lock the selected concept and package it for execution: final copy, final art direction, and an approvals record that delivery can rely on.",
      },
      {
        kind: "checklist",
        title: "Handover package",
        items: [
          "Approved master copy and art direction",
          "Asset list per channel with specifications",
          "Named approver and approval date for each element",
        ],
      },
    ],

    "execution-planning": [
      {
        kind: "prose",
        title: "Execution Planning",
        body: "Break the concept into deliverables with owners, dependencies and dates, and attach the success measure each deliverable is meant to move.",
      },
      {
        kind: "key-values",
        title: "Targets carried into execution",
        rows: brief.kpis,
      },
    ],

    "resource-allocation": [
      {
        kind: "prose",
        title: "Resource Allocation",
        body: "Distribute budget and people across the plan, and name the vendor or internal team accountable for each workstream.",
      },
      {
        kind: "checklist",
        title: "Allocation checklist",
        items: [
          "Budget split agreed per channel",
          "Named owner for every workstream",
          "Vendors briefed and contracted",
          "Contingency reserve held back",
        ],
      },
    ],

    "timeline-management": [
      {
        kind: "prose",
        title: "Timeline Management",
        body: "Set the milestones, review cycles and launch dates, and agree what constitutes a slip worth escalating.",
      },
      {
        kind: "checklist",
        title: "Milestones",
        items: [
          "Creative production complete",
          "Channel assets trafficked and QA'd",
          "Launch",
          "First performance review against the KPI set",
        ],
      },
    ],
  };

  return content;
}

/** Guard used by the suite: no section may render as an empty page. */
export function sectionsWithoutContent(
  content: Record<SectionId, readonly ContentBlock[]>
): SectionId[] {
  return SECTION_ORDER.filter((id) => (content[id]?.length ?? 0) === 0);
}
