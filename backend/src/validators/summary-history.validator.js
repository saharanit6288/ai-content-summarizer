
import { z } from "zod";

export const summaryHistoryQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10),

  sourceType: z
    .enum(["TEXT", "URL", "PDF", "DOCX"])
    .optional(),

  status: z
    .enum(["COMPLETED", "FAILED"])
    .optional()
});

export const summaryIdSchema = z.object({
  id: z.string().min(1)
});
