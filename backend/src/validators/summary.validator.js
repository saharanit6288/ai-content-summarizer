import { z } from "zod";

export const createSummarySchema = z.object({
  inputText: z
    .string()
    .trim()
    .min(100, "Input must contain at least 100 characters")
    .max(100000, "Input must not exceed 100,000 characters"),

  wordLimit: z
    .number()
    .int("Word limit must be a whole number")
    .min(50, "Minimum summary length is 50 words")
    .max(500, "Maximum summary length is 500 words")
});