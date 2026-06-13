"use client";

import { useState } from "react";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Rocket,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "./FileUpload";
import {
  GOAL_OPTIONS,
  MOTIVATION_OPTIONS,
  emptyPersona,
  nextPersonaId,
} from "@/lib/personas/defaults";
import type { Persona } from "@/lib/personas/types";
import type { UploadedDocument } from "@/lib/uploads/types";

interface PersonaDialogProps {
  isOpen: boolean;
  /** `null` opens the dialog in create mode. */
  persona: Persona | null;
  onClose: () => void;
  onSave: (persona: Persona) => void;
  onDelete: (personaId: string) => void;
}

const TEXT_FIELDS = [
  {
    field: "demographic",
    label: "Demographic",
    placeholder:
      "Age: 34, Gender: Female, Marital status: Single, Occupation: Marketing Manager",
  },
  {
    field: "lifestyles",
    label: "Lifestyles",
    placeholder:
      "Enjoys attending networking events, often socializes with colleagues after work...",
  },
  {
    field: "behavioral",
    label: "Behavioral",
    placeholder:
      "Frequently engages with digital marketing platforms, experiments with new campaign tools...",
  },
  {
    field: "psychographic",
    label: "Psychographic & Attitudinal",
    placeholder:
      "Believes in the power of creativity and collaboration, values professional connections...",
  },
  {
    field: "personaPrompt",
    label: "Persona Prompt",
    placeholder:
      "A 34-year-old extroverted woman living in the city, working as a marketing manager...",
  },
] as const satisfies readonly {
  field: keyof Persona;
  label: string;
  placeholder: string;
}[];

const KEY_INFO_FIELDS = [
  { field: "gender", label: "Gender", icon: User },
  { field: "age", label: "Age", icon: Calendar },
  { field: "location", label: "Location", icon: MapPin },
  { field: "relationshipStatus", label: "Relationship Status", icon: LinkIcon },
  { field: "title", label: "Title", icon: Briefcase },
  { field: "education", label: "Education", icon: BookOpen },
] as const satisfies readonly {
  field: keyof Persona;
  label: string;
  icon: typeof User;
}[];

function toggle(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

export default function PersonaDialog({
  isOpen,
  persona,
  onClose,
  onSave,
  onDelete,
}: PersonaDialogProps) {
  const isEditing = persona !== null;
  const [form, setForm] = useState<Persona>(() => persona ?? emptyPersona());
  const [openedFor, setOpenedFor] = useState<string | null>(null);

  // Reset the draft whenever a different persona is opened. Keyed on the id,
  // not the name, so two personas that share a name stay distinct. React's
  // documented pattern for adjusting state on a prop change is to do it during
  // render, which re-renders this component only, rather than in an effect.
  const openKey = isOpen ? (persona?.id ?? "new") : null;
  if (openKey !== null && openKey !== openedFor) {
    setOpenedFor(openKey);
    setForm(persona ? { ...persona } : emptyPersona(nextPersonaId()));
  }

  const setField = (field: keyof Persona, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canSave = form.name.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[96vw] max-w-[1200px]! overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? `Edit ${persona.name || "Persona"}` : "Create New Audience"}
          </DialogTitle>
          <DialogDescription>
            Personas feed the brief and shape the generated strategies. A name
            is required — everything else is optional.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            {TEXT_FIELDS.map(({ field, label, placeholder }) => (
              <div key={field}>
                <label
                  htmlFor={`persona-${field}`}
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  {label}
                </label>
                <Textarea
                  id={`persona-${field}`}
                  value={String(form[field] ?? "")}
                  onChange={(event) => setField(field, event.target.value)}
                  placeholder={placeholder}
                  className="min-h-[80px]"
                />
              </div>
            ))}

            <FileUpload
              title="Supporting documents"
              description="Interview notes, audience research or references for this persona."
              documents={form.documents}
              onDocumentsChange={(documents: UploadedDocument[]) =>
                setForm((prev) => ({ ...prev, documents }))
              }
            />

            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onDelete(persona.id);
                  onClose();
                }}
                className="cursor-pointer border-red-300 text-red-600"
              >
                Remove persona
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <Input
                aria-label="Persona name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Persona Name"
                className="border-none text-center text-xl font-semibold shadow-none"
              />
              <Textarea
                aria-label="Persona quote"
                value={form.quote}
                onChange={(event) => setField("quote", event.target.value)}
                placeholder="I thrive on connecting with people and staying ahead of new ideas."
                className="resize-none border-none text-center text-gray-600 italic shadow-none"
                rows={2}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Key Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {KEY_INFO_FIELDS.map(({ field, label, icon: Icon }) => (
                  <div key={field} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                    <Input
                      aria-label={label}
                      value={String(form[field] ?? "")}
                      onChange={(event) => setField(field, event.target.value)}
                      placeholder={label}
                      className="border-none p-0 shadow-none"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div>
              <label
                htmlFor="persona-description"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Description
              </label>
              <Textarea
                id="persona-description"
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                placeholder="Detailed description of the persona..."
                className="min-h-[120px]"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4" />
                  Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {GOAL_OPTIONS.map((goal) => (
                  <div key={goal} className="flex items-center gap-2">
                    <Checkbox
                      id={`goal-${form.id}-${goal}`}
                      checked={form.goals.includes(goal)}
                      onCheckedChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          goals: toggle(prev.goals, goal),
                        }))
                      }
                    />
                    <label
                      htmlFor={`goal-${form.id}-${goal}`}
                      className="cursor-pointer text-sm text-gray-700"
                    >
                      {goal}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Rocket className="h-4 w-4" />
                  Motivations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOTIVATION_OPTIONS.map((motivation) => (
                  <div key={motivation} className="flex items-center gap-2">
                    <Checkbox
                      id={`motivation-${form.id}-${motivation}`}
                      checked={form.motivations.includes(motivation)}
                      onCheckedChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          motivations: toggle(prev.motivations, motivation),
                        }))
                      }
                    />
                    <label
                      htmlFor={`motivation-${form.id}-${motivation}`}
                      className="cursor-pointer text-sm text-gray-700"
                    >
                      {motivation}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button
              type="button"
              onClick={() => {
                onSave(form);
                onClose();
              }}
              disabled={!canSave}
              variant="brand"
              className="w-full cursor-pointer"
            >
              {isEditing ? "Save changes" : "Create persona"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
