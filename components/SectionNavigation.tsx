"use client";

import { Check, FileText, Lightbulb, Rocket, Target } from "lucide-react";
import type { CampaignBrief } from "@/lib/brief/types";
import type { StrategyRecommendation } from "@/lib/strategy/types";
import { WORKFLOW_STEPS, type SectionId, type StepIconName, type WorkflowStep } from "@/lib/workflow/steps";
import {
  completionPercent,
  getStepNumber,
  isStepComplete,
} from "@/lib/workflow/navigation";

const STEP_ICONS: Record<StepIconName, typeof FileText> = {
  brief: FileText,
  strategy: Target,
  concept: Lightbulb,
  execution: Rocket,
};

interface SectionNavigationProps {
  activeSection: SectionId;
  completedSections: readonly SectionId[];
  brief: CampaignBrief;
  selectedStrategy: StrategyRecommendation | null;
  onSectionChange: (section: SectionId) => void;
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[0.7rem] tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="truncate text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

/**
 * Summary shown in place of a completed step's sub-items. Every value is read
 * from the live brief or the chosen strategy, so the sidebar can never
 * describe a different campaign than the one on screen.
 */
function StepPreview({
  step,
  brief,
  selectedStrategy,
}: {
  step: WorkflowStep;
  brief: CampaignBrief;
  selectedStrategy: StrategyRecommendation | null;
}) {
  switch (step.id) {
    case 1:
      return (
        <div className="space-y-2">
          <PreviewRow label="Client" value={brief.client} />
          <PreviewRow label="Audience" value={brief.audience} />
          <PreviewRow
            label="Lead objective"
            value={brief.objectives[0]?.title ?? "Not set"}
          />
        </div>
      );
    case 2:
      return selectedStrategy ? (
        <div className="space-y-1">
          <PreviewRow label="Selected strategy" value={selectedStrategy.title} />
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {selectedStrategy.positioning}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No strategy selected yet. Pick one in Strategy Selection.
        </p>
      );
    case 3:
      return (
        <p className="text-xs text-muted-foreground">
          {selectedStrategy
            ? `Concepts will be developed against "${selectedStrategy.title}".`
            : "Concepts follow once a strategy is chosen."}
        </p>
      );
    default:
      return (
        <p className="text-xs text-muted-foreground">
          Your selected concept, broken down into creative executions.
        </p>
      );
  }
}

export default function SectionNavigation({
  activeSection,
  completedSections,
  brief,
  selectedStrategy,
  onSectionChange,
}: SectionNavigationProps) {
  const currentStep = getStepNumber(activeSection);
  const progress = completionPercent(completedSections);

  return (
    <nav aria-label="Campaign workflow" className="relative pl-6">
      <div
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-2 w-0.5 bg-border"
      />
      <div
        className="absolute top-0 left-2 w-0.5 bg-brand transition-[height] duration-300"
        style={{ height: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Workflow completion"
      />

      <ol className="space-y-7">
        {WORKFLOW_STEPS.map((step) => {
          const isCurrent = step.id === currentStep;
          const isComplete = isStepComplete(step, completedSections);
          const Icon = STEP_ICONS[step.icon];

          return (
            <li key={step.id} aria-current={isCurrent ? "step" : undefined}>
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                    isComplete
                      ? "border-moss bg-moss text-moss-foreground"
                      : isCurrent
                        ? "border-foreground bg-foreground text-background"
                        : "border-input bg-card text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <Check aria-hidden="true" className="h-5 w-5" />
                  ) : (
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                    Step {step.id}
                    {isComplete && <span className="sr-only">, complete</span>}
                  </div>
                  <div className="font-serif text-xl leading-tight font-semibold text-foreground">
                    {step.title}
                  </div>
                </div>
              </div>

              {isCurrent ? (
                <>
                  <p className="mb-3 ml-13 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  <ul className="ml-13 space-y-1">
                    {step.sections.map((section) => {
                      const isActive = activeSection === section.id;
                      const done = completedSections.includes(section.id);
                      return (
                        <li key={section.id}>
                          <button
                            type="button"
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => onSectionChange(section.id)}
                            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-r-md border-l-2 px-3 py-2 text-left text-sm transition-colors ${
                              isActive
                                ? "border-brand bg-card font-semibold text-foreground"
                                : "border-transparent text-foreground/80 hover:border-input hover:bg-card/60"
                            }`}
                          >
                            <span>{section.label}</span>
                            {done && (
                              <Check
                                aria-label="completed"
                                className="h-4 w-4 shrink-0 text-moss"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : isComplete ? (
                <div className="ml-13 rounded-md border border-border bg-card p-3">
                  <StepPreview
                    step={step}
                    brief={brief}
                    selectedStrategy={selectedStrategy}
                  />
                </div>
              ) : (
                <p className="ml-13 text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
