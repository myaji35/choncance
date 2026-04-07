// GraphRAG 추천 엔진
// 자연어 쿼리 → 엔티티 추출 → 그래프 탐색 → LLM 재순위

import { prisma } from "../prisma";
import { openai, CHAT_MODEL, embedText, bytesToFloats, cosineSimilarity } from "./openai-client";
import { TAG_SEEDS } from "./tag-taxonomy";

export interface RecommendResult {
  propertyId: string;
  title: string;
  location: string;
  pricePerNight: number | null;
  thumbnailUrl: string | null;
  score: number;
  matchedTags: { name: string; type: string; source: "property" | "review" }[];
  reasoning: string;
}

const ENTITY_SYSTEM_PROMPT = `당신은 한국 촌캉스 숙소 검색어 분석 전문가입니다.
사용자 자연어 쿼리에서 아래 카테고리별 엔티티를 추출하세요.

## 태그 분류 체계
${TAG_SEEDS.map((t) => `${t.slug} (${t.type}: ${t.name})`).join("\n")}

## 추출 규칙
1. 위 slug 목록에 있는 태그만 사용
2. JSON: {"slugs":["...","..."], "regionHint":"지역명 or null"}
3. JSON 외 텍스트 금지`;

async function extractQueryEntities(query: string): Promise<{ slugs: string[]; regionHint: string | null }> {
  try {
    const res = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ENTITY_SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
    });
    const content = res.choices[0]?.message?.content;
    if (!content) return { slugs: [], regionHint: null };
    const parsed = JSON.parse(content) as { slugs?: string[]; regionHint?: string | null };
    const validSlugs = new Set(TAG_SEEDS.map((s) => s.slug));
    return {
      slugs: (parsed.slugs ?? []).filter((s) => validSlugs.has(s)),
      regionHint: parsed.regionHint ?? null,
    };
  } catch (err) {
    console.error("[recommend] 엔티티 추출 실패:", err);
    return { slugs: [], regionHint: null };
  }
}

/** 임베딩 기반 태그 fallback 매칭 (LLM이 놓친 것 보강) */
async function embeddingTagMatch(query: string, topK: number = 10): Promise<string[]> {
  const queryVec = await embedText(query);
  const tags = await prisma.tag.findMany({
    where: { embedding: { not: null } },
  });

  const scored = tags
    .map((t) => {
      if (!t.embedding) return null;
      const tagVec = bytesToFloats(t.embedding);
      return { id: t.id, slug: t.slug, score: cosineSimilarity(queryVec, tagVec) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((x) => x.score > 0.35);

  return scored.map((s) => s.slug);
}

interface Candidate {
  propertyId: string;
  title: string;
  location: string;
  pricePerNight: number | null;
  thumbnailUrl: string | null;
  directMatches: number;
  reviewMatches: number;
  matchedTagIds: Set<string>;
}

async function graphSearch(tagSlugs: string[], regionHint: string | null): Promise<Candidate[]> {
  if (tagSlugs.length === 0) return [];

  const tags = await prisma.tag.findMany({ where: { slug: { in: tagSlugs } } });
  const tagIds = tags.map((t) => t.id);
  if (tagIds.length === 0) return [];

  // 직접 태그 매칭
  const propertyTags = await prisma.propertyTag.findMany({
    where: { tagId: { in: tagIds } },
    include: {
      property: { select: { id: true, title: true, location: true, pricePerNight: true, thumbnailUrl: true, status: true } },
    },
  });

  // 리뷰 태그 매칭 (긍정만)
  const reviewTags = await prisma.reviewTag.findMany({
    where: { tagId: { in: tagIds }, sentiment: "positive" },
    include: { review: { select: { propertyId: true } } },
  });

  const candidateMap = new Map<string, Candidate>();

  for (const pt of propertyTags) {
    if (pt.property.status !== "active") continue;
    const existing = candidateMap.get(pt.propertyId) ?? {
      propertyId: pt.propertyId,
      title: pt.property.title,
      location: pt.property.location,
      pricePerNight: pt.property.pricePerNight,
      thumbnailUrl: pt.property.thumbnailUrl,
      directMatches: 0,
      reviewMatches: 0,
      matchedTagIds: new Set<string>(),
    };
    existing.directMatches += pt.score;
    existing.matchedTagIds.add(pt.tagId);
    candidateMap.set(pt.propertyId, existing);
  }

  for (const rt of reviewTags) {
    const existing = candidateMap.get(rt.review.propertyId);
    if (!existing) continue;
    existing.reviewMatches += 1;
    existing.matchedTagIds.add(rt.tagId);
  }

  let candidates = Array.from(candidateMap.values());

  // 지역 힌트 필터 (있으면 우선, 없으면 통과)
  if (regionHint) {
    const filtered = candidates.filter((c) => c.location.includes(regionHint));
    if (filtered.length > 0) candidates = filtered;
  }

  // 점수 계산 (직접 매칭 x3 + 리뷰 매칭 x2)
  candidates.sort(
    (a, b) => b.directMatches * 3 + b.reviewMatches * 2 - (a.directMatches * 3 + a.reviewMatches * 2)
  );

  return candidates.slice(0, 10);
}

async function rerank(
  query: string,
  candidates: Candidate[]
): Promise<RecommendResult[]> {
  if (candidates.length === 0) return [];

  // Candidate 각각에 태그 정보 풀업
  const enriched = await Promise.all(
    candidates.map(async (c) => {
      const tags = await prisma.tag.findMany({
        where: { id: { in: Array.from(c.matchedTagIds) } },
        select: { name: true, type: true, slug: true },
      });
      return { ...c, tags };
    })
  );

  // LLM이 상위 5개 고르고 설명 생성
  const rerankPrompt = `사용자 쿼리: "${query}"

다음 숙소 후보들 중 쿼리와 가장 잘 맞는 상위 5개를 선택하고, 각각 왜 추천하는지 1~2문장으로 설명하세요.

## 후보
${enriched
  .map(
    (c, i) => `${i + 1}. ${c.title} (${c.location}) — 매칭 태그: ${c.tags.map((t) => t.name).join(", ")}`
  )
  .join("\n")}

## 응답 형식 (JSON)
{
  "results": [
    {"index": 1, "reasoning": "..."},
    ...
  ]
}`;

  try {
    const res = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: rerankPrompt }],
    });
    const content = res.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content) as { results?: { index: number; reasoning: string }[] };
    const results = parsed.results ?? [];

    const mapped: (RecommendResult | null)[] = results.slice(0, 5).map((r) => {
      const c = enriched[r.index - 1];
      if (!c) return null;
      const totalScore = c.directMatches * 3 + c.reviewMatches * 2;
      const result: RecommendResult = {
        propertyId: c.propertyId,
        title: c.title,
        location: c.location,
        pricePerNight: c.pricePerNight,
        thumbnailUrl: c.thumbnailUrl,
        score: Math.min(1, totalScore / 15),
        matchedTags: c.tags.map((t) => ({
          name: t.name,
          type: t.type,
          source: "property" as const,
        })),
        reasoning: r.reasoning,
      };
      return result;
    });
    return mapped.filter((x): x is RecommendResult => x !== null);
  } catch (err) {
    console.error("[recommend] rerank 실패:", err);
    // Fallback: 그래프 점수 기반 상위 5개
    return enriched.slice(0, 5).map((c) => ({
      propertyId: c.propertyId,
      title: c.title,
      location: c.location,
      pricePerNight: c.pricePerNight,
      thumbnailUrl: c.thumbnailUrl,
      score: Math.min(1, (c.directMatches * 3 + c.reviewMatches * 2) / 15),
      matchedTags: c.tags.map((t) => ({
        name: t.name,
        type: t.type,
        source: "property" as const,
      })),
      reasoning: `매칭 태그: ${c.tags.map((t) => t.name).join(", ")}`,
    }));
  }
}

export async function recommend(query: string): Promise<RecommendResult[]> {
  if (!query || query.trim().length < 2) return [];

  // 1. 엔티티 추출
  const { slugs: llmSlugs, regionHint } = await extractQueryEntities(query);

  // 2. 임베딩 fallback
  const embeddingSlugs = await embeddingTagMatch(query);

  // 3. 슬러그 병합
  const allSlugs = Array.from(new Set([...llmSlugs, ...embeddingSlugs]));

  if (allSlugs.length === 0) return [];

  // 4. 그래프 탐색
  const candidates = await graphSearch(allSlugs, regionHint);

  // 5. LLM 재순위
  return rerank(query, candidates);
}
