"use client";

import type { ContentBlock, InteractiveBlockName } from "@/lib/content/blocks";
import {
  Checklist,
  DefinitionList,
  KeyValues,
  MetricGroups,
  NumberedPoints,
  Prose,
} from "./blocks/StaticBlock";

interface ContentRendererProps {
  blocks: readonly ContentBlock[];
  /** Interactive blocks are supplied by the page so this stays presentational. */
  interactive: Record<InteractiveBlockName, React.ReactNode>;
}

/**
 * Maps content blocks onto components. It holds no campaign copy of its own —
 * the text lives in `lib/content/sections.ts` and is rendered as plain text,
 * never as HTML.
 */
export default function ContentRenderer({
  blocks,
  interactive,
}: ContentRendererProps) {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "prose":
            return <Prose key={`${block.kind}-${block.title}`} block={block} />;
          case "definition-list":
            return (
              <DefinitionList key={`${block.kind}-${block.title}`} block={block} />
            );
          case "numbered-points":
            return (
              <NumberedPoints key={`${block.kind}-${block.title}`} block={block} />
            );
          case "metric-groups":
            return (
              <MetricGroups key={`${block.kind}-${block.title}`} block={block} />
            );
          case "key-values":
            return (
              <KeyValues key={`${block.kind}-${block.title}`} block={block} />
            );
          case "checklist":
            return (
              <Checklist key={`${block.kind}-${block.title}`} block={block} />
            );
          case "interactive":
            return (
              <div key={`${block.kind}-${block.component}`}>
                {interactive[block.component]}
              </div>
            );
          default: {
            // Exhaustiveness: a new block kind is a compile error here.
            const unreachable: never = block;
            return <div key={index} hidden data-unhandled={String(unreachable)} />;
          }
        }
      })}
    </div>
  );
}
