import { afterEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { loadConfig } from "@/lib/config";
import { OpenAiStrategyProvider } from "@/lib/strategy/openai-provider";
import { LocalStrategyProvider } from "@/lib/strategy/local-provider";
import { getStrategyProvider } from "@/lib/strategy/registry";
import { StrategyError } from "@/lib/strategy/types";

const config = loadConfig({
  STRATEGY_PROVIDER: "openai",
  STRATEGY_API_KEY: "test-key",
  STRATEGY_TIMEOUT_MS: "50",
});

function reply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function completion(content: string) {
  return { choices: [{ finish_reason: "stop", message: { content } }] };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OpenAiStrategyProvider", () => {
  it("parses a well-formed JSON completion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        reply(
          completion(
            JSON.stringify({
              strategies: [
                {
                  title: "Proof Led Launch",
                  positioning: "p",
                  rationale: "r",
                  channels: ["Email", 7],
                  firstMove: "f",
                },
              ],
            })
          )
        )
      )
    );

    const result = await new OpenAiStrategyProvider(config).generate({
      brief: SAMPLE_BRIEF,
    });
    expect(result.provider).toBe("openai");
    expect(result.strategies[0].id).toBe("proof-led-launch");
    // Non-string channel entries are dropped rather than rendered as "7".
    expect(result.strategies[0].channels).toEqual(["Email"]);
  });

  it("never puts the API key anywhere but the Authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      reply(completion(JSON.stringify({ strategies: [] })))
    );
    vi.stubGlobal("fetch", fetchMock);
    await new OpenAiStrategyProvider(config)
      .generate({ brief: SAMPLE_BRIEF })
      .catch(() => undefined);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain("test-key");
    expect(String(init.body)).not.toContain("test-key");
    expect(init.headers.authorization).toBe("Bearer test-key");
  });

  it("surfaces a refusal as its own failure kind", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        reply({
          choices: [
            { finish_reason: "stop", message: { refusal: "I cannot help." } },
          ],
        })
      )
    );
    await expect(
      new OpenAiStrategyProvider(config).generate({ brief: SAMPLE_BRIEF })
    ).rejects.toMatchObject({ kind: "refused" });
  });

  it("treats a content filter stop as a refusal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        reply({ choices: [{ finish_reason: "content_filter", message: {} }] })
      )
    );
    await expect(
      new OpenAiStrategyProvider(config).generate({ brief: SAMPLE_BRIEF })
    ).rejects.toMatchObject({ kind: "refused" });
  });

  it("reports an upstream HTTP failure without throwing a raw fetch error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply({ error: "nope" }, 500)));
    const error = await new OpenAiStrategyProvider(config)
      .generate({ brief: SAMPLE_BRIEF })
      .catch((cause) => cause);
    expect(error).toBeInstanceOf(StrategyError);
    expect(error.kind).toBe("upstream_error");
  });

  it("reports unparseable output rather than crashing on JSON.parse", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(reply(completion("not json at all")))
    );
    await expect(
      new OpenAiStrategyProvider(config).generate({ brief: SAMPLE_BRIEF })
    ).rejects.toMatchObject({ kind: "unparseable" });
  });

  it("rejects a valid-JSON response that contains no usable strategies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        reply(completion(JSON.stringify({ strategies: [{ title: "only a title" }] })))
      )
    );
    await expect(
      new OpenAiStrategyProvider(config).generate({ brief: SAMPLE_BRIEF })
    ).rejects.toMatchObject({ kind: "unparseable" });
  });

  it("aborts and reports a timeout when the endpoint never answers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => {
              const error = new Error("aborted");
              error.name = "AbortError";
              reject(error);
            });
          })
      )
    );
    const error = await new OpenAiStrategyProvider(config)
      .generate({ brief: SAMPLE_BRIEF })
      .catch((cause) => cause);
    expect(error.kind).toBe("timeout");
    expect(error.message).toContain("50ms");
  });
});

describe("configuration and the provider registry", () => {
  it("defaults to the local provider with an empty environment", () => {
    const resolved = loadConfig({});
    expect(resolved.providerName).toBe("local");
    expect(getStrategyProvider(resolved)).toBeInstanceOf(LocalStrategyProvider);
  });

  it("falls back to local when openai is asked for without a key", () => {
    const resolved = loadConfig({ STRATEGY_PROVIDER: "openai" });
    expect(resolved.providerName).toBe("local");
  });

  it("selects the hosted provider only when a key is present", () => {
    expect(config.providerName).toBe("openai");
    expect(getStrategyProvider(config)).toBeInstanceOf(OpenAiStrategyProvider);
  });

  it("strips a trailing slash from the base URL and ignores a nonsense timeout", () => {
    const resolved = loadConfig({
      STRATEGY_BASE_URL: "https://example.test/v1///",
      STRATEGY_TIMEOUT_MS: "not-a-number",
    });
    expect(resolved.baseUrl).toBe("https://example.test/v1");
    expect(resolved.requestTimeoutMs).toBe(20_000);
  });
});
