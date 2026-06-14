"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, Lightbulb, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContentRenderer from "./ContentRenderer";
import FileUpload from "./FileUpload";
import PersonaDialog from "./PersonaDialog";
import SectionNavigation from "./SectionNavigation";
import StrategyGenerator from "./StrategyGenerator";
import TargetAudienceDropdown from "./TargetAudienceDropdown";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { buildSectionContent } from "@/lib/content/sections";
import { buildCampaignExport, exportFileName } from "@/lib/export";
import { SEED_PERSONAS } from "@/lib/personas/defaults";
import type { Persona } from "@/lib/personas/types";
import type { StrategyRecommendation } from "@/lib/strategy/types";
import type { UploadedDocument } from "@/lib/uploads/types";
import {
  getSection,
  isFirstSection,
  isLastSection,
  nextSection,
  previousSection,
  toSectionId,
} from "@/lib/workflow/navigation";
import type { SectionId } from "@/lib/workflow/steps";

const SECTION_PARAM = "section";

export default function StrategyApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The wizard position lives in the URL, so a section is linkable and a
  // reload does not drop the reviewer back on step one.
  const activeSection = toSectionId(searchParams.get(SECTION_PARAM));

  const [completedSections, setCompletedSections] = useState<SectionId[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([...SEED_PERSONAS]);
  const [selectedAudienceIds, setSelectedAudienceIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<UploadedDocument[]>([]);
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyRecommendation | null>(null);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isPersonaDialogOpen, setPersonaDialogOpen] = useState(false);
  const [showSmartTip, setShowSmartTip] = useState(true);

  const goToSection = useCallback(
    (section: SectionId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(SECTION_PARAM, section);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleNext = () => {
    setCompletedSections((prev) =>
      prev.includes(activeSection) ? prev : [...prev, activeSection]
    );
    // On the final section there is nowhere to go, but the section still has
    // to be markable or the workflow can never reach 100%.
    if (!isLastSection(activeSection)) {
      goToSection(nextSection(activeSection));
    }
  };

  const savePersona = (persona: Persona) => {
    setPersonas((prev) => {
      const index = prev.findIndex((entry) => entry.id === persona.id);
      if (index === -1) return [...prev, persona];
      const next = [...prev];
      next[index] = persona;
      return next;
    });
    // A newly created persona is selected immediately — creating one and then
    // having to tick it again reads as the save having failed.
    setSelectedAudienceIds((prev) =>
      prev.includes(persona.id) ? prev : [...prev, persona.id]
    );
  };

  const deletePersona = (personaId: string) => {
    setPersonas((prev) => prev.filter((entry) => entry.id !== personaId));
    setSelectedAudienceIds((prev) => prev.filter((id) => id !== personaId));
  };

  const handleExport = () => {
    const payload = buildCampaignExport({
      brief: SAMPLE_BRIEF,
      personas,
      selectedAudienceIds,
      selectedStrategy,
      attachments,
      completedSections,
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportFileName(SAMPLE_BRIEF.projectName);
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const sectionContent = useMemo(
    () => buildSectionContent(SAMPLE_BRIEF),
    []
  );
  const section = getSection(activeSection);

  const interactive = {
    "file-upload": (
      <FileUpload documents={attachments} onDocumentsChange={setAttachments} />
    ),
    "audience-picker": (
      <TargetAudienceDropdown
        personas={personas}
        selectedIds={selectedAudienceIds}
        onToggle={(id) =>
          setSelectedAudienceIds((prev) =>
            prev.includes(id)
              ? prev.filter((entry) => entry !== id)
              : [...prev, id]
          )
        }
        onEdit={(persona) => {
          setEditingPersona(persona);
          setPersonaDialogOpen(true);
        }}
      />
    ),
    "strategy-generator": (
      <StrategyGenerator
        brief={SAMPLE_BRIEF}
        selectedStrategyId={selectedStrategy?.id ?? null}
        onSelect={setSelectedStrategy}
      />
    ),
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <h1 className="truncate text-2xl font-bold text-gray-800">
              {SAMPLE_BRIEF.projectName}
            </h1>
            <Badge className="shrink-0 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-500">
              In Progress
            </Badge>
          </div>
          <Button
            size="sm"
            variant="brand"
            onClick={handleExport}
            className="shrink-0 cursor-pointer gap-2"
          >
            <Download className="h-4 w-4" />
            Export campaign
          </Button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        <aside className="w-80 shrink-0 border-r border-gray-200 bg-white p-6">
          <SectionNavigation
            activeSection={activeSection}
            completedSections={completedSections}
            brief={SAMPLE_BRIEF}
            selectedStrategy={selectedStrategy}
            onSectionChange={goToSection}
          />

          {showSmartTip && (
            <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Smart Tip
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      Clear objectives make strategy generation more focused and
                      effective.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Dismiss tip"
                  onClick={() => setShowSmartTip(false)}
                  className="h-6 w-6 shrink-0 cursor-pointer p-0 text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {section.label}
              </h2>
              <p className="mt-2 text-base text-gray-600">
                {section.description}
              </p>
            </div>

            <ContentRenderer
              blocks={sectionContent[activeSection]}
              interactive={interactive}
            />

            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
              <Button
                variant="brandOutline"
                className="cursor-pointer"
                disabled={isFirstSection(activeSection)}
                onClick={() => goToSection(previousSection(activeSection))}
              >
                Back
              </Button>
              <Button
                variant="brand"
                className="cursor-pointer"
                disabled={
                  isLastSection(activeSection) &&
                  completedSections.includes(activeSection)
                }
                onClick={handleNext}
              >
                {isLastSection(activeSection) ? "Mark complete" : "Next"}
              </Button>
            </div>
          </div>
        </main>
      </div>

      <PersonaDialog
        isOpen={isPersonaDialogOpen}
        persona={editingPersona}
        onClose={() => {
          setPersonaDialogOpen(false);
          setEditingPersona(null);
        }}
        onSave={savePersona}
        onDelete={deletePersona}
      />
    </div>
  );
}
