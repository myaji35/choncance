// GraphRAG 추천 엔진
// 자연어 쿼리 → 엔티티 추출 → 그래프 탐색 → LLM 재순위

import { prisma } from "../prisma";
import { openai, CHAT_MODEL, embedText, bytesToFloats, cosineSimilarity } from "./openai-client";
import { TAG_SEEDS } from "./tag-taxonomy";

// ISS-013: 추천 신뢰도 임계치 — top score가 이 값 미만이면 빈 결과 반환
// (ISS-034 lexical-only 후보가 단일 hit로 통과 가능하도록 0.13으로 낮춤.
//  무의미 쿼리는 candidates.length === 0으로 별도 차단됨)
const MIN_RECOMMEND_SCORE = 0.13;

// ISS-031: 멀티 시그널 가중치
const W_DIRECT = 3;       // 태그 직접 매칭
const W_REVIEW = 2;       // 리뷰 감성 매칭
const W_ATTRACTION = 1.5; // 근처 명소 매칭
const SEASON_BOOST = 1.3; // 현재 계절 부스팅 (ISS-029)
const W_LEXICAL = 3;      // ISS-034: lexical 매칭 (고유명사 강매칭)

// ISS-034: 한국어 친화 토큰화 — 공백 + 조사/특수문자 제거
const STOPWORDS = new Set([
  "은", "는", "이", "가", "을", "를", "의", "에", "에서", "으로", "와", "과",
  "도", "랑", "이랑", "and", "or", "the", "a", "in", "at", "to",
  "있는", "있어", "좋은", "좋아", "할", "수", "곳",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    // 1. 특수문자 → 공백
    .replace(/[^\w가-힣\s]/g, " ")
    // 2. 한글과 영숫자 경계에 공백 삽입 (예: "통영123" → "통영 123")
    .replace(/([가-힣])([a-z0-9])/gi, "$1 $2")
    .replace(/([a-z0-9])([가-힣])/gi, "$1 $2")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

// ISS-029: 현재 월 → season slug
function getCurrentSeasonSlug(): string {
  const m = new Date().getMonth() + 1; // 1~12
  if (m >= 3 && m <= 5) return "season-spring";
  if (m >= 6 && m <= 8) return "season-summer";
  if (m >= 9 && m <= 11) return "season-autumn";
  return "season-winter";
}

// ISS-014: 풍경 키워드 hard filter — 명시 시 location/title에 매칭되어야만 후보 인정
// taxonomy에 별도 scenery type이 없어서 키워드 기반 보강
const SCENERY_KEYWORDS = [
  { kw: "바다", required: ["바다", "해변", "해수욕", "포구", "섬", "통영", "여수", "강릉", "속초", "양양", "동해", "남해", "서해", "제주", "고성"] },
  { kw: "계곡", required: ["계곡", "협곡"] },
  { kw: "산", required: ["산", "봉", "령", "악", "고개", "강원", "평창", "정선", "지리", "설악"] },
  { kw: "호수", required: ["호수", "댐", "저수지"] },
  { kw: "논", required: ["논", "들녘", "평야"] },
  { kw: "숲", required: ["숲", "수목원", "삼림"] },
];

function detectSceneryHardFilter(query: string): string[][] {
  const filters: string[][] = [];
  for (const s of SCENERY_KEYWORDS) {
    if (query.includes(s.kw)) {
      filters.push(s.required);
    }
  }
  return filters;
}

export interface RecommendResult {
  propertyId: string;
  title: string;
  location: string;
  pricePerNight: number | null;
  thumbnailUrl: string | null;
  score: number;
  matchedTags: { name: string; type: string; source: "property" | "review" | "attraction" }[];
  reasoning: string;
  // ISS-029: 현재 계절 부스팅 여부 (UI에서 ⭐ 표시 가능)
  seasonBoosted?: boolean;
  // ISS-030: 근처 명소 (UI에서 별도 표시)
  nearbyAttractions?: { name: string; category: string | null }[];
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

/**
 * ISS-034: BM25-style lexical 검색
 * tagSlug로 못 잡는 고유명사(예: "아산온천", "통영", 호스트명)를 직접 매칭
 * 모든 active property를 메모리에 로드 (5천건 미만일 때 안전)
 */
async function lexicalSearch(
  query: string
): Promise<Map<string, number>> {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return new Map();

  const properties = await prisma.property.findMany({
    where: { status: "active" },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      hostIntro: true,
      uniqueExperience: true,
    },
  });

  const map = new Map<string, number>();
  for (const p of properties) {
    const haystack = [
      p.title,
      p.description ?? "",
      p.location,
      p.hostIntro ?? "",
      p.uniqueExperience ?? "",
    ]
      .join(" ")
      .toLowerCase();
    let hits = 0;
    for (const tok of queryTokens) {
      if (haystack.includes(tok)) hits += 1;
    }
    if (hits > 0) map.set(p.id, hits);
  }
  return map;
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
  attractionMatches: number; // ISS-030/031
  hasCurrentSeason: boolean; // ISS-029
  lexicalMatches: number;    // ISS-034: BM25-style 토큰 매칭 횟수
  // ISS-031: source별 분리
  directTagIds: Set<string>;
  reviewTagIds: Set<string>;
  attractions: { name: string; category: string | null }[];
}

function scoreOf(c: Candidate): number {
  let s =
    c.directMatches * W_DIRECT +
    c.reviewMatches * W_REVIEW +
    c.attractionMatches * W_ATTRACTION +
    c.lexicalMatches * W_LEXICAL; // ISS-034
  if (c.hasCurrentSeason) s *= SEASON_BOOST;
  return s;
}

async function graphSearch(
  tagSlugs: string[],
  regionHint: string | null,
  sceneryFilters: string[][] = []
): Promise<Candidate[]> {
  if (tagSlugs.length === 0) return [];

  const tags = await prisma.tag.findMany({ where: { slug: { in: tagSlugs } } });
  const tagIds = tags.map((t) => t.id);
  if (tagIds.length === 0) return [];

  // ISS-029: 현재 계절 태그 ID 조회
  const currentSeasonSlug = getCurrentSeasonSlug();
  const seasonTag = await prisma.tag.findFirst({
    where: { slug: currentSeasonSlug },
    select: { id: true },
  });
  const currentSeasonTagId = seasonTag?.id ?? null;

  // 직접 태그 매칭
  const propertyTags = await prisma.propertyTag.findMany({
    where: { tagId: { in: tagIds } },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          pricePerNight: true,
          thumbnailUrl: true,
          status: true,
        },
      },
    },
  });

  // 리뷰 태그 매칭 (긍정만)
  const reviewTags = await prisma.reviewTag.findMany({
    where: { tagId: { in: tagIds }, sentiment: "positive" },
    include: { review: { select: { propertyId: true } } },
  });

  const candidateMap = new Map<string, Candidate>();
  const newCand = (
    propertyId: string,
    title: string,
    location: string,
    pricePerNight: number | null,
    thumbnailUrl: string | null
  ): Candidate => ({
    propertyId,
    title,
    location,
    pricePerNight,
    thumbnailUrl,
    directMatches: 0,
    reviewMatches: 0,
    attractionMatches: 0,
    hasCurrentSeason: false,
    lexicalMatches: 0,
    directTagIds: new Set<string>(),
    reviewTagIds: new Set<string>(),
    attractions: [],
  });

  for (const pt of propertyTags) {
    if (pt.property.status !== "active") continue;
    const existing =
      candidateMap.get(pt.propertyId) ??
      newCand(
        pt.propertyId,
        pt.property.title,
        pt.property.location,
        pt.property.pricePerNight,
        pt.property.thumbnailUrl
      );
    existing.directMatches += pt.score;
    existing.directTagIds.add(pt.tagId);
    candidateMap.set(pt.propertyId, existing);
  }

  for (const rt of reviewTags) {
    const existing = candidateMap.get(rt.review.propertyId);
    if (!existing) continue;
    existing.reviewMatches += 1;
    existing.reviewTagIds.add(rt.tagId);
  }

  // ISS-030: 후보 숙소들의 attraction 정보 풀업
  const candidatePropertyIds = Array.from(candidateMap.keys());
  if (candidatePropertyIds.length > 0) {
    const propAttractions = await prisma.propertyAttraction.findMany({
      where: { propertyId: { in: candidatePropertyIds } },
      include: { attraction: { select: { name: true, category: true } } },
    });
    for (const pa of propAttractions) {
      const c = candidateMap.get(pa.propertyId);
      if (!c) continue;
      c.attractionMatches += 1;
      c.attractions.push({
        name: pa.attraction.name,
        category: pa.attraction.category,
      });
    }
  }

  // ISS-029: 현재 계절 태그 보유 여부 마킹
  if (currentSeasonTagId && candidatePropertyIds.length > 0) {
    const seasonHits = await prisma.propertyTag.findMany({
      where: {
        tagId: currentSeasonTagId,
        propertyId: { in: candidatePropertyIds },
      },
      select: { propertyId: true },
    });
    for (const h of seasonHits) {
      const c = candidateMap.get(h.propertyId);
      if (c) c.hasCurrentSeason = true;
    }
  }

  let candidates = Array.from(candidateMap.values());

  // 지역 힌트 필터
  if (regionHint) {
    const filtered = candidates.filter((c) => c.location.includes(regionHint));
    if (filtered.length > 0) candidates = filtered;
  }

  // ISS-014: 풍경 hard filter
  for (const required of sceneryFilters) {
    candidates = candidates.filter((c) => {
      const haystack = `${c.location} ${c.title}`;
      return required.some((kw) => haystack.includes(kw));
    });
  }

  // ISS-031: 멀티 시그널 점수 정렬
  candidates.sort((a, b) => scoreOf(b) - scoreOf(a));

  return candidates.slice(0, 10);
}

