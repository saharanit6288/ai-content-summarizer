const baseUrl =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";

const model =
  process.env.OLLAMA_MODEL || "llama3.2:3b";

const timeoutMs = Number(
  process.env.OLLAMA_TIMEOUT_MS || 120000
);

export async function generateSummary(inputText, wordLimit) {
  const prompt = `
        You are a professional content summarization assistant.

        Summarize the following content in approximately ${wordLimit} words.

        Instructions:
        1. Preserve the main ideas and important facts.
        2. Do not invent information.
        3. Use clear and simple language.
        4. Avoid unnecessary repetition.
        5. Return only the summary.
        6. Aim for no more than ${wordLimit} words.

        CONTENT:
        ${inputText}
        `;

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  const startTime = Date.now();

  try {
    const response = await fetch(
      `${baseUrl}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false
        }),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      throw new Error(
        `Ollama returned HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.response || !data.response.trim()) {
      throw new Error("Ollama returned an empty summary");
    }

    return {
      summaryText: data.response.trim(),
      provider: "ollama",
      model: data.model || model,
      modelVersion: null,
      durationMs: Date.now() - startTime,
      inputCharacters: inputText.length,
      outputWords: data.response.trim().split(/\s+/).length,
      promptTokens: data.prompt_eval_count ?? null,
      completionTokens: data.eval_count ?? null,
      totalTokens:
        data.prompt_eval_count != null && data.eval_count != null
          ? data.prompt_eval_count + data.eval_count
          : null
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Ollama request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}