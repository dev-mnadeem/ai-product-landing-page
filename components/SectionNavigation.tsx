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
      <div className="text-xs text-gray-500">{label}</div>
      <div className="truncate text-sm font-semibold text-gray-900">
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
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
            Selected strategy
          </span>
          <div className="pt-1 text-sm font-semibold text-gray-900">
            {selectedStrategy.title}
          </div>
          <p className="line-clamp-2 text-xs text-gray-500">
            {selectedStrategy.positioning}
          </p>
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          No strategy selected yet — pick one in Strategy Selection.
        </p>
      );
    case 3:
      return (
        <p className="text-xs text-gray-500">
          {selectedStrategy
            ? `Concepts will be developed against "${selectedStrategy.title}".`
            : "Concepts follow once a strategy is chosen."}
        </p>
      );
    default:
      return (
        <p className="text-xs text-gray-500">
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
      <div className="absolute top-0 bottom-0 left-2 w-[3px] rounded-full bg-gray-200" />
      <div
        className="absolute top-0 left-2 w-[3px] rounded-full bg-brand transition-[height] duration-300"
        style={{ height: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Workflow completion"
      />

      <ol className="space-y-8">
        {WORKFLOW_STEPS.map((step) => {
          const isCurrent = step.id === currentStep;
          const isComplete = isStepComplete(step, completedSections);
          const Icon = STEP_ICONS[step.icon];

          return (
            <li key={step.id}>
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-brand ${
                    isCurrent || isComplete ? "bg-brand" : "bg-transparent"
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5 text-brand-foreground" />
                  ) : (
                    <Icon
                      className={`h-5 w-5 ${
                        isCurrent ? "text-brand-foreground" : "text-gray-700"
                      }`}
                    />
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Step {step.id}</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {step.title}
                  </div>
                </div>
              </div>

              {isCurrent ? (
                <>
                  <p className="mb-4 ml-15 text-sm text-gray-500">
                    {step.description}
                  </p>
                  <ul className="ml-5 space-y-2">
                    {step.sections.map((section) => {
                      const isActive = activeSection === section.id;
                      const done = completedSections.includes(section.id);
                      return (
                        <li key={section.id}>
                          <button
                            type="button"
                            aria-current={isActive ? "step" : undefined}
                            onClick={() => onSectionChange(section.id)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors ${
                              isActive
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="text-base font-semibold">
                              {section.label}
                            </span>
                            {done && (
                              <Check
                                aria-label="completed"
                                className="h-5 w-5 text-green-600"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : isComplete ? (
                <div className="ml-5 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
                  <StepPreview
                    step={step}
                    brief={brief}
                    selectedStrategy={selectedStrategy}
                  />
                </div>
              ) : (
                <p className="mb-4 ml-15 text-sm text-gray-500">
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
