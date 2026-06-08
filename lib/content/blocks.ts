/**
 * Section content is data, not JSX.
 *
 * Each section declares a list of blocks and `ContentRenderer` maps block
 * kinds to components. Adding a section means adding an entry to the content
 * map; adding a *presentation* means adding one case to the renderer. The two
 * grow independently.
 */

export type InteractiveBlockName =
  | "file-upload"
  | "audience-picker"
  | "strategy-generator";

export interface ProseBlock {
  readonly kind: "prose";
  readonly title: string;
  readonly body: string;
}

export interface DefinitionListBlock {
  readonly kind: "definition-list";
  readonly title: string;
  readonly items: readonly { readonly label: string; readonly detail: string }[];
}

export interface NumberedPointsBlock {
  readonly kind: "numbered-points";
  readonly title: string;
  readonly items: readonly { readonly title: string; readonly detail: string }[];
}

export interface MetricGroupsBlock {
  readonly kind: "metric-groups";
  readonly title: string;
  readonly groups: readonly {
    readonly title: string;
    readonly metrics: readonly string[];
  }[];
}

export interface KeyValuesBlock {
  readonly kind: "key-values";
  readonly title: string;
  readonly rows: readonly { readonly label: string; readonly value: string }[];
}

export interface ChecklistBlock {
  readonly kind: "checklist";
  readonly title: string;
  readonly items: readonly string[];
}

export interface InteractiveBlock {
  readonly kind: "interactive";
  readonly component: InteractiveBlockName;
}

export type ContentBlock =
  | ProseBlock
  | DefinitionListBlock
  | NumberedPointsBlock
  | MetricGroupsBlock
  | KeyValuesBlock
  | ChecklistBlock
  | InteractiveBlock;
