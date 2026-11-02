import { describe, it, expect } from "vitest";

import {
  websiteUrlSchema
} from "../src/validators/website-url.validator.js";

describe("websiteUrlSchema", () => {
  it("accepts a valid website URL", () => {
    const result = websiteUrlSchema.safeParse({
      url: "https://example.com/article",
      wordLimit: 100
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid URL", () => {
    const result = websiteUrlSchema.safeParse({
      url: "not-a-url",
      wordLimit: 100
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsupported protocols", () => {
    const result = websiteUrlSchema.safeParse({
      url: "file:///C:/secret.txt",
      wordLimit: 100
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid word limit", () => {
    const result = websiteUrlSchema.safeParse({
      url: "https://example.com/article",
      wordLimit: 600
    });

    expect(result.success).toBe(false);
  });

  it("rejects credentials in the URL", () => {
    const result = websiteUrlSchema.safeParse({
      url: "https://user:password@example.com/article",
      wordLimit: 100
    });

    expect(result.success).toBe(false);
  });
});