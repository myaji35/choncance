import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/crawl-monitor — 크롤링 모니터 종합 현황
export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalIntelligence,
    highScoreCount,
    recruitedCount,
    lastJob,
    recentJobs,
    sourceStats,
  ] = await Promise.all([
    prisma.propertyIntelligence.count(),
    prisma.propertyIntelligence.count({ where: { vinteeScore: { gte: 4.0 } } }),
    prisma.propertyIntelligence.count({ where: { isRecruited: true } }),
    prisma.crawlJobLog.findFirst({
      where: { status: "completed" },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true, totalCrawled: true, newProperties: true },
    }),
    prisma.crawlJobLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
      select: {
        id: true,
        source: true,
        region: true,
        status: true,
        totalCrawled: true,
        newProperties: true,
        updatedProperties: true,
        errorCount: true,
        startedAt: true,
        completedAt: true,
        durationSeconds: true,
      },
    }),
    // 소스별 수집 건수
    prisma.propertyIntelligence.groupBy({
      by: ["region"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  // 진행 중인 작업
  const runningJobs = await prisma.crawlJobLog.findMany({
    where: { status: "running" },
    select: {
      id: true,
      source: true,
      region: true,
      startedAt: true,
    },
  });

  return NextResponse.json({
    summary: {
      totalIntelligence,
      highScoreCount,
      recruitedCount,
      lastCrawledAt: lastJob?.completedAt ?? null,
      lastBatchTotal: lastJob?.totalCrawled ?? 0,
      lastBatchNew: lastJob?.newProperties ?? 0,
      runningJobsCount: runningJobs.length,
    },
    recentJobs,
    runningJobs,
    regionDistribution: sourceStats.map((s) => ({
      region: s.region,
      count: s._count.id,
    })),
  });
}
