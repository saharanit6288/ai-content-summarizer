import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254)
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must not exceed 128 characters")
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254)
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must not exceed 128 characters")
});