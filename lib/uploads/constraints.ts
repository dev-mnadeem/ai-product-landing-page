/** Upload limits, named once so the validator and the help text cannot drift. */

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_FILES_PER_COLLECTION = 10;

export interface AcceptedFormat {
  readonly extension: string;
  readonly mimeTypes: readonly string[];
  readonly label: string;
}

/**
 * Accepted formats keyed by extension. `file.type` is browser-supplied and
 * easily wrong or absent (Windows without an Office install reports an empty
 * string for .docx), so the extension is authoritative and the MIME type is a
 * secondary check rather than the only gate.
 */
export const ACCEPTED_FORMATS: readonly AcceptedFormat[] = [
  { extension: ".pdf", label: "PDF", mimeTypes: ["application/pdf"] },
  {
    extension: ".xlsx",
    label: "XLSX",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  {
    extension: ".docx",
    label: "DOCX",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  { extension: ".doc", label: "DOC", mimeTypes: ["application/msword"] },
];

export const ACCEPT_ATTRIBUTE = ACCEPTED_FORMATS.map((f) => f.extension).join(",");

export const ACCEPTED_FORMAT_LABELS = ACCEPTED_FORMATS.map((f) => f.label).join(
  ", "
);

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`;
}
