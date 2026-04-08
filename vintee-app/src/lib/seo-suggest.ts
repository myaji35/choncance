// ISS-037: 호스트 입력 → AI SEO 최적화 제안
// brand voice + AI 검색 시대 GEO 최적화 동시 적용
import { openai, CHAT_MODEL } from "./graph-rag/openai-client";

export interface SeoSuggestion {
  title: string;
  description: string;
  highlights: string[];
  // 어떤 점이 개선되었는지 짧은 설명 (호스트 신뢰)
  changeNotes: string[];
}

const SYSTEM_PROMPT = `당신은 한국 시골 숙소(촌캉스) 큐레이션 플랫폼 VINTEE의 SEO/카피 전문가입니다.
호스트가 입력한 거친 정보를 받아 다음 원칙으로 다듬어주세요.

## VINTEE Brand Voice
- 다정하지만 똑똑한 동네 친구. 과장 금지, 큐레이션 진정성.
- "최고의" "BEST" "마감 임박" 같은 자극적 표현 절대 금지.
- 실제 풍경/체험을 구체적으로 묘사 ("아침에 새소리로 깨는 곳", "왕복 3시간이면 닿는 진짜 시골").

## SEO/AEO 원칙
- title은 30~50자, "지역 + 특징 + 형태" 순서 권장 (예: "충남 아산 논뷰 한옥 펜션").
- description은 200~400자, 누가/언제/왜에 답하도록.
- highlights는 5개, 각 10~20자 짧고 구체적인 키워드. 예: "논뷰 전망", "바비큐 가능", "별 관측 좋음".

## 응답 형식 (JSON)
{
  "title": "...",
  "description": "...",
  "highlights": ["...", "...", "...", "...", "..."],
  "changeNotes": ["title을 30~50자 범위로 조정", "description에 구체적 풍경 묘사 추가", ...]
}

원본의 핵심 사실(지역/숙소형태/주요 특징)은 반드시 보존하세요. 거짓 정보 금지.`;

export async function suggestSeo(input: {
  title: string;
  description: string;
  location: string;
  highlights?: string[];
  hostIntro?: string;
  uniqueExperience?: string;
}): Promise<SeoSuggestion | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null; // dev fallback
  }
  if (!input.title.trim() && !input.description.trim()) {
    return null;
  }

  try {
    const userContent = JSON.stringify({
      title: input.title,
      description: input.description,
      location: input.location,
      highlights: input.highlights ?? [],
      hostIntro: input.hostIntro ?? "",
      uniqueExperience: input.uniqueExperience ?? "",
    });
    const res = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });
    const content = res.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<SeoSuggestion>;
    if (!parsed.title || !parsed.description) return null;

    return {
      title: parsed.title,
      description: parsed.description,
      highlights: Array.isArray(parsed.highlights)
        ? parsed.highlights.slice(0, 5).map((h) => String(h))
        : [],
      changeNotes: Array.isArray(parsed.changeNotes)
        ? parsed.changeNotes.slice(0, 5).map((n) => String(n))
        : [],
    };
  } catch (err) {
    console.error("[seo-suggest] LLM 실패:", err);
    return null;
  }
}
