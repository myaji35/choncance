import { NextRequest } from "next/server";
import { recommend } from "@/lib/graph-rag/recommend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getRecommendCache, setRecommendCache } from "@/lib/recommend-cache";
import { recordPropertyView } from "@/lib/analytics";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(2).max(200),
});

export async function GET(request: NextRequest) {
  // ISS-020: Rate limit — IP 기준 30 req/min
  const ip = getClientIp(request);
  const rl = rateLimit(`recommend:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const raw = request.nextUrl.searchParams.get("q");
  const parsed = querySchema.safeParse({ q: raw });
  if (!parsed.success) {
    return Response.json({ error: "쿼리가 필요합니다 (2~200자)" }, { status: 400 });
  }

  // ISS-021: 캐시 조회
  const cached = getRecommendCache(parsed.data.q);
  if (cached) {
    return Response.json(
      { query: parsed.data.q, results: cached, cached: true },
      { headers: { "X-Cache": "HIT" } }
    );
  }

  try {
    const results = await recommend(parsed.data.q);
    setRecommendCache(parsed.data.q, results);

    // ISS-026: 각 추천 결과를 'recommend' source로 기록
    // (캐시 HIT는 기록 안 함 — 동일 쿼리 반복 inflation 방지)
    for (const r of results) {
      recordPropertyView({ propertyId: r.propertyId, source: "recommend" }).catch(() => {});
    }

    // ISS-033: RecommendLog 기록 (호스트 인사이트의 top 쿼리 분석용)
    const { prisma: prismaClient } = await import("@/lib/prisma");
    Promise.all(
      results.map((r, idx) =>
        prismaClient.recommendLog.create({
          data: {
            query: parsed.data.q,
            propertyId: r.propertyId,
            rank: idx + 1,
            score: r.score,
          },
        })
      )
    ).catch((err) => console.error("[recommend-log]", err));

    return Response.json(
      { query: parsed.data.q, results },
      { headers: { "X-Cache": "MISS" } }
    );
  } catch (err) {
    console.error("[/api/recommend]", err);
    return Response.json({ error: "추천 엔진 오류" }, { status: 500 });
  }
}
