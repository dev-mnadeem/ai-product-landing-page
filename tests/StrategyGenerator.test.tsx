import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import StrategyGenerator from "@/components/StrategyGenerator";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { LocalStrategyProvider } from "@/lib/strategy/local-provider";

const provider = new LocalStrategyProvider();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("<StrategyGenerator />", () => {
  it("renders the generated strategies on mount", async () => {
    const result = await provider.generate({ brief: SAMPLE_BRIEF, count: 3 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(result)));

    render(
      <StrategyGenerator
        brief={SAMPLE_BRIEF}
        selectedStrategyId={null}
        onSelect={() => {}}
      />
    );

    expect(
      await screen.findByText(result.strategies[0].title)
    ).toBeInTheDocument();
    expect(screen.getByText(result.strategies[0].positioning)).toBeInTheDocument();
    expect(screen.getByText(/local provider/)).toBeInTheDocument();
  });

  it("reports a refusal in the language of a refusal, not a crash", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          { error: "The model declined to answer this brief.", kind: "refused" },
          422
        )
      )
    );

    render(
      <StrategyGenerator
        brief={SAMPLE_BRIEF}
        selectedStrategyId={null}
        onSelect={() => {}}
      />
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("The model declined this brief");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("offers a retry after a network failure", async () => {
    const result = await provider.generate({ brief: SAMPLE_BRIEF, count: 3 });
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(jsonResponse(result));
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(
      <StrategyGenerator
        brief={SAMPLE_BRIEF}
        selectedStrategyId={null}
        onSelect={() => {}}
      />
    );

    await user.click(await screen.findByRole("button", { name: "Try again" }));
    await waitFor(() =>
      expect(screen.getByText(result.strategies[0].title)).toBeInTheDocument()
    );
  });

  it("hands the chosen strategy back to its parent", async () => {
    const result = await provider.generate({ brief: SAMPLE_BRIEF, count: 3 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(result)));
    const onSelect = vi.fn();

    const user = userEvent.setup();
    render(
      <StrategyGenerator
        brief={SAMPLE_BRIEF}
        selectedStrategyId={null}
        onSelect={onSelect}
      />
    );

    const buttons = await screen.findAllByRole("button", {
      name: "Select this strategy",
    });
    await user.click(buttons[0]);
    expect(onSelect).toHaveBeenCalledWith(result.strategies[0]);
  });

  it("marks the currently selected strategy", async () => {
    const result = await provider.generate({ brief: SAMPLE_BRIEF, count: 3 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(result)));

    render(
      <StrategyGenerator
        brief={SAMPLE_BRIEF}
        selectedStrategyId={result.strategies[1].id}
        onSelect={() => {}}
      />
    );

    expect(await screen.findByText("Selected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Keep this strategy" })
    ).toBeInTheDocument();
  });
});