// ISS-031: 정규화 점수 계산 (멀티 시그널 합 / 임의 max 20)
function normalizedScore(c: Candidate): number {
  return Math.min(1, scoreOf(c) / 20);
}

// ISS-032: graph evidence 기반 자연어 reasoning 자동 합성
function synthesizeReasoning(args: {
  directNames: string[];
  reviewNames: string[];
  attractionNames: string[];
  seasonBoosted: boolean;
}): string {
  const parts: string[] = [];
  if (args.directNames.length > 0) {
    parts.push(`${args.directNames.slice(0, 3).join(", ")} 분위기에 잘 어울려요`);
  }
  if (args.reviewNames.length > 0) {
    parts.push(
      `다녀온 분들이 ${args.reviewNames.slice(0, 2).join(", ")}을(를) 칭찬했어요`
    );
  }
  if (args.attractionNames.length > 0) {
    parts.push(`근처에 ${args.attractionNames.slice(0, 2).join(", ")}이(가) 있어요`);
  }
  if (args.seasonBoosted) {
    parts.push("지금 이 계절에 특히 잘 맞아요");
  }
  return parts.join(". ") || "쿼리와 어울리는 숙소예요";
}

async function rerank(
  query: string,
  candidates: Candidate[]
): Promise<RecommendResult[]> {
  if (candidates.length === 0) return [];

  // Candidate 각각에 태그 메타 풀업 (direct + review 분리)
  const enriched = await Promise.all(
    candidates.map(async (c) => {
      const allTagIds = Array.from(
        new Set([...c.directTagIds, ...c.reviewTagIds])
      );
      const tags =
        allTagIds.length > 0
          ? await prisma.tag.findMany({
              where: { id: { in: allTagIds } },
              select: { id: true, name: true, type: true, slug: true },
            })
          : [];
      const tagById = new Map(tags.map((t) => [t.id, t]));
      const directTags = Array.from(c.directTagIds)
        .map((id) => tagById.get(id))
        .filter((t): t is NonNullable<typeof t> => !!t);
      const reviewTags = Array.from(c.reviewTagIds)
        .map((id) => tagById.get(id))
        .filter((t): t is NonNullable<typeof t> => !!t);
      return { ...c, directTags, reviewTags };
    })
  );

  // ISS-031: source별로 분리된 matchedTags 합성
  const buildMatchedTags = (
    e: (typeof enriched)[number]
  ): RecommendResult["matchedTags"] => [
    ...e.directTags.map((t) => ({
      name: t.name,
      type: t.type,
      source: "property" as const,
    })),
    ...e.reviewTags
      .filter((t) => !e.directTags.some((d) => d.id === t.id))
      .map((t) => ({
        name: t.name,
        type: t.type,
        source: "review" as const,
      })),
    ...e.attractions.slice(0, 3).map((a) => ({
      name: a.name,
      type: a.category ?? "attraction",
      source: "attraction" as const,
    })),
  ];

  // ISS-032: fallback reasoning 미리 준비 (LLM 실패 시 사용)
  const fallbackResult = (e: (typeof enriched)[number]): RecommendResult => ({
    propertyId: e.propertyId,
    title: e.title,
    location: e.location,
    pricePerNight: e.pricePerNight,
    thumbnailUrl: e.thumbnailUrl,
    score: normalizedScore(e),
    matchedTags: buildMatchedTags(e),
    reasoning: synthesizeReasoning({
      directNames: e.directTags.map((t) => t.name),
      reviewNames: e.reviewTags.map((t) => t.name),
      attractionNames: e.attractions.map((a) => a.name),
      seasonBoosted: e.hasCurrentSeason,
    }),
    seasonBoosted: e.hasCurrentSeason,
    nearbyAttractions: e.attractions.slice(0, 3),
  });

  // ISS-030: LLM rerank prompt에 attraction + season 정보 포함
  const rerankPrompt = `사용자 쿼리: "${query}"

다음 숙소 후보들 중 쿼리와 가장 잘 맞는 상위 5개를 선택하고, 각각 왜 추천하는지 1~2문장으로 설명하세요.
설명에는 가능하면 (1) 매칭된 태그/분위기, (2) 근처 명소, (3) 다녀온 분들의 후기 키워드 중 하나 이상을 자연스럽게 포함해주세요.

## 후보
${enriched
  .map((c, i) => {
    const tagStr = c.directTags.map((t) => t.name).join(", ");
    const reviewStr =
      c.reviewTags.length > 0
        ? ` · 후기 칭찬: ${c.reviewTags.map((t) => t.name).slice(0, 3).join(", ")}`
        : "";
    const attrStr =
      c.attractions.length > 0
        ? ` · 근처: ${c.attractions.map((a) => a.name).slice(0, 3).join(", ")}`
        : "";
    const seasonStr = c.hasCurrentSeason ? " · 현재 계절에 잘 맞음" : "";
    return `${i + 1}. ${c.title} (${c.location}) — 태그: ${tagStr}${reviewStr}${attrStr}${seasonStr}`;
  })
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
    if (!content) return enriched.slice(0, 5).map(fallbackResult);

    const parsed = JSON.parse(content) as {
      results?: { index: number; reasoning: string }[];
    };
    const llmResults = parsed.results ?? [];

    const mapped: (RecommendResult | null)[] = llmResults.slice(0, 5).map((r) => {
      const e = enriched[r.index - 1];
      if (!e) return null;
      return {
        ...fallbackResult(e),
        reasoning: r.reasoning || fallbackResult(e).reasoning,
      };
    });
    const filtered = mapped.filter((x): x is RecommendResult => x !== null);
    return filtered.length > 0 ? filtered : enriched.slice(0, 5).map(fallbackResult);
  } catch (err) {
    console.error("[recommend] rerank 실패:", err);
    return enriched.slice(0, 5).map(fallbackResult);
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

  // 4. 풍경 hard filter 감지 (ISS-014)
  const sceneryFilters = detectSceneryHardFilter(query);

  // 5. ISS-034: 그래프 탐색 + lexical 검색 병렬
  const [graphCandidates, lexicalMap] = await Promise.all([
    allSlugs.length > 0
      ? graphSearch(allSlugs, regionHint, sceneryFilters)
      : Promise.resolve([] as Candidate[]),
    lexicalSearch(query),
  ]);

  // 6. lexical-only 후보 (graph에 없는 propertyId만 추가)
  const candidateMap = new Map<string, Candidate>();
  for (const c of graphCandidates) {
    candidateMap.set(c.propertyId, c);
    // 기존 후보에도 lexical hit 합산
    const lexHit = lexicalMap.get(c.propertyId) ?? 0;
    if (lexHit > 0) c.lexicalMatches = lexHit;
  }
  // graph에 없지만 lexical에 매칭된 후보 보강
  const lexicalOnlyIds = Array.from(lexicalMap.keys()).filter(
    (id) => !candidateMap.has(id)
  );
  if (lexicalOnlyIds.length > 0) {
    const lexicalProps = await prisma.property.findMany({
      where: { id: { in: lexicalOnlyIds }, status: "active" },
      select: {
        id: true,
        title: true,
        location: true,
        pricePerNight: true,
        thumbnailUrl: true,
      },
    });
    for (const p of lexicalProps) {
      // 풍경 hard filter 통과 검사
      const haystack = `${p.location} ${p.title}`;
      const passes = sceneryFilters.every((req) =>
        req.some((kw) => haystack.includes(kw))
      );
      if (!passes) continue;
      // regionHint 검사
      if (regionHint && !p.location.includes(regionHint)) continue;
      candidateMap.set(p.id, {
        propertyId: p.id,
        title: p.title,
        location: p.location,
        pricePerNight: p.pricePerNight,
        thumbnailUrl: p.thumbnailUrl,
        directMatches: 0,
        reviewMatches: 0,
        attractionMatches: 0,
        hasCurrentSeason: false,
        lexicalMatches: lexicalMap.get(p.id) ?? 0,
        directTagIds: new Set(),
        reviewTagIds: new Set(),
        attractions: [],
      });
    }
  }

  const merged = Array.from(candidateMap.values()).sort(
    (a, b) => scoreOf(b) - scoreOf(a)
  );
  if (merged.length === 0) return [];

  // 7. LLM 재순위
  const results = await rerank(query, merged.slice(0, 10));

  // 8. ISS-013: 신뢰도 임계치
  const topScore = results[0]?.score ?? 0;
  if (topScore < MIN_RECOMMEND_SCORE) return [];

  return results;
}
