import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/intelligence — 인텔리전스 목록 조회
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ADMIN 권한 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || undefined;
  const minScore = searchParams.get("min_score") ? parseFloat(searchParams.get("min_score")!) : undefined;
  const maxScore = searchParams.get("max_score") ? parseFloat(searchParams.get("max_score")!) : undefined;
  const isRecruited = searchParams.get("is_recruited");
  const search = searchParams.get("search") || undefined;
  const sort = searchParams.get("sort") || "vinteeScore";
  const order = (searchParams.get("order") || "desc") as "asc" | "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const tagsParam = searchParams.getAll("tags");

  const where: Record<string, unknown> = {};
  if (region) where.region = region;
  if (isRecruited !== null && isRecruited !== undefined) {
    where.isRecruited = isRecruited === "true";
  }
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (minScore !== undefined || maxScore !== undefined) {
    where.vinteeScore = {
      ...(minScore !== undefined && { gte: minScore }),
      ...(maxScore !== undefined && { lte: maxScore }),
    };
  }
  if (tagsParam.length > 0) {
    where.autoTags = { hasSome: tagsParam };
  }

  const [data, total] = await Promise.all([
    prisma.propertyIntelligence.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        region: true,
        subregion: true,
        vinteeScore: true,
        totalReviews: true,
        autoTags: true,
        isRecruited: true,
        phone: true,
        thumbnailUrl: true,
        updatedAt: true,
      },
    }),
    prisma.propertyIntelligence.count({ where }),
  ]);

  // KPI 통계
  const [highScoreCount, recruitedCount] = await Promise.all([
    prisma.propertyIntelligence.count({ where: { vinteeScore: { gte: 4.0 } } }),
    prisma.propertyIntelligence.count({ where: { isRecruited: true } }),
  ]);

  // 마지막 크롤링 시각
  const lastJob = await prisma.crawlJobLog.findFirst({
    where: { status: "completed" },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      totalCount: total,
      highScoreCount,
      recruitedCount,
      lastCrawledAt: lastJob?.completedAt ?? null,
    },
  });
}
