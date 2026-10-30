import { describe, it, expect, vi, afterEach } from "vitest";
import { generateSummary } from "../src/services/ollama.service.js";

describe("generateSummary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns summary and AI metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          model: "llama3.2:3b",
          response: "This is a test summary.",
          prompt_eval_count: 100,
          eval_count: 10
        })
      })
    );

    const result = await generateSummary(
      "A".repeat(200),
      100
    );

    expect(result.summaryText).toBe("This is a test summary.");
    expect(result.provider).toBe("ollama");
    expect(result.model).toBe("llama3.2:3b");
    expect(result.outputWords).toBe(5);
    expect(result.totalTokens).toBe(110);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("throws when Ollama returns an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })
    );

    await expect(
      generateSummary("A".repeat(200), 100)
    ).rejects.toThrow("Ollama returned HTTP 500");
  });

  it("throws when Ollama returns an empty response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: "  "
        })
      })
    );

    await expect(
      generateSummary("A".repeat(200), 100)
    ).rejects.toThrow("Ollama returned an empty summary");
  });
});