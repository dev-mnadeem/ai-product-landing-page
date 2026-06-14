import { describe, expect, it } from "vitest";
import {
  MAX_FILES_PER_COLLECTION,
  MAX_FILE_BYTES,
  formatBytes,
} from "@/lib/uploads/constraints";
import { describeRejections, validateFiles } from "@/lib/uploads/validate";
import type { FileLike } from "@/lib/uploads/validate";

const pdf = (name = "brief.pdf", size = 1024): FileLike => ({
  name,
  size,
  type: "application/pdf",
});

describe("validateFiles", () => {
  it("accepts a well-formed PDF and keeps its metadata", () => {
    const { accepted, rejected } = validateFiles([], [pdf("research.pdf", 2048)]);
    expect(rejected).toHaveLength(0);
    expect(accepted).toHaveLength(1);
    expect(accepted[0].name).toBe("research.pdf");
    expect(accepted[0].size).toBe(2048);
    expect(accepted[0].mimeType).toBe("application/pdf");
  });

  it("keeps the valid files in a mixed selection instead of discarding all of them", () => {
    const { accepted, rejected } = validateFiles(
      [],
      [pdf("good.pdf"), { name: "payload.exe", size: 10, type: "application/x-msdownload" }, pdf("also-good.pdf")]
    );
    expect(accepted.map((d) => d.name)).toEqual(["good.pdf", "also-good.pdf"]);
    expect(rejected.map((r) => r.name)).toEqual(["payload.exe"]);
  });

  it("rejects an unsupported extension even when the MIME type looks allowed", () => {
    const { accepted, rejected } = validateFiles(
      [],
      [{ name: "report.exe", size: 100, type: "application/pdf" }]
    );
    expect(accepted).toHaveLength(0);
    expect(rejected[0].reason).toContain("unsupported format");
  });

  it("rejects a file whose MIME type contradicts its extension", () => {
    const { rejected } = validateFiles(
      [],
      [{ name: "invoice.pdf", size: 100, type: "text/html" }]
    );
    expect(rejected[0].reason).toContain("does not match");
  });

  it("allows an empty MIME type, which some browsers report for .docx", () => {
    const { accepted } = validateFiles(
      [],
      [{ name: "notes.docx", size: 4096, type: "" }]
    );
    expect(accepted).toHaveLength(1);
  });

  it("rejects an oversized file and names the limit", () => {
    const { accepted, rejected } = validateFiles(
      [],
      [pdf("huge.pdf", MAX_FILE_BYTES + 1)]
    );
    expect(accepted).toHaveLength(0);
    expect(rejected[0].reason).toContain(formatBytes(MAX_FILE_BYTES));
  });

  it("rejects a zero-byte file", () => {
    const { rejected } = validateFiles([], [pdf("empty.pdf", 0)]);
    expect(rejected[0].reason).toBe("file is empty");
  });

  it("rejects a document that is already attached", () => {
    const first = validateFiles([], [pdf("brief.pdf", 900)]);
    const second = validateFiles(first.accepted, [pdf("brief.pdf", 900)]);
    expect(second.accepted).toHaveLength(0);
    expect(second.rejected[0].reason).toBe("already attached");
  });

  it("treats a same-named file of a different size as a distinct document", () => {
    const first = validateFiles([], [pdf("brief.pdf", 900)]);
    const second = validateFiles(first.accepted, [pdf("brief.pdf", 901)]);
    expect(second.accepted).toHaveLength(1);
  });

  it("de-duplicates within a single selection", () => {
    const { accepted, rejected } = validateFiles(
      [],
      [pdf("same.pdf", 10), pdf("same.pdf", 10)]
    );
    expect(accepted).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  });

  it("caps the collection so the attachment list cannot grow without bound", () => {
    const many = Array.from({ length: MAX_FILES_PER_COLLECTION + 3 }, (_, i) =>
      pdf(`doc-${i}.pdf`, 100 + i)
    );
    const { accepted, rejected } = validateFiles([], many);
    expect(accepted).toHaveLength(MAX_FILES_PER_COLLECTION);
    expect(rejected).toHaveLength(3);
    expect(rejected[0].reason).toContain(String(MAX_FILES_PER_COLLECTION));
  });

  it("gives every accepted document a unique id", () => {
    const { accepted } = validateFiles(
      [],
      [pdf("a.pdf", 1), pdf("b.pdf", 2), pdf("c.pdf", 3)]
    );
    expect(new Set(accepted.map((d) => d.id)).size).toBe(3);
  });

  it("summarises rejections as one readable line", () => {
    const { rejected } = validateFiles([], [pdf("empty.pdf", 0)]);
    expect(describeRejections(rejected)).toBe("empty.pdf: file is empty");
  });
});

describe("formatBytes", () => {
  it("scales through B, KB and MB", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
  });
});
