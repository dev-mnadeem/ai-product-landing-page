import {
  ACCEPTED_FORMATS,
  ACCEPTED_FORMAT_LABELS,
  MAX_FILES_PER_COLLECTION,
  MAX_FILE_BYTES,
  formatBytes,
} from "./constraints";
import type {
  RejectedFile,
  UploadValidationResult,
  UploadedDocument,
} from "./types";

/** The minimum a `File` has to look like. Keeps the validator testable in Node. */
export interface FileLike {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function formatFor(name: string) {
  const extension = extensionOf(name);
  return ACCEPTED_FORMATS.find((format) => format.extension === extension);
}

/** Stable key used to spot the same document being attached twice. */
function identityOf(file: FileLike | UploadedDocument): string {
  const size = "size" in file ? file.size : 0;
  return `${file.name.toLowerCase()}:${size}`;
}

let documentCounter = 0;

function toDocument(file: FileLike): UploadedDocument {
  documentCounter += 1;
  return {
    id: `doc-${documentCounter}-${file.name.toLowerCase()}`,
    name: file.name,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Validate an incoming selection against the documents already attached.
 *
 * Every file is judged on its own: a rejected file never blocks the valid ones
 * selected alongside it, which is the behaviour a drag of ten files needs.
 * Duplicates (same name and size) and anything over the collection cap are
 * rejected with a reason rather than silently dropped.
 */
export function validateFiles(
  existing: readonly UploadedDocument[],
  incoming: readonly FileLike[]
): UploadValidationResult {
  const accepted: UploadedDocument[] = [];
  const rejected: RejectedFile[] = [];
  const seen = new Set(existing.map(identityOf));
  let slotsLeft = Math.max(0, MAX_FILES_PER_COLLECTION - existing.length);

  for (const file of incoming) {
    const format = formatFor(file.name);

    if (!format) {
      rejected.push({
        name: file.name,
        reason: `unsupported format — accepted: ${ACCEPTED_FORMAT_LABELS}`,
      });
      continue;
    }

    // An empty MIME type is normal for some browsers and OSes; only an actively
    // contradictory one is treated as a mismatch.
    if (file.type && !format.mimeTypes.includes(file.type)) {
      rejected.push({
        name: file.name,
        reason: `content type ${file.type} does not match ${format.extension}`,
      });
      continue;
    }

    if (file.size <= 0) {
      rejected.push({ name: file.name, reason: "file is empty" });
      continue;
    }

    if (file.size > MAX_FILE_BYTES) {
      rejected.push({
        name: file.name,
        reason: `${formatBytes(file.size)} exceeds the ${formatBytes(
          MAX_FILE_BYTES
        )} limit`,
      });
      continue;
    }

    const identity = identityOf(file);
    if (seen.has(identity)) {
      rejected.push({ name: file.name, reason: "already attached" });
      continue;
    }

    if (slotsLeft === 0) {
      rejected.push({
        name: file.name,
        reason: `only ${MAX_FILES_PER_COLLECTION} files can be attached`,
      });
      continue;
    }

    seen.add(identity);
    slotsLeft -= 1;
    accepted.push(toDocument(file));
  }

  return { accepted, rejected };
}

/** One-line summary of the rejections, suitable for an inline error. */
export function describeRejections(rejected: readonly RejectedFile[]): string {
  return rejected.map((item) => `${item.name}: ${item.reason}`).join(" · ");
}
