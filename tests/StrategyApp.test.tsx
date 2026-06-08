import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StrategyApp from "@/components/StrategyApp";

const replace = vi.fn();
let search = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/",
  useSearchParams: () => search,
}));

beforeEach(() => {
  // jsdom does not implement scrolling.
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  replace.mockReset();
  search = new URLSearchParams();
});

describe("<StrategyApp />", () => {
  it("opens on the first section when the query string is missing or stale", () => {
    search = new URLSearchParams("section=not-a-section");
    render(<StrategyApp />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Campaign Basics" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
  });

  it("moves forward by rewriting the section parameter", async () => {
    const user = userEvent.setup();
    render(<StrategyApp />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(replace).toHaveBeenCalledWith("/?section=market-intelligence", {
      scroll: false,
    });
  });

  it("toggles the workflow panel from the compact step bar", async () => {
    const user = userEvent.setup();
    render(<StrategyApp />);
    const toggle = screen.getByRole("button", { name: /Step 1 of 4/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Strategic Objectives" }));
    expect(replace).toHaveBeenCalledWith("/?section=strategic-objectives", {
      scroll: false,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("can dismiss the planner's note", async () => {
    const user = userEvent.setup();
    render(<StrategyApp />);
    await user.click(screen.getByRole("button", { name: "Dismiss tip" }));
    expect(
      screen.queryByRole("complementary", { name: "Planner's note" })
    ).not.toBeInTheDocument();
  });
});
