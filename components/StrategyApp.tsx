"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Download, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContentRenderer from "./ContentRenderer";
import FileUpload from "./FileUpload";
import PersonaDialog from "./PersonaDialog";
import SectionNavigation from "./SectionNavigation";
import StrategyGenerator from "./StrategyGenerator";
import AudiencePicker from "./AudiencePicker";
import { SAMPLE_BRIEF } from "@/lib/brief/sample";
import { buildSectionContent } from "@/lib/content/sections";
import { buildCampaignExport, exportFileName } from "@/lib/export";
import { SEED_PERSONAS } from "@/lib/personas/defaults";
import type { Persona } from "@/lib/personas/types";
import type { StrategyRecommendation } from "@/lib/strategy/types";
import type { UploadedDocument } from "@/lib/uploads/types";
import {
  SECTION_ORDER,
  TOTAL_SECTIONS,
  completionPercent,
  getSection,
  getStepForSection,
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
  const [isNavOpen, setNavOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastSection = useRef(activeSection);

  const goToSection = useCallback(
    (section: SectionId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(SECTION_PARAM, section);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setNavOpen(false);
    },
    [pathname, router, searchParams]
  );

  // After Back/Next the old content is gone from under the reader. Moving
  // focus to the new heading tells a screen reader where it landed and, on a
  // phone, brings the top of the section back into view.
  useEffect(() => {
    if (lastSection.current === activeSection) return;
    lastSection.current = activeSection;
    headingRef.current?.focus();
  }, [activeSection]);

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
    // Revoking in the same task can cancel the download in Firefox and Safari
    // before they have read the blob.
    setTimeout(() => URL.revokeObjectURL(url), 0);
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
      <AudiencePicker
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

  const step = getStepForSection(activeSection);
  const sectionNumber = SECTION_ORDER.indexOf(activeSection) + 1;
  const progress = completionPercent(completedSections);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#section-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to section content
      </a>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
              {SAMPLE_BRIEF.client}
              <span className="hidden sm:inline"> · campaign workspace</span>
            </p>
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate font-serif text-xl font-semibold text-foreground sm:text-2xl">
                {SAMPLE_BRIEF.projectName}
              </h1>
              <Badge
                variant="outline"
                className="hidden shrink-0 rounded-sm border-brand/50 font-mono text-[0.7rem] tracking-wider text-brand uppercase sm:inline-flex"
              >
                In progress
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            variant="brand"
            onClick={handleExport}
            className="shrink-0 cursor-pointer gap-2"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Export<span className="hidden sm:inline"> campaign</span>
          </Button>
        </div>

        <button
          type="button"
          aria-expanded={isNavOpen}
          aria-controls="workflow-panel"
          onClick={() => {
            // The panel opens at the top of the page, under the sticky header,
            // so a reader scrolled deep into a section would not see it appear.
            if (!isNavOpen) window.scrollTo({ top: 0 });
            setNavOpen(!isNavOpen);
          }}
          className="flex w-full cursor-pointer items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-left sm:px-6 lg:hidden"
        >
          <span className="min-w-0">
            <span className="block font-mono text-[0.7rem] tracking-wider text-muted-foreground uppercase">
              Step {step.id} of 4 · {step.title} · {progress}% done
            </span>
            <span className="block truncate text-sm font-semibold text-foreground">
              {section.label}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm text-brand">
            {isNavOpen ? "Close" : "All steps"}
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 transition-transform ${isNavOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      </header>

      <div className="lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div
          id="workflow-panel"
          className={`${
            isNavOpen ? "block" : "hidden"
          } border-b border-border px-4 py-6 sm:px-6 lg:sticky lg:top-[73px] lg:block lg:h-[calc(100vh-73px)] lg:overflow-y-auto lg:border-r lg:border-b-0 lg:py-8`}
        >
          <SectionNavigation
            activeSection={activeSection}
            completedSections={completedSections}
            brief={SAMPLE_BRIEF}
            selectedStrategy={selectedStrategy}
            onSectionChange={goToSection}
          />

          {showSmartTip && (
            <aside
              aria-label="Planner's note"
              className="mt-8 rounded-md border-l-4 border-brand bg-marker/60 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-[0.7rem] tracking-wider text-foreground uppercase">
                    Planner&apos;s note
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    Clear objectives make strategy generation more focused and
                    effective.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Dismiss tip"
                  onClick={() => setShowSmartTip(false)}
                  className="shrink-0 cursor-pointer text-foreground/70 hover:bg-transparent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </aside>
          )}
        </div>

        <main id="section-content" className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 border-b border-border pb-6">
              <p className="font-mono text-xs tracking-wider text-brand uppercase">
                Step {step.id} · {step.title} — section {sectionNumber} of{" "}
                {TOTAL_SECTIONS}
              </p>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="mt-2 font-serif text-3xl font-semibold text-foreground focus:outline-none sm:text-4xl"
              >
                {section.label}
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                {section.description}
              </p>
            </div>

            <ContentRenderer
              blocks={sectionContent[activeSection]}
              interactive={interactive}
            />

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-5">
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
