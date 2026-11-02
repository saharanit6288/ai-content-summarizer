
import path from "node:path";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

const MAX_ARTICLE_CHARACTERS = 100_000;

export class FileExtractionError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "FileExtractionError";
    this.statusCode = statusCode;
  }
}

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function validateFileSignature(buffer, extension) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new FileExtractionError("Uploaded file is empty.");
  }

  if (extension === ".pdf") {
    const pdfSignature = buffer.subarray(0, 5).toString();

    if (pdfSignature !== "%PDF-") {
      throw new FileExtractionError("Invalid PDF file.");
    }

    return;
  }

  if (extension === ".docx") {
    // DOCX is a ZIP-based Office document.
    const isZip =
      buffer.length >= 4 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      [0x03, 0x05, 0x07].includes(buffer[2]) &&
      [0x04, 0x06, 0x08].includes(buffer[3]);

    if (!isZip) {
      throw new FileExtractionError("Invalid DOCX file.");
    }

    return;
  }

  throw new FileExtractionError("Unsupported file format.");
}

async function extractPdfText(buffer) {
  try {
    const result = await pdf(buffer);

    return result.text;
  } catch (error) {
    throw new FileExtractionError(
      "Unable to read PDF. It may be corrupted, encrypted or invalid."
    );
  }
}

async function extractDocxText(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return result.value;
  } catch (error) {
    throw new FileExtractionError(
      "Unable to read DOCX. The document may be corrupted or invalid."
    );
  }
}

export async function extractDocumentText(file) {
  if (!file || !file.buffer) {
    throw new FileExtractionError("Please upload a document.");
  }

  const extension = path.extname(file.originalname).toLowerCase();

  validateFileSignature(file.buffer, extension);

  let extractedText;

  if (extension === ".pdf") {
    extractedText = await extractPdfText(file.buffer);
  } else if (extension === ".docx") {
    extractedText = await extractDocxText(file.buffer);
  } else {
    throw new FileExtractionError("Only PDF and DOCX files are supported.");
  }

  const normalizedText = normalizeText(extractedText);

  if (normalizedText.length < 100) {
    throw new FileExtractionError(
      "The document does not contain enough readable text to summarize.",
      422
    );
  }

  if (normalizedText.length > MAX_ARTICLE_CHARACTERS) {
    throw new FileExtractionError(
      "Extracted document exceeds the 100,000 character limit.",
      413
    );
  }

  return {
    text: normalizedText,
    sourceType: extension === ".pdf" ? "PDF" : "DOCX"
  };
}
