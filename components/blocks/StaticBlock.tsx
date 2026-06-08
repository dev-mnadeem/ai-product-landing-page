import { Square } from "lucide-react";
import type {
  ChecklistBlock,
  DefinitionListBlock,
  KeyValuesBlock,
  MetricGroupsBlock,
  NumberedPointsBlock,
  ProseBlock,
} from "@/lib/content/blocks";
import SectionCard from "./SectionCard";

/**
 * All non-interactive block kinds. Every value reaching these components is a
 * plain string rendered as text — nothing here injects markup, so brief text
 * cannot become an HTML sink.
 */

export function Prose({ block }: { block: ProseBlock }) {
  return (
    <SectionCard title={block.title}>
      <p className="max-w-prose text-[0.95rem] leading-relaxed text-foreground/85">
        {block.body}
      </p>
    </SectionCard>
  );
}

export function DefinitionList({ block }: { block: DefinitionListBlock }) {
  return (
    <SectionCard title={block.title}>
      <dl className="divide-y divide-border">
        {block.items.map((item) => (
          <div
            key={item.label}
            className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[11rem_1fr] sm:gap-4"
          >
            <dt className="text-sm font-semibold text-foreground">
              {item.label}
            </dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">
              {item.detail}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}

export function NumberedPoints({ block }: { block: NumberedPointsBlock }) {
  return (
    <SectionCard title={block.title}>
      <ol className="space-y-4">
        {block.items.map((item, index) => (
          <li key={item.title} className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="pt-0.5 font-mono text-sm font-medium text-brand"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h4 className="mb-1 font-semibold text-foreground">{item.title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

export function MetricGroups({ block }: { block: MetricGroupsBlock }) {
  return (
    <SectionCard title={block.title}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {block.groups.map((group) => (
          <div key={group.title}>
            <h4 className="mb-2 border-b border-border pb-1 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {group.title}
            </h4>
            <ul className="list-disc space-y-1 pl-4 text-sm text-foreground marker:text-brand">
              {group.metrics.map((metric) => (
                <li key={metric}>{metric}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function KeyValues({ block }: { block: KeyValuesBlock }) {
  return (
    <SectionCard title={block.title}>
      <dl className="divide-y divide-border">
        {block.rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 py-2"
          >
            <dt className="text-sm text-foreground">{row.label}</dt>
            <dd className="font-mono text-base font-medium text-brand">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}

export function Checklist({ block }: { block: ChecklistBlock }) {
  return (
    <SectionCard title={block.title}>
      <ul className="space-y-2">
        {block.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
          >
            <Square
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
