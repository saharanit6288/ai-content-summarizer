
import { z } from "zod";

export const fileSummarySchema = z.object({
  wordLimit: z.coerce
    .number()
    .int()
    .min(50)
    .max(500)
    .default(150)
});
