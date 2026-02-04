import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateGeminiResponse } from "@/lib/chatbot/gemini-response-generator";
import { generateLLMResponse } from "@/lib/chatbot/llm-response-generator";
import { classifyIntent } from "@/lib/chatbot/intent-classifier";
import { generateResponse } from "@/lib/chatbot/response-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    console.log("📨 Received chat message:", message);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    // DB에서 챗봇 설정 불러오기
    const settings = await prisma.chatbotSettings.findUnique({
      where: { id: "default" },
    });

    console.log("⚙️ Chatbot settings:", {
      llmProvider: settings?.llmProvider,
      hasGeminiKey: !!settings?.geminiApiKey,
      hasOpenAIKey: !!settings?.openaiApiKey,
    });

    // 설정에 따라 LLM 선택
    const llmProvider = settings?.llmProvider || "KEYWORD";

    if (llmProvider === "GEMINI" && settings?.geminiApiKey) {
      console.log("🤖 Using Gemini API");
      // Temporarily override env for this request
      process.env.GEMINI_API_KEY = settings.geminiApiKey;
      const response = await generateGeminiResponse(message, history || []);
      console.log("✅ Gemini response generated");
      return NextResponse.json(response);
    } else if (llmProvider === "OPENAI" && settings?.openaiApiKey) {
      console.log("🤖 Using OpenAI API");
      process.env.OPENAI_API_KEY = settings.openaiApiKey;
      const response = await generateLLMResponse(message, history || []);
      return NextResponse.json(response);
    } else {
      console.log("📝 Using keyword-based fallback");
      // 폴백: 기존 키워드 기반 응답
      const classifiedIntent = classifyIntent(message);
      const response = await generateResponse(message, classifiedIntent);
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("❌ Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
