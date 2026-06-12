import type { AppConfig } from "@/lib/config";
import {
  StrategyError,
  clampCount,
  type StrategyProvider,
  type StrategyRecommendation,
  type StrategyRequest,
  type StrategyResult,
} from "./types";

interface ChatCompletionResponse {
  choices?: Array<{
    finish_reason?: string;
    message?: { content?: string | null; refusal?: string | null };
  }>;
}

const SYSTEM_PROMPT = [
  "You are a campaign strategist.",
  "Return JSON only, shaped as",
  '{"strategies":[{"title":string,"positioning":string,"rationale":string,"channels":string[],"firstMove":string}]}.',
  "Ground every field in the supplied brief. Do not invent client names or metrics.",
].join(" ");

function isRecommendation(value: unknown): value is Omit<StrategyRecommendation, "id"> {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.positioning === "string" &&
    typeof candidate.rationale === "string" &&
    typeof candidate.firstMove === "string" &&
    Array.isArray(candidate.channels)
  );
}

/** Slugify a model-supplied title into a stable React key. */
function idFor(title: string, index: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || `strategy-${index + 1}`;
}

/**
 * Talks to any OpenAI-compatible `/chat/completions` endpoint. Constructed
 * only inside the route handler, so the key stays server-side.
 */
export class OpenAiStrategyProvider implements StrategyProvider {
  readonly name = "openai";

  constructor(private readonly config: AppConfig) {}

  async generate(request: StrategyRequest): Promise<StrategyResult> {
    const count = clampCount(request.count);
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      this.config.requestTimeoutMs
    );

    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.config.apiKey ?? ""}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Produce ${count} strategies for this brief:\n${JSON.stringify(
                request.brief
              )}`,
            },
          ],
        }),
      });
    } catch (cause) {
      const aborted = cause instanceof Error && cause.name === "AbortError";
      throw new StrategyError(
        aborted ? "timeout" : "upstream_error",
        aborted
          ? `The model did not answer within ${this.config.requestTimeoutMs}ms.`
          : "The model endpoint could not be reached.",
        cause instanceof Error ? cause.message : undefined
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw new StrategyError(
        "upstream_error",
        `The model endpoint returned ${response.status}.`,
        await response.text().catch(() => undefined)
      );
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const choice = payload.choices?.[0];

    // A refusal is a successful HTTP call with no usable content. Surface it as
    // its own failure kind so the UI can say "the model declined" rather than
    // "something went wrong".
    if (choice?.message?.refusal || choice?.finish_reason === "content_filter") {
      throw new StrategyError(
        "refused",
        "The model declined to answer this brief.",
        choice.message?.refusal ?? undefined
      );
    }

    const content = choice?.message?.content?.trim();
    if (!content) {
      throw new StrategyError(
        "refused",
        "The model returned an empty response."
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new StrategyError(
        "unparseable",
        "The model response was not valid JSON."
      );
    }

    const raw = (parsed as { strategies?: unknown })?.strategies;
    const items = Array.isArray(raw) ? raw.filter(isRecommendation) : [];
    if (items.length === 0) {
      throw new StrategyError(
        "unparseable",
        "The model response contained no usable strategies."
      );
    }

    return {
      provider: this.name,
      strategies: items.slice(0, count).map((item, index) => ({
        id: idFor(item.title, index),
        title: item.title,
        positioning: item.positioning,
        rationale: item.rationale,
        channels: item.channels.filter(
          (channel): channel is string => typeof channel === "string"
        ),
        firstMove: item.firstMove,
      })),
    };
  }
}
