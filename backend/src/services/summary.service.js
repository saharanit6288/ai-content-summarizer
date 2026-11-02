import { prisma } from "../config/prisma.js";
import { generateSummary } from "./ollama.service.js";

export async function createSummary(
  userId, 
  inputText, 
  wordLimit,
  sourceType = "TEXT",
  sourceUrl = null) {
  const aiResult = await generateSummary(inputText, wordLimit);

  const savedSummary = await prisma.summary.create({
    data: {
      userId,
      sourceType,
      sourceUrl,
      inputText,
      requestedWordLimit: wordLimit,
      summaryText: aiResult.summaryText,
      status: "COMPLETED",

      aiModelRun: {
        create: {
          provider: aiResult.provider,
          model: aiResult.model,
          modelVersion: aiResult.modelVersion,
          durationMs: aiResult.durationMs,
          inputCharacters: aiResult.inputCharacters,
          outputWords: aiResult.outputWords,
          promptTokens: aiResult.promptTokens,
          completionTokens: aiResult.completionTokens,
          totalTokens: aiResult.totalTokens
        }
      }
    },
    include: {
      aiModelRun: true
    }
  });

  return savedSummary;
}