/**
 * A file the user has attached. Only the metadata is kept: nothing in this app
 * reads the bytes, so holding `File` handles in React state would pin whole
 * documents in memory for no benefit and would make the owning objects
 * unserialisable.
 */
export interface UploadedDocument {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
}

export interface RejectedFile {
  readonly name: string;
  readonly reason: string;
}

export interface UploadValidationResult {
  readonly accepted: readonly UploadedDocument[];
  readonly rejected: readonly RejectedFile[];
}
