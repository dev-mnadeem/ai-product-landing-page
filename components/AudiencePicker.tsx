"use client";

import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SectionCard from "./blocks/SectionCard";
import type { Persona } from "@/lib/personas/types";

interface AudiencePickerProps {
  personas: readonly Persona[];
  selectedIds: readonly string[];
  onToggle: (personaId: string) => void;
  /** `null` means "create a new persona". */
  onEdit: (persona: Persona | null) => void;
}

/**
 * A plain list of checkboxes rather than a menu: a Radix menu moves focus with
 * the arrow keys only and closes on Tab, so the checkboxes and edit buttons
 * that used to live inside it could not be reached from the keyboard.
 */
export default function AudiencePicker({
  personas,
  selectedIds,
  onToggle,
  onEdit,
}: AudiencePickerProps) {
  const selectedCount = personas.filter((persona) =>
    selectedIds.includes(persona.id)
  ).length;

  return (
    <SectionCard title="Target Audience">
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm text-muted-foreground">
          {selectedCount === 0
            ? "No audience selected yet. Tick the personas this campaign speaks to."
            : `${selectedCount} of ${personas.length} personas selected`}
        </legend>

        {personas.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            There are no personas. Create one to define who the campaign is
            for.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {personas.map((persona) => {
              const checkboxId = `audience-${persona.id}`;
              return (
                <li
                  key={persona.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedIds.includes(persona.id)}
                      onCheckedChange={() => onToggle(persona.id)}
                    />
                    <label htmlFor={checkboxId} className="min-w-0 cursor-pointer">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {persona.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {persona.title || persona.category}
                      </span>
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${persona.name}`}
                    onClick={() => onEdit(persona)}
                    className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <Button
          type="button"
          variant="brandOutline"
          size="sm"
          onClick={() => onEdit(null)}
          className="cursor-pointer gap-2"
        >
          <Plus className="h-4 w-4" />
          Create new audience
        </Button>
      </fieldset>
    </SectionCard>
  );
}
