import type {
  CampaignBrief,
  CampaignLearning,
  Competitor,
  Kpi,
  Objective,
} from "./types";

export const MAX_TEXT_FIELD_LENGTH = 4_000;

/**
 * Anything arriving at `POST /api/strategies` is untrusted: it decides what
 * goes into a model prompt and how long that prompt is. This narrows an
 * unknown body to a `CampaignBrief` or explains exactly why it cannot.
 */
export type BriefValidation =
  | { readonly ok: true; readonly brief: CampaignBrief }
  | { readonly ok: false; readonly errors: readonly string[] };

function text(
  source: Record<string, unknown>,
  key: string,
  errors: string[],
  required: boolean
): string {
  const value = source[key];
  if (typeof value !== "string") {
    if (required) errors.push(`${key} must be a string`);
    return "";
  }
  if (value.length > MAX_TEXT_FIELD_LENGTH) {
    errors.push(`${key} exceeds ${MAX_TEXT_FIELD_LENGTH} characters`);
    return value.slice(0, MAX_TEXT_FIELD_LENGTH);
  }
  if (required && value.trim() === "") {
    errors.push(`${key} must not be empty`);
  }
  return value;
}

function pairs<T>(
  source: Record<string, unknown>,
  key: string,
  keys: readonly string[],
  errors: string[]
): T[] {
  const value = source[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push(`${key} must be an array`);
    return [];
  }
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const field of keys) {
      if (typeof record[field] !== "string") return [];
      out[field] = (record[field] as string).slice(0, MAX_TEXT_FIELD_LENGTH);
    }
    return [out as unknown as T];
  });
}

function metricGroups(
  source: Record<string, unknown>,
  errors: string[]
): { title: string; metrics: string[] }[] {
  const value = source.successMetrics;
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push("successMetrics must be an array");
    return [];
  }
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.title !== "string" || !Array.isArray(record.metrics)) {
      return [];
    }
    return [
      {
        title: record.title.slice(0, MAX_TEXT_FIELD_LENGTH),
        metrics: record.metrics.filter(
          (metric): metric is string => typeof metric === "string"
        ),
      },
    ];
  });
}

export function validateBrief(input: unknown): BriefValidation {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, errors: ["brief must be an object"] };
  }

  const source = input as Record<string, unknown>;
  const errors: string[] = [];

  const brief: CampaignBrief = {
    projectName: text(source, "projectName", errors, false),
    client: text(source, "client", errors, true),
    clientDetails: text(source, "clientDetails", errors, false),
    product: text(source, "product", errors, true),
    productDetails: text(source, "productDetails", errors, false),
    audience: text(source, "audience", errors, true),
    mandatoryRequirements: text(source, "mandatoryRequirements", errors, false),
    marketBackground: text(source, "marketBackground", errors, false),
    competitors: pairs<Competitor>(source, "competitors", ["name", "note"], errors),
    previousCampaigns: pairs<CampaignLearning>(
      source,
      "previousCampaigns",
      ["label", "detail"],
      errors
    ),
    objectives: pairs<Objective>(source, "objectives", ["title", "detail"], errors),
    successMetrics: metricGroups(source, errors),
    kpis: pairs<Kpi>(source, "kpis", ["label", "value"], errors),
  };

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, brief };
}
