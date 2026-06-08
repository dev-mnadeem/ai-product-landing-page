import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/strategies/route";
import { GET } from "@/app/api/health/route";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { TOTAL_SECTIONS } from "@/lib/workflow/navigation";

function post(body: unknown): Request {
  return new Request("http://localhost/api/strategies", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/strategies", () => {
  it("returns generated strategies for a valid brief", async () => {
    const response = await POST(post({ brief: SAMPLE_BRIEF, count: 3 }));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.provider).toBe("local");
    expect(payload.strategies).toHaveLength(3);
    expect(payload.strategies[0].title).toBeTypeOf("string");
  });

  it("clamps an out-of-range count instead of trusting the client", async () => {
    const response = await POST(post({ brief: SAMPLE_BRIEF, count: 500 }));
    const payload = await response.json();
    expect(payload.strategies.length).toBeLessThanOrEqual(5);
  });

  it("answers 400 for a body that is not JSON", async () => {
    const response = await POST(post("{not json"));
    expect(response.status).toBe(400);
  });

  it("answers 400 with field-level detail for an incomplete brief", async () => {
    const response = await POST(post({ brief: { client: "Only a client" } }));
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.details.length).toBeGreaterThan(0);
  });

  it("answers 400 when the brief key is missing entirely", async () => {
    const response = await POST(post({ count: 3 }));
    expect(response.status).toBe(400);
  });

  it("marks the deterministic provider's answer as cacheable", async () => {
    const response = await POST(post({ brief: SAMPLE_BRIEF }));
    expect(response.headers.get("cache-control")).toContain("max-age");
  });
});

describe("GET /api/health", () => {
  it("reports the resolved provider and section count without leaking a key", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      status: "ok",
      strategyProvider: "local",
      sections: TOTAL_SECTIONS,
    });
  });
});
