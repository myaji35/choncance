import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { runCrawlJob } from "@/lib/data-collection";

export const dynamic = "force-dynamic";

// GET /api/admin/crawl-monitor/jobs — 크롤링 작업 이력
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  const where: Record<string, unknown> = {};
  if (source) where.source = source;
  if (status) where.status = status;

  const [jobs, total] = await Promise.all([
    prisma.crawlJobLog.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.crawlJobLog.count({ where }),
  ]);

  return NextResponse.json({
    data: jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/admin/crawl-monitor/jobs — 수집 작업 시작
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json() as { source?: string; region?: string; limit?: number };
    const { source = "all", region, limit = 100 } = body;

    // 현재 실행 중인 작업이 있으면 거부
    const runningJob = await prisma.crawlJobLog.findFirst({
      where: { status: "running" },
      orderBy: { startedAt: "desc" },
    });
    if (runningJob) {
      return NextResponse.json(
        { error: "이미 실행 중인 수집 작업이 있습니다.", jobId: runningJob.id },
        { status: 409 }
      );
    }

    // 비동기 실행 (응답은 즉시 반환, 작업은 백그라운드에서 실행)
    const result = await runCrawlJob({ source: source as "all", region, limit });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err) {
    console.error("[POST /jobs] 오류:", err);
    return NextResponse.json({ error: "수집 작업 시작 실패" }, { status: 500 });
  }
}
