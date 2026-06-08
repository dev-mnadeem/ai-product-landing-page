"use client";

import { useCallback, useId, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ACCEPTED_FORMAT_LABELS,
  ACCEPT_ATTRIBUTE,
  MAX_FILES_PER_COLLECTION,
  MAX_FILE_BYTES,
  formatBytes,
} from "@/lib/uploads/constraints";
import { describeRejections, validateFiles } from "@/lib/uploads/validate";
import type { UploadedDocument } from "@/lib/uploads/types";

interface FileUploadProps {
  documents: readonly UploadedDocument[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  title?: string;
  description?: string;
}

export default function FileUpload({
  documents,
  onDocumentsChange,
  title = "Available Assets & Resources",
  description = "Add all relevant documents such as logos, images, research, or references.",
}: FileUploadProps) {
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Two FileUpload instances can be mounted at once (the brief and the persona
  // dialog), so the input id has to be unique per instance.
  const inputId = useId();

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const { accepted, rejected } = validateFiles(
        documents,
        Array.from(files)
      );
      // Valid files in a mixed selection are kept: one bad file in a drag of
      // ten no longer discards the other nine.
      if (accepted.length > 0) {
        onDocumentsChange([...documents, ...accepted]);
      }
      setError(rejected.length > 0 ? describeRejections(rejected) : "");
    },
    [documents, onDocumentsChange]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    // Clearing the value is what allows the same file to be picked twice in a
    // row — without it the browser fires no change event the second time.
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter((document) => document.id !== id));
    setError("");
  };

  const isFull = documents.length >= MAX_FILES_PER_COLLECTION;

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <label
          htmlFor={inputId}
          onDrop={handleDrop}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-brand bg-brand/5"
              : "border-gray-300 hover:border-gray-400"
          } ${isFull ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            multiple
            disabled={isFull}
            accept={ACCEPT_ATTRIBUTE}
            onChange={handleInputChange}
            className="sr-only"
          />
          <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-2 text-sm font-medium text-gray-600">
            {isFull
              ? `Attachment limit reached (${MAX_FILES_PER_COLLECTION} files)`
              : "Click to upload your file or drag & drop here"}
          </p>
          <p className="text-xs text-gray-500">
            {ACCEPTED_FORMAT_LABELS} · up to {formatBytes(MAX_FILE_BYTES)} each ·
            {" "}
            {documents.length}/{MAX_FILES_PER_COLLECTION} attached
          </p>
        </label>

        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}

        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              Attached documents
            </h4>
            <ul className="space-y-2">
              {documents.map((document) => (
                <li
                  key={document.id}
                  className="flex items-center justify-between gap-3 rounded bg-gray-50 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate text-sm text-gray-700">
                      {document.name}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatBytes(document.size)}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove ${document.name}`}
                    onClick={() => removeDocument(document.id)}
                    className="h-6 w-6 shrink-0 cursor-pointer p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
