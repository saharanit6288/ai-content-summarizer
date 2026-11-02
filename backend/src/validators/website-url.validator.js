import { z } from "zod";

export const websiteUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Website URL is required")
    .max(2048, "URL is too long")
    .url("Enter a valid URL")
    .refine((value) => {
      try {
        const parsed = new URL(value);

        return (
          ["http:", "https:"].includes(parsed.protocol) &&
          !parsed.username &&
          !parsed.password &&
          !parsed.hash
        );
      } catch {
        return false;
      }
    }, "Only HTTP and HTTPS website URLs without credentials or fragments are allowed"),

  wordLimit: z
    .number()
    .int()
    .min(50)
    .max(500)
});