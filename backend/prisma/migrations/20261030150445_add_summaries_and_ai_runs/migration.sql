-- CreateEnum
CREATE TYPE "SummaryStatus" AS ENUM ('COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'TEXT',
    "inputText" TEXT NOT NULL,
    "requestedWordLimit" INTEGER NOT NULL,
    "summaryText" TEXT,
    "status" "SummaryStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModelRun" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "modelVersion" TEXT,
    "durationMs" INTEGER NOT NULL,
    "inputCharacters" INTEGER NOT NULL,
    "outputWords" INTEGER NOT NULL,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiModelRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Summary_userId_createdAt_idx" ON "Summary"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiModelRun_summaryId_key" ON "AiModelRun"("summaryId");

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiModelRun" ADD CONSTRAINT "AiModelRun_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
