/**
 * The campaign brief is the input to strategy generation. It is deliberately a
 * plain serialisable object: it crosses the network to `POST /api/strategies`
 * and is validated there before any provider sees it.
 */
export interface CampaignBrief {
  /** Working name shown in the app header. */
  readonly projectName: string;
  readonly client: string;
  readonly clientDetails: string;
  readonly product: string;
  readonly productDetails: string;
  /** Who the campaign is talking to, in the planner's own words. */
  readonly audience: string;
  readonly mandatoryRequirements: string;
  readonly marketBackground: string;
  readonly competitors: readonly Competitor[];
  readonly previousCampaigns: readonly CampaignLearning[];
  readonly objectives: readonly Objective[];
  readonly successMetrics: readonly MetricGroup[];
  readonly kpis: readonly Kpi[];
}

export interface Competitor {
  readonly name: string;
  readonly note: string;
}

export interface CampaignLearning {
  readonly label: string;
  readonly detail: string;
}

export interface Objective {
  readonly title: string;
  readonly detail: string;
}

export interface MetricGroup {
  readonly title: string;
  readonly metrics: readonly string[];
}

export interface Kpi {
  readonly label: string;
  readonly value: string;
}
