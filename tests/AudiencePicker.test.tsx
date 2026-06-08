import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AudiencePicker from "@/components/AudiencePicker";
import { SEED_PERSONAS } from "@/lib/personas/defaults";
import type { Persona } from "@/lib/personas/types";

function Harness({ onEdit = () => {} }: { onEdit?: (p: Persona | null) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <AudiencePicker
      personas={SEED_PERSONAS}
      selectedIds={selected}
      onToggle={(id) =>
        setSelected((prev) =>
          prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]
        )
      }
      onEdit={onEdit}
    />
  );
}

describe("<AudiencePicker />", () => {
  it("selects a persona from the keyboard alone", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.tab();
    expect(
      screen.getByRole("checkbox", { name: new RegExp(SEED_PERSONAS[0].name) })
    ).toHaveFocus();
    await user.keyboard(" ");

    expect(
      screen.getByRole("checkbox", { name: new RegExp(SEED_PERSONAS[0].name) })
    ).toBeChecked();
    expect(screen.getByText(`1 of ${SEED_PERSONAS.length} personas selected`)).toBeInTheDocument();
  });

  it("opens a persona for editing and offers a blank one for creation", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<Harness onEdit={onEdit} />);

    await user.click(screen.getByRole("button", { name: `Edit ${SEED_PERSONAS[2].name}` }));
    expect(onEdit).toHaveBeenLastCalledWith(SEED_PERSONAS[2]);

    await user.click(screen.getByRole("button", { name: "Create new audience" }));
    expect(onEdit).toHaveBeenLastCalledWith(null);
  });

  it("explains an empty persona list instead of rendering nothing", () => {
    render(
      <AudiencePicker personas={[]} selectedIds={[]} onToggle={() => {}} onEdit={() => {}} />
    );
    expect(screen.getByText(/There are no personas/)).toBeInTheDocument();
  });
});
