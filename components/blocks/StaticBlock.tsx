import { Check } from "lucide-react";
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
      <p className="text-sm leading-relaxed text-gray-700">{block.body}</p>
    </SectionCard>
  );
}

export function DefinitionList({ block }: { block: DefinitionListBlock }) {
  return (
    <SectionCard title={block.title}>
      <dl className="space-y-3">
        {block.items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm font-semibold text-gray-900">
              {item.label}
            </dt>
            <dd className="text-sm leading-relaxed text-gray-700">
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
          <li key={item.title} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              {index + 1}
            </span>
            <div>
              <h4 className="mb-1 font-semibold text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-700">{item.detail}</p>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {block.groups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h4 className="font-medium text-gray-900">{group.title}</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {group.metrics.map((metric) => (
                <li key={metric}>• {metric}</li>
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
      <dl className="divide-y divide-gray-200">
        {block.rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2"
          >
            <dt className="font-medium text-gray-900">{row.label}</dt>
            <dd className="font-semibold text-brand">{row.value}</dd>
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
          <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
