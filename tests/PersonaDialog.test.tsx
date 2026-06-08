import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PersonaDialog from "@/components/PersonaDialog";
import { SEED_PERSONAS } from "@/lib/personas/defaults";
import type { Persona } from "@/lib/personas/types";

function Harness({
  persona,
  onSave = () => {},
}: {
  persona: Persona | null;
  onSave?: (persona: Persona) => void;
}) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        open
      </button>
      <PersonaDialog
        isOpen={isOpen}
        persona={persona}
        onClose={() => setOpen(false)}
        onSave={onSave}
        onDelete={() => {}}
      />
    </>
  );
}

describe("<PersonaDialog />", () => {
  it("discards unsaved edits when the same persona is reopened", async () => {
    const user = userEvent.setup();
    render(<Harness persona={SEED_PERSONAS[0]} />);

    await user.click(screen.getByRole("button", { name: "open" }));
    const name = screen.getByRole("textbox", { name: "Persona name" });
    await user.clear(name);
    await user.type(name, "Abandoned draft");
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByRole("textbox", { name: "Persona name" })).toHaveValue(
      SEED_PERSONAS[0].name
    );
  });

  it("gives every new persona its own id and an empty form", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<Harness persona={null} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "open" }));
    await user.type(screen.getByRole("textbox", { name: "Persona name" }), "First");
    await user.click(screen.getByRole("button", { name: "Create persona" }));

    await user.click(screen.getByRole("button", { name: "open" }));
    const name = screen.getByRole("textbox", { name: "Persona name" });
    expect(name).toHaveValue("");
    await user.type(name, "Second");
    await user.click(screen.getByRole("button", { name: "Create persona" }));

    const [first, second] = onSave.mock.calls.map(([persona]) => persona);
    expect(first.name).toBe("First");
    expect(second.name).toBe("Second");
    expect(second.id).not.toBe(first.id);
  });

  it("will not save a persona without a name", async () => {
    const user = userEvent.setup();
    render(<Harness persona={null} />);
    await user.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByRole("button", { name: "Create persona" })).toBeDisabled();
  });
});
