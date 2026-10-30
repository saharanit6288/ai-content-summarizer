import { describe, it, expect } from "vitest";
import { createSummarySchema } from "../src/validators/summary.validator.js";

describe("createSummarySchema", () => {
  it("accepts valid input", () => {
    const result = createSummarySchema.safeParse({
      inputText: "A".repeat(200),
      wordLimit: 150
    });

    expect(result.success).toBe(true);
  });

  it("rejects input that is too short", () => {
    const result = createSummarySchema.safeParse({
      inputText: "Too short",
      wordLimit: 150
    });

    expect(result.success).toBe(false);
  });

  it("rejects a word limit below 50", () => {
    const result = createSummarySchema.safeParse({
      inputText: "A".repeat(200),
      wordLimit: 20
    });

    expect(result.success).toBe(false);
  });

  it("rejects a word limit above 500", () => {
    const result = createSummarySchema.safeParse({
      inputText: "A".repeat(200),
      wordLimit: 600
    });

    expect(result.success).toBe(false);
  });

  it("rejects a string instead of a number", () => {
    const result = createSummarySchema.safeParse({
      inputText: "A".repeat(200),
      wordLimit: "150"
    });

    expect(result.success).toBe(false);
  });
});