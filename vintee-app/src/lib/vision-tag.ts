// ISS-039: 이미지 Vision 자동 태깅
// OpenAI Vision API로 사진 분석 → 매칭되는 tag slug 추출
import { openai, CHAT_MODEL } from "./graph-rag/openai-client";
import { TAG_SEEDS } from "./graph-rag/tag-taxonomy";

const TAXONOMY_HINT = TAG_SEEDS.map(
  (t) => `${t.slug} (${t.type}: ${t.name})`
).join("\n");

const SYSTEM_PROMPT = `당신은 한국 시골 숙소(촌캉스) 사진 분석 전문가입니다.
제공된 이미지를 보고, 아래 태그 분류 체계에서 명확하게 보이는 태그만 골라주세요.

## 태그 분류 체계
${TAXONOMY_HINT}

## 추출 규칙
1. 반드시 위 slug 목록에 있는 태그만 사용 (새 태그 생성 금지)
2. 사진에 명확한 시각적 근거가 있을 때만 선택
3. 추론이나 가정으로 추가하지 마세요
4. 응답은 반드시 JSON: {"slugs": ["...", "..."]}
5. 매칭 없으면 빈 배열 반환`;

/**
 * 이미지 URL로부터 자동 태그 추출.
 * OPENAI_API_KEY 미설정 시 빈 배열 (dev fallback).
 */
export async function suggestTagsFromImage(imageUrl: string): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) return [];

  // 로컬 dev 디스크 경로(/uploads/...)는 절대 URL로 변환 (OpenAI는 외부 URL만 받음)
  // 따라서 dev fallback에선 vision 호출 skip
  if (imageUrl.startsWith("/uploads/")) {
    return [];
  }

  try {
    const res = await openai.chat.completions.create({
      model: CHAT_MODEL, // gpt-4o-mini 가정 (vision 가능)
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "이 사진에서 보이는 태그를 추출하세요.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });
    const content = res.choices[0]?.message?.content;
    if (!content) return [];
    const parsed = JSON.parse(content) as { slugs?: string[] };
    const validSlugs = new Set(TAG_SEEDS.map((t) => t.slug));
    return (parsed.slugs ?? []).filter((s) => validSlugs.has(s));
  } catch (err) {
    console.error("[vision-tag] LLM 실패:", err);
    return [];
  }
}
