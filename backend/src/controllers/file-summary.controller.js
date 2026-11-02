
import { fileSummarySchema } from "../validators/file-summary.validator.js";
import {
  extractDocumentText,
  FileExtractionError
} from "../services/file-extraction.service.js";
import { createSummary } from "../services/summary.service.js";

export async function createSummaryFromFileController(req, res) {
  try {
    const validation = fileSummarySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data.",
        errors: validation.error.flatten()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF or DOCX file."
      });
    }

    const { wordLimit } = validation.data;

    // Extract text from the uploaded document.
    const document = await extractDocumentText(req.file);

    // Reuse the existing Ollama summarization and persistence logic.
    const summary = await createSummary(
      req.user.id,
      document.text,
      wordLimit,
      document.sourceType
    );

    return res.status(201).json({
      success: true,
      message: "Document summarized successfully.",
      data: {
        fileName: req.file.originalname,
        sourceType: document.sourceType,
        wordLimit,
        extractedCharacters: document.text.length,
        summary
      }
    });
  } catch (error) {
    console.error("File summarization failed:", error);

    if (error instanceof FileExtractionError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to summarize document."
    });
  }
}
