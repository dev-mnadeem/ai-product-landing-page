import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import FileUpload from "@/components/FileUpload";
import type { UploadedDocument } from "@/lib/uploads/types";

function Harness() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  return <FileUpload documents={documents} onDocumentsChange={setDocuments} />;
}

function file(name: string, type: string, bytes = 32): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("<FileUpload />", () => {
  it("lists an accepted document with its size", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file("research.pdf", "application/pdf", 2048));

    expect(await screen.findByText("research.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 KB")).toBeInTheDocument();
  });

  it("accepts a dropped file", async () => {
    render(<Harness />);
    fireEvent.drop(screen.getByText(/drag & drop here/).closest("label")!, {
      dataTransfer: { files: [file("dropped.docx", "", 1024)] },
    });
    expect(await screen.findByText("dropped.docx")).toBeInTheDocument();
  });

  it("shows why a dropped file was rejected and does not list it", async () => {
    render(<Harness />);
    fireEvent.drop(screen.getByText(/drag & drop here/).closest("label")!, {
      dataTransfer: {
        files: [file("payload.exe", "application/x-msdownload")],
      },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /unsupported format/
    );
    expect(screen.queryByText("payload.exe")).not.toBeInTheDocument();
  });

  it("keeps the valid half of a mixed drop", async () => {
    render(<Harness />);
    fireEvent.drop(screen.getByText(/drag & drop here/).closest("label")!, {
      dataTransfer: {
        files: [
          file("keep.pdf", "application/pdf"),
          file("drop-me.exe", "application/x-msdownload"),
        ],
      },
    });

    expect(await screen.findByText("keep.pdf")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("drop-me.exe");
  });

  it("removes a document when its remove button is pressed", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file("brief.pdf", "application/pdf"));

    await user.click(await screen.findByRole("button", { name: "Remove brief.pdf" }));
    expect(screen.queryByText("brief.pdf")).not.toBeInTheDocument();
  });

  it("clears the input value so the same file can be selected twice", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file("brief.pdf", "application/pdf"));
    expect(input.value).toBe("");
  });

  it("announces the attachment count and the size limit", () => {
    render(<Harness />);
    expect(screen.getByText(/0\/10 attached/)).toBeInTheDocument();
    expect(screen.getByText(/up to 5 MB each/)).toBeInTheDocument();
  });
});
