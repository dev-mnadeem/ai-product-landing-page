import type { UploadedDocument } from "@/lib/uploads/types";

/**
 * An audience persona. Every field is serialisable — attached documents are
 * kept as metadata, not as `File` handles — so a persona can round-trip
 * through JSON for export or storage.
 */
export interface Persona {
  readonly id: string;
  name: string;
  category: string;
  demographic: string;
  lifestyles: string;
  behavioral: string;
  psychographic: string;
  personaPrompt: string;
  quote: string;
  age: string;
  gender: string;
  location: string;
  relationshipStatus: string;
  title: string;
  education: string;
  description: string;
  goals: string[];
  motivations: string[];
  documents: UploadedDocument[];
}

/** A persona as it appears in the audience picker, before it is opened. */
export interface PersonaSummary {
  readonly id: string;
  readonly name: string;
  readonly category: string;
}
