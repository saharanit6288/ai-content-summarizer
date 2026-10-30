import { createSummarySchema } from "../validators/summary.validator.js";
import { createSummary } from "../services/summary.service.js";

export async function createSummaryController(req, res) {
  const result = createSummarySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  try {
    const { inputText, wordLimit } = result.data;

    const summary = await createSummary(
      req.user.id,
      inputText,
      wordLimit
    );

    return res.status(201).json({
      success: true,
      message: "Summary generated successfully",
      data: summary
    });
  } catch (error) {
    console.error("Summary generation failed:", error.message);

    if (
      error.message.includes("Ollama") ||
      error.message.includes("fetch failed")
    ) {
      return res.status(503).json({
        success: false,
        message: "AI summarization service is currently unavailable"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to generate summary"
    });
  }
}