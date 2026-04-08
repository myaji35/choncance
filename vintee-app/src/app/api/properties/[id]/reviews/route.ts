import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskName } from "@/lib/utils/review";

// ISS-038: 요일/계절 분류 헬퍼
function monthToSeason(month: number): "spring" | "summer" | "autumn" | "winter" {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

// GET /api/properties/[id]/reviews?dayType=weekday|weekend&season=spring|summer|autumn|winter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "10")));
  const dayTypeParam = searchParams.get("dayType");
  const seasonParam = searchParams.get("season");
  const skip = (page - 1) * limit;

  // ISS-038: 시간 필터는 application-level (모든 리뷰 로드 후 메모리 필터)
  const allReviews = await prisma.review.findMany({
    where: { propertyId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const dayType: "weekday" | "weekend" | null =
    dayTypeParam === "weekday" || dayTypeParam === "weekend" ? dayTypeParam : null;
  const season: "spring" | "summer" | "autumn" | "winter" | null =
    seasonParam === "spring" || seasonParam === "summer" ||
    seasonParam === "autumn" || seasonParam === "winter"
      ? seasonParam
      : null;

  const filtered = allReviews.filter((r) => {
    const d = r.createdAt;
    if (dayType) {
      const day = d.getDay();
      const isWeekend = day === 0 || day === 6 || day === 5;
      if (dayType === "weekend" && !isWeekend) return false;
      if (dayType === "weekday" && isWeekend) return false;
    }
    if (season) {
      if (monthToSeason(d.getMonth() + 1) !== season) return false;
    }
    return true;
  });

  const total = filtered.length;
  const pageReviews = filtered.slice(skip, skip + limit);
  const avgRating =
    filtered.length > 0
      ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length
      : 0;

  // 분포 (전체 리뷰 기준 — UI에 "주말 N개 / 평일 M개")
  const distribution = {
    weekday: 0, weekend: 0,
    spring: 0, summer: 0, autumn: 0, winter: 0,
  };
  for (const r of allReviews) {
    const day = r.createdAt.getDay();
    if (day === 0 || day === 6 || day === 5) distribution.weekend += 1;
    else distribution.weekday += 1;
    distribution[monthToSeason(r.createdAt.getMonth() + 1)] += 1;
  }

  return Response.json({
    reviews: pageReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      guestName: maskName(r.user.name),
      createdAt: r.createdAt,
      hostReply: r.hostReply,
      repliedAt: r.repliedAt,
    })),
    pagination: {
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    },
    summary: {
      avgRating,
      totalCount: total,
      distribution,
      filters: { dayType, season },
    },
  });
}
