// LLM 기반 태그 추출 (기존 태그 taxonomy에 매핑)
// 규칙 기반 Pass 1이 놓친 태그를 LLM으로 보강

import { openai, CHAT_MODEL } from "./openai-client";
import { TAG_SEEDS, type TagSeed, type TagType } from "./tag-taxonomy";

export interface ExtractedTag {
  type: TagType;
  slug: string;
  confidence: number;
}

const TAXONOMY_LIST = TAG_SEEDS.map((t) => `${t.slug} (${t.type}: ${t.name})`).join("\n");

const SYSTEM_PROMPT = `당신은 한국 촌캉스 숙소 전문 태그 추출 전문가입니다.
주어진 숙소 설명 텍스트에서 아래 태그 분류 체계에 맞는 태그만 추출하세요.

## 태그 분류 체계
${TAXONOMY_LIST}

## 추출 규칙
1. 위 slug 목록에 있는 태그만 사용 (새로운 태그 생성 금지)
2. 텍스트에 명확한 근거가 있을 때만 선택
3. confidence는 0~1 (명확 1.0, 추론 0.7, 불확실 0.4)
4. 반드시 JSON array로 응답: [{"slug":"...","confidence":0.9}, ...]
5. JSON 외 다른 텍스트 금지`;

export async function extractTagsFromText(text: string): Promise<ExtractedTag[]> {
  if (!text || text.trim().length < 10) return [];

  try {
    const res = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `다음 숙소 텍스트에서 태그를 추출하세요. 결과는 {"tags":[...]} 형태 JSON:\n\n${text}`,
        },
      ],
    });

    const content = res.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content) as { tags?: { slug: string; confidence: number }[] };
    const tags = parsed.tags ?? [];

    // 유효한 slug만 필터
    const slugToSeed = new Map(TAG_SEEDS.map((s) => [s.slug, s]));
    return tags
      .filter((t) => slugToSeed.has(t.slug))
      .map((t) => ({
        slug: t.slug,
        type: slugToSeed.get(t.slug)!.type,
        confidence: Math.max(0, Math.min(1, t.confidence ?? 0.7)),
      }));
  } catch (err) {
    console.error("[llm-tagger] LLM 호출 실패:", err);
    return [];
  }
}

export interface ReviewSentimentTag {
  slug: string;
  sentiment: "positive" | "neutral" | "negative";
}

const REVIEW_SYSTEM_PROMPT = `당신은 숙소 리뷰 감성 분석 전문가입니다.
리뷰에서 언급된 태그와 해당 태그의 감성(긍정/부정/중립)을 추출하세요.

## 태그 분류 체계
${TAXONOMY_LIST}

## 추출 규칙
1. 위 slug 목록에 있는 태그만 사용
2. sentiment는 positive | neutral | negative 중 하나
3. JSON: {"tags":[{"slug":"...","sentiment":"positive"}, ...]}
4. JSON 외 텍스트 금지`;

export async function extractReviewTags(reviewContent: string): Promise<ReviewSentimentTag[]> {
  if (!reviewContent || reviewContent.trim().length < 10) return [];

  try {
    const res = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: REVIEW_SYSTEM_PROMPT },
        { role: "user", content: reviewContent },
      ],
    });

    const content = res.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content) as {
      tags?: { slug: string; sentiment: string }[];
    };
    const tags = parsed.tags ?? [];

    const validSlugs = new Set(TAG_SEEDS.map((s) => s.slug));
    return tags
      .filter((t) => validSlugs.has(t.slug))
      .map((t) => ({
        slug: t.slug,
        sentiment: (["positive", "neutral", "negative"].includes(t.sentiment)
          ? t.sentiment
          : "neutral") as "positive" | "neutral" | "negative",
      }));
  } catch (err) {
    console.error("[llm-tagger] 리뷰 태깅 실패:", err);
    return [];
  }
}
