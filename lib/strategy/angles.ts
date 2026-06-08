import type { CampaignBrief } from "@/lib/brief/types";

/** The facts pulled out of a brief that every angle template can reference. */
export interface BriefFacts {
  readonly client: string;
  readonly product: string;
  readonly audience: string;
  readonly topObjective: string;
  readonly leadCompetitor: string;
  readonly leadLearning: string;
  readonly headlineMetric: string;
}

const UNKNOWN = "the brief";

export function extractFacts(brief: CampaignBrief): BriefFacts {
  return {
    client: brief.client.trim() || UNKNOWN,
    product: brief.product.trim() || brief.client.trim() || UNKNOWN,
    audience: brief.audience.trim() || "the target audience",
    topObjective: brief.objectives[0]?.title.trim() || "the primary objective",
    leadCompetitor: brief.competitors[0]?.name.trim() || "the category leader",
    leadLearning:
      brief.previousCampaigns.at(-1)?.detail.trim() ||
      "no prior campaign learnings were supplied",
    headlineMetric: brief.kpis[0]
      ? `${brief.kpis[0].label} (${brief.kpis[0].value})`
      : "the headline KPI",
  };
}

export interface StrategyAngle {
  readonly key: string;
  readonly title: string;
  readonly channels: readonly string[];
  positioning(facts: BriefFacts): string;
  rationale(facts: BriefFacts): string;
  firstMove(facts: BriefFacts): string;
}

/**
 * The strategic angles the local generator draws from. They are written as
 * real planning positions rather than filler so that a reviewer reading the
 * generated output sees something a strategist could actually take to a client.
 */
export const STRATEGY_ANGLES: readonly StrategyAngle[] = [
  {
    key: "proof-over-promise",
    title: "Proof Over Promise",
    channels: ["Case study hub", "Analyst briefings", "Paid LinkedIn", "Email nurture"],
    positioning: (f) =>
      `Lead every ${f.product} touchpoint with a named customer outcome instead of a capability list, so ${f.audience} meet the result before they meet the feature.`,
    rationale: (f) =>
      `${f.topObjective} is the objective this campaign is judged on, and the previous round already told us where the friction is: ${f.leadLearning} A proof-led campaign turns that learning into the spine of the media plan.`,
    firstMove: (f) =>
      `Pick three ${f.client} accounts with measurable before-and-after numbers and commission one long-form case study per segment in week one.`,
  },
  {
    key: "category-redefinition",
    title: "Category Redefinition",
    channels: ["Owned research report", "Executive podcast tour", "Conference keynote", "Organic social"],
    positioning: (f) =>
      `Stop competing inside the automation category ${f.leadCompetitor} defined and name the problem ${f.product} actually solves, so the comparison set is rewritten in ${f.client}'s favour.`,
    rationale: (f) =>
      `Feature-for-feature comparison against ${f.leadCompetitor} is a fight on their terms. Publishing original research gives ${f.audience} a new vocabulary and gives the sales team a reason to make the first call.`,
    firstMove: () =>
      `Commission a benchmark study of how much working time is lost to manual handoffs, and hold the findings back for an embargoed launch.`,
  },
  {
    key: "time-to-value",
    title: "Time To First Value",
    channels: ["Interactive product tour", "Guided trial", "Search", "Lifecycle email"],
    positioning: (f) =>
      `Make the promise a clock rather than an adjective: show ${f.audience} exactly how long it takes to get one workflow live in ${f.product}, and let the trial prove it.`,
    rationale: (f) =>
      `Complexity was the stated blocker last time, not interest. Anchoring the campaign to a measured first win moves the argument from "can it do this" to "how fast", which is the question that closes ${f.headlineMetric}.`,
    firstMove: () =>
      `Instrument the trial to record time-to-first-automation, then build the launch creative around the median figure it reports back.`,
  },
  {
    key: "practitioner-advocacy",
    title: "Practitioner Advocacy",
    channels: ["Community program", "Template library", "Partner webinars", "Referral loop"],
    positioning: (f) =>
      `Win the operators who will run ${f.product} daily, and let their advocacy carry the business case upward to ${f.audience}.`,
    rationale: (f) =>
      `Budget sign-off sits with executives but the veto sits with the team that has to adopt the tool. Arming practitioners with shareable templates creates internal champions before ${f.client} ever sends a proposal.`,
    firstMove: () =>
      `Ship a public library of ready-made workflow templates and make every one of them forkable without an account.`,
  },
  {
    key: "risk-reversal",
    title: "Risk Reversal",
    channels: ["Security microsite", "Compliance one-pagers", "Procurement toolkit", "Field events"],
    positioning: (f) =>
      `Treat governance as the headline, not the appendix: publish how ${f.product} handles data, access and auditability before ${f.audience} have to ask.`,
    rationale: (f) =>
      `Enterprise deals stall in review, not in the demo. Making the compliance story public shortens the stage of the funnel that ${f.client} currently has least visibility into, and it is the one place ${f.leadCompetitor} is slowest to answer.`,
    firstMove: () =>
      `Publish a plain-language data handling page and a downloadable procurement pack, then link both from every paid landing page.`,
  },
  {
    key: "ecosystem-adjacency",
    title: "Ecosystem Adjacency",
    channels: ["Integration marketplace", "Co-marketing", "Developer docs", "Partner newsletters"],
    positioning: (f) =>
      `Meet ${f.audience} inside the systems they already run by making ${f.product} the connective layer rather than another destination to log into.`,
    rationale: (f) =>
      `Every integration is a distribution channel with an existing audience. It also reframes the buying decision from replacement to augmentation, which removes the single largest objection ${f.client} faces in an incumbent-heavy account.`,
    firstMove: () =>
      `Rank the ten most requested integrations by pipeline value and launch the top three with joint partner announcements.`,
  },
  {
    key: "operator-economics",
    title: "Operator Economics",
    channels: ["ROI calculator", "CFO briefing series", "Analyst report syndication", "Account-based ads"],
    positioning: (f) =>
      `Sell ${f.product} as a line on the operating budget: a defensible cost-per-process figure that ${f.audience} can defend to finance without translation.`,
    rationale: (f) =>
      `${f.topObjective} depends on reaching buyers who model spend before they model features. A calculator that produces a number the buyer can paste into their own business case does more selling than a brochure.`,
    firstMove: () =>
      `Build a public ROI calculator seeded with real deployment data and gate only the emailed PDF version of the result.`,
  },
];
