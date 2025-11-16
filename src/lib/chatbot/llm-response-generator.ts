import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { PropertyReference } from "@/components/chatbot/types";

export interface LLMChatResponse {
  message: string;
  propertyReferences?: PropertyReference[];
}

/**
 * OpenAI를 사용하여 자연스러운 대화 응답을 생성합니다.
 */
export async function generateLLMResponse(
  userMessage: string,
  history: any[]
): Promise<LLMChatResponse> {
  try {
    // API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // OpenAI 인스턴스를 함수 내부에서 생성
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // 1. 현재 등록된 모든 숙소 정보 가져오기
    const properties = await prisma.property.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        tags: true,
        reviews: {
          select: {
            rating: true,
            content: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        },
      },
      take: 20, // 최대 20개만 (토큰 절약)
    });

    // 2. 태그 정보 가져오기
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
        category: true,
        description: true,
      },
    });

    // 3. 숙소 정보를 LLM이 이해할 수 있는 형태로 변환
    const propertiesContext = properties.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description.substring(0, 200), // 토큰 절약
      address: p.address,
      province: p.province,
      city: p.city,
      pricePerNight: Number(p.pricePerNight),
      maxGuests: p.maxGuests,
      tags: p.tags.map((t) => t.name),
      averageRating:
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : null,
      reviewCount: p.reviews.length,
    }));

    // 4. 시스템 프롬프트 생성
    const systemPrompt = `당신은 VINTEE의 AI 상담 어시스턴트입니다.

**중요 지침:**
1. 오직 아래 제공된 숙소 정보만을 기반으로 답변하세요.
2. 등록되지 않은 숙소나 외부 정보는 절대 언급하지 마세요.
3. 사용자 질문에 적합한 숙소를 1~5개 추천하세요.
4. 추천할 숙소의 ID를 반드시 응답에 포함하세요 (형식: [PROPERTY_IDS: id1, id2, id3])
5. 친근하고 자연스러운 한국어로 답변하세요.
6. 질문과 관련 없는 숙소는 추천하지 마세요.

**사용 가능한 태그:**
${tags.map((t) => `${t.name} (${t.category}): ${t.description || ""}`).join("\n")}

**등록된 숙소 목록:**
${JSON.stringify(propertiesContext, null, 2)}

**지역 정보:**
- 강원도: 강릉, 속초, 양양, 춘천
- 경상북도: 경주, 안동
- 전라북도: 전주, 남해
- 제주도: 제주시, 서귀포

**응답 형식:**
자연스러운 답변을 작성하고, 추천하는 숙소가 있다면 마지막에 다음 형식으로 ID를 포함하세요:
[PROPERTY_IDS: id1, id2, id3]

예시: "강릉의 바다 뷰 숙소 3곳을 추천드립니다! [PROPERTY_IDS: abc123, def456, ghi789]"`;

    // 5. OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 비용 효율적인 모델
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-5).map((msg: any) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })),
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content || "";

    // 6. 응답에서 숙소 ID 추출
    const propertyIdsMatch = aiResponse.match(/\[PROPERTY_IDS:\s*([^\]]+)\]/);
    let propertyReferences: PropertyReference[] = [];

    if (propertyIdsMatch) {
      const ids = propertyIdsMatch[1]
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      // 추천된 숙소 정보 가져오기
      const recommendedProperties = await prisma.property.findMany({
        where: {
          id: { in: ids },
          status: "APPROVED",
        },
        include: {
          tags: true,
        },
      });

      propertyReferences = recommendedProperties.map((p) => ({
        id: p.id,
        name: p.name,
        thumbnailUrl: p.thumbnailUrl || p.images[0],
        pricePerNight: Number(p.pricePerNight),
        tags: p.tags.map((t) => t.name),
      }));
    }

    // 7. [PROPERTY_IDS: ...] 부분 제거한 깔끔한 메시지 반환
    const cleanMessage = aiResponse.replace(/\[PROPERTY_IDS:[^\]]+\]/g, "").trim();

    return {
      message: cleanMessage,
      propertyReferences,
    };
  } catch (error) {
    console.error("LLM Response Generation Error:", error);

    // API 키가 없거나 오류 발생 시 폴백
    if (error instanceof Error && error.message.includes("API key")) {
      return {
        message:
          "죄송합니다. AI 기능을 사용하려면 OPENAI_API_KEY 환경 변수를 설정해주세요. 간단한 키워드 검색으로 도와드릴게요. 예: '강릉 숙소', '#논뷰맛집'",
      };
    }

    return {
      message: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}
