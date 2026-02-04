import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.chatbotSettings.findUnique({
      where: { id: "default" },
    });

    // 설정이 없으면 기본 값 생성
    if (!settings) {
      settings = await prisma.chatbotSettings.create({
        data: {
          id: "default",
          llmProvider: process.env.GEMINI_API_KEY ? "GEMINI" : "KEYWORD",
          geminiApiKey: process.env.GEMINI_API_KEY,
          openaiApiKey: process.env.OPENAI_API_KEY,
        },
      });
    }

    // 보안: API 키는 마스킹하여 반환
    return NextResponse.json({
      llmProvider: settings.llmProvider,
      geminiApiKey: settings.geminiApiKey
        ? settings.geminiApiKey.substring(0, 10) + "..."
        : "",
      openaiApiKey: settings.openaiApiKey
        ? settings.openaiApiKey.substring(0, 10) + "..."
        : "",
    });
  } catch (error) {
    console.error("Get chatbot settings error:", error);
    return NextResponse.json(
      { error: "설정 로드에 실패했습니다" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { llmProvider, geminiApiKey, openaiApiKey } = body;

    // Validation
    if (!["GEMINI", "OPENAI", "KEYWORD"].includes(llmProvider)) {
      return NextResponse.json(
        { error: "유효하지 않은 LLM 제공자입니다" },
        { status: 400 }
      );
    }

    // API 키가 변경되지 않은 경우 (마스킹된 값) 기존 값 유지
    let updatedGeminiKey = geminiApiKey;
    let updatedOpenaiKey = openaiApiKey;

    if (geminiApiKey?.endsWith("...")) {
      const existing = await prisma.chatbotSettings.findUnique({
        where: { id: "default" },
      });
      updatedGeminiKey = existing?.geminiApiKey || null;
    }

    if (openaiApiKey?.endsWith("...")) {
      const existing = await prisma.chatbotSettings.findUnique({
        where: { id: "default" },
      });
      updatedOpenaiKey = existing?.openaiApiKey || null;
    }

    // Upsert settings
    const settings = await prisma.chatbotSettings.upsert({
      where: { id: "default" },
      update: {
        llmProvider,
        geminiApiKey: updatedGeminiKey || null,
        openaiApiKey: updatedOpenaiKey || null,
      },
      create: {
        id: "default",
        llmProvider,
        geminiApiKey: updatedGeminiKey || null,
        openaiApiKey: updatedOpenaiKey || null,
      },
    });

    return NextResponse.json({
      success: true,
      llmProvider: settings.llmProvider,
    });
  } catch (error) {
    console.error("Update chatbot settings error:", error);
    return NextResponse.json(
      { error: "설정 저장에 실패했습니다" },
      { status: 500 }
    );
  }
}
