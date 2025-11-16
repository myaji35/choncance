-- CreateEnum
CREATE TYPE "LLMProvider" AS ENUM ('GEMINI', 'OPENAI', 'KEYWORD');

-- CreateTable
CREATE TABLE "ChatbotSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "llmProvider" TEXT NOT NULL DEFAULT 'GEMINI',
    "geminiApiKey" TEXT,
    "openaiApiKey" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotSettings_pkey" PRIMARY KEY ("id")
);
