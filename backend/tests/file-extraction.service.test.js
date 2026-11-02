
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("pdf-parse/lib/pdf-parse.js", () => ({
  default: vi.fn()
}));

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn()
  }
}));

import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

import {
  extractDocumentText,
  FileExtractionError
} from "../src/services/file-extraction.service.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("extractDocumentText", () => {
  it("extracts and normalizes PDF text", async () => {
    pdf.mockResolvedValue({
      text: "A".repeat(100) + "\n\n\nSome additional text."
    });

    const buffer = Buffer.from("%PDF-1.7\nsample");

    const result = await extractDocumentText({
      originalname: "sample.pdf",
      buffer
    });

    expect(result.sourceType).toBe("PDF");
    expect(result.text).toContain("Some additional text.");
    expect(pdf).toHaveBeenCalledOnce();
  });

  it("extracts DOCX text", async () => {
    mammoth.extractRawText.mockResolvedValue({
      value: "This is a sample document. ".repeat(10)
    });

    const buffer = Buffer.from([
      0x50, 0x4b, 0x03, 0x04,
      0x00, 0x00, 0x00, 0x00
    ]);

    const result = await extractDocumentText({
      originalname: "sample.docx",
      buffer
    });

    expect(result.sourceType).toBe("DOCX");
    expect(result.text.length).toBeGreaterThanOrEqual(100);
    expect(mammoth.extractRawText).toHaveBeenCalledOnce();
  });

  it("rejects unsupported file extensions", async () => {
    await expect(
      extractDocumentText({
        originalname: "sample.txt",
        buffer: Buffer.from("some content")
      })
    ).rejects.toThrow(FileExtractionError);
  });

  it("rejects invalid PDF signatures", async () => {
    await expect(
      extractDocumentText({
        originalname: "sample.pdf",
        buffer: Buffer.from("not a PDF")
      })
    ).rejects.toThrow("Invalid PDF file.");
  });

  it("rejects empty files", async () => {
    await expect(
      extractDocumentText({
        originalname: "empty.pdf",
        buffer: Buffer.alloc(0)
      })
    ).rejects.toThrow("Uploaded file is empty.");
  });

  it("rejects documents with insufficient text", async () => {
    mammoth.extractRawText.mockResolvedValue({
      value: "Too short"
    });

    const buffer = Buffer.from([
      0x50, 0x4b, 0x03, 0x04
    ]);

    await expect(
      extractDocumentText({
        originalname: "short.docx",
        buffer
      })
    ).rejects.toThrow(
      "The document does not contain enough readable text to summarize."
    );
  });

  it("rejects documents exceeding the character limit", async () => {
    mammoth.extractRawText.mockResolvedValue({
      value: "A".repeat(100_001)
    });

    const buffer = Buffer.from([
      0x50, 0x4b, 0x03, 0x04
    ]);

    await expect(
      extractDocumentText({
        originalname: "large.docx",
        buffer
      })
    ).rejects.toThrow(
      "Extracted document exceeds the 100,000 character limit."
    );
  });
});
