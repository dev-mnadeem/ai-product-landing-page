"use client";

import { ChevronDown, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Persona } from "@/lib/personas/types";

interface TargetAudienceDropdownProps {
  personas: readonly Persona[];
  selectedIds: readonly string[];
  onToggle: (personaId: string) => void;
  /** `null` means "create a new persona". */
  onEdit: (persona: Persona | null) => void;
}

export default function TargetAudienceDropdown({
  personas,
  selectedIds,
  onToggle,
  onEdit,
}: TargetAudienceDropdownProps) {
  const selected = personas.filter((persona) =>
    selectedIds.includes(persona.id)
  );

  return (
    <Card className="border border-gray-200 bg-gray-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Target Audience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full cursor-pointer justify-between gap-2 border-gray-300 text-gray-700"
            >
              {selected.length > 0
                ? `${selected.length} audience${
                    selected.length > 1 ? "s" : ""
                  } selected`
                : "Select Target Audience"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)]"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuItem
              onClick={() => onEdit(null)}
              className="flex items-center gap-2 font-medium"
            >
              <Plus className="h-4 w-4" />
              Create New Audience
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {personas.map((persona) => (
              <div
                key={persona.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Checkbox
                    id={`audience-${persona.id}`}
                    checked={selectedIds.includes(persona.id)}
                    onCheckedChange={() => onToggle(persona.id)}
                  />
                  <label
                    htmlFor={`audience-${persona.id}`}
                    className="min-w-0 cursor-pointer"
                  >
                    <span className="block truncate text-sm font-medium text-gray-900">
                      {persona.name}
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {persona.title || persona.category}
                    </span>
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Edit ${persona.name}`}
                  onClick={() => onEdit(persona)}
                  className="h-6 w-6 shrink-0 cursor-pointer p-0 text-gray-400 hover:text-gray-600"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((persona) => (
              <span
                key={persona.id}
                className="flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-sm text-brand"
              >
                {persona.name}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${persona.name}`}
                  onClick={() => onToggle(persona.id)}
                  className="h-4 w-4 cursor-pointer p-0 text-brand hover:text-brand-hover"
                >
                  ×
                </Button>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
