// ISS-026: 호스트 인사이트 분석 함수
// ISS-033: GraphRAG top 쿼리 분석 함수 추가
import { prisma } from "./prisma";

export type ViewSource = "page" | "recommend" | "list";

/** PropertyView를 기록 (실패해도 throw 안 함 — fire-and-forget) */
export async function recordPropertyView(args: {
  propertyId: string;
  source: ViewSource;
  anonId?: string;
}): Promise<void> {
  try {
    await prisma.propertyView.create({
      data: {
        propertyId: args.propertyId,
        source: args.source,
        anonId: args.anonId ?? null,
      },
    });
  } catch (err) {
    // 분석 데이터는 critical path 아님 — 로그만
    console.error("[analytics] view record failed:", err);
  }
}

export interface PropertyInsight {
  propertyId: string;
  title: string;
  totalViews30d: number;
  viewsByDay: { date: string; count: number }[];
  bySource: { page: number; recommend: number; list: number };
  totalBookings: number;
  conversionRate: number; // bookings / views (%)
  avgRating: number;
  reviewCount: number;
  geoScoreHint: string;
}

/**
 * ISS-033: 호스트 ID 기준 최근 30일간 자기 숙소가 매칭된 top 쿼리
 * 동일 쿼리가 여러 숙소에서 나오면 등장 횟수로 집계
 */
export async function getHostTopQueries(
  hostId: string,
  limit = 5
): Promise<{ query: string; count: number; bestRank: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const myProps = await prisma.property.findMany({
    where: { hostId },
    select: { id: true },
  });
  if (myProps.length === 0) return [];
  const propertyIds = myProps.map((p) => p.id);

  const logs = await prisma.recommendLog.findMany({
    where: {
      propertyId: { in: propertyIds },
      createdAt: { gte: since },
    },
    select: { query: true, rank: true },
  });

  const map = new Map<string, { count: number; bestRank: number }>();
  for (const l of logs) {
    const e = map.get(l.query) ?? { count: 0, bestRank: 999 };
    e.count += 1;
    if (l.rank < e.bestRank) e.bestRank = l.rank;
    map.set(l.query, e);
  }
  return Array.from(map.entries())
    .map(([query, v]) => ({ query, count: v.count, bestRank: v.bestRank }))
    .sort((a, b) => b.count - a.count || a.bestRank - b.bestRank)
    .slice(0, limit);
}

/** 호스트 ID로 자기 숙소들의 30일 인사이트 한 번에 집계 */
export async function getHostInsights(hostId: string): Promise<PropertyInsight[]> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const properties = await prisma.property.findMany({
    where: { hostId },
    select: {
      id: true,
      title: true,
      hostIntro: true,
      description: true,
    },
  });
  if (properties.length === 0) return [];

  const propertyIds = properties.map((p) => p.id);

  const [views, bookings, reviews] = await Promise.all([
    prisma.propertyView.findMany({
      where: {
        propertyId: { in: propertyIds },
        viewedAt: { gte: since },
      },
      select: { propertyId: true, source: true, viewedAt: true },
    }),
    prisma.booking.groupBy({
      by: ["propertyId"],
      where: {
        propertyId: { in: propertyIds },
        createdAt: { gte: since },
      },
      _count: { _all: true },
    }),
    prisma.review.groupBy({
      by: ["propertyId"],
      where: { propertyId: { in: propertyIds } },
      _count: { _all: true },
      _avg: { rating: true },
    }),
  ]);

  const bookingMap = new Map(bookings.map((b) => [b.propertyId, b._count._all]));
  const reviewMap = new Map(
    reviews.map((r) => [r.propertyId, { count: r._count._all, avg: r._avg.rating ?? 0 }])
  );

  return properties.map((p) => {
    const myViews = views.filter((v) => v.propertyId === p.id);
    const bySource = { page: 0, recommend: 0, list: 0 };
    const dayMap = new Map<string, number>();
    for (const v of myViews) {
      if (v.source === "page" || v.source === "recommend" || v.source === "list") {
        bySource[v.source as ViewSource] += 1;
      }
      const day = v.viewedAt.toISOString().slice(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
    }
    // 최근 14일치를 0으로 채워서 sparkline 일관성 유지
    const viewsByDay: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      viewsByDay.push({ date: key, count: dayMap.get(key) ?? 0 });
    }
    const totalViews30d = myViews.length;
    const totalBookings = bookingMap.get(p.id) ?? 0;
    const conversionRate =
      totalViews30d > 0 ? Math.round((totalBookings / totalViews30d) * 1000) / 10 : 0;
    const reviewInfo = reviewMap.get(p.id) ?? { count: 0, avg: 0 };

    // 간단 코칭 힌트
    let hint = "꾸준히 운영 중이에요";
    if (totalViews30d === 0) {
      hint = "노출이 아직 없어요. 사진과 호스트 소개를 보강해보세요.";
    } else if (conversionRate < 1) {
      hint = "노출은 있지만 예약 전환이 낮아요. 가격과 사진을 점검해보세요.";
    } else if (bySource.recommend === 0 && totalViews30d > 0) {
      hint = "AI 추천 노출이 없어요. 태그(highlights)와 호스트 한마디를 더 풍성하게.";
    } else if (reviewInfo.avg >= 4.5) {
      hint = "리뷰가 훌륭해요! GraphRAG 점수가 자동으로 올라가고 있습니다.";
    }

    return {
      propertyId: p.id,
      title: p.title,
      totalViews30d,
      viewsByDay,
      bySource,
      totalBookings,
      conversionRate,
      avgRating: reviewInfo.avg,
      reviewCount: reviewInfo.count,
      geoScoreHint: hint,
    };
  });
}
