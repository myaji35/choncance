import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations/review";
import { maskName } from "@/lib/utils/review";
import { sendEmail, tplNewReviewToHost } from "@/lib/email";

// POST /api/reviews — 리뷰 작성
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "유효성 검사 실패" },
      { status: 400 }
    );
  }

  const { bookingId, rating, content, snsShareConsent } = parsed.data;

  // 예약 조회 + 소유권 확인
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });

  if (!booking) {
    return Response.json({ error: "예약을 찾을 수 없습니다" }, { status: 404 });
  }

  if (booking.userId !== user.id) {
    return Response.json(
      { error: "본인의 예약만 리뷰할 수 있습니다" },
      { status: 403 }
    );
  }

  if (booking.status !== "COMPLETED") {
    return Response.json(
      { error: "완료된 예약만 리뷰할 수 있습니다" },
      { status: 422 }
    );
  }

  if (new Date(booking.checkOut) > new Date()) {
    return Response.json(
      { error: "체크아웃 후에 리뷰를 작성할 수 있습니다" },
      { status: 422 }
    );
  }

  if (booking.review) {
    return Response.json(
      { error: "이미 리뷰를 작성하셨습니다" },
      { status: 409 }
    );
  }

  // 리뷰 생성 + SNS 크레딧 트랜잭션
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        bookingId,
        userId: user.id,
        propertyId: booking.propertyId,
        rating,
        content,
        snsShareConsent: snsShareConsent ?? false,
      },
    });

    // SNS 공유 동의 시 1000 크레딧 지급
    if (snsShareConsent) {
      await tx.creditHistory.create({
        data: {
          userId: user.id,
          type: "EARNED_REVIEW_SNS",
          amount: 1000,
          memo: `리뷰 SNS 공유 동의 크레딧 (리뷰 ID: ${created.id})`,
        },
      });
      await tx.review.update({
        where: { id: created.id },
        data: { creditAwarded: true },
      });
    }

    return created;
  });

  // ISS-023: 호스트에게 새 리뷰 알림
  try {
    const property = await prisma.property.findUnique({
      where: { id: booking.propertyId },
      select: { title: true, host: { select: { email: true, name: true } } },
    });
    if (property?.host?.email) {
      const tpl = tplNewReviewToHost({
        hostName: property.host.name ?? "호스트",
        propertyTitle: property.title,
        rating,
        guestName: maskName(user.name ?? "게스트"),
        contentPreview: content.slice(0, 80),
      });
      await sendEmail({
        to: property.host.email,
        subject: tpl.subject,
        html: tpl.html,
      });
    }
  } catch (err) {
    console.error("[review] host notification failed:", err);
  }

  return Response.json(
    { message: "리뷰가 등록되었습니다", review },
    { status: 201 }
  );
}

// GET /api/reviews?propertyId=...&page=1&limit=10&dayType=weekend&season=spring
// ISS-038: 요일(weekday/weekend) + 계절(spring/summer/autumn/winter) 필터
function monthToSeason(month: number): "spring" | "summer" | "autumn" | "winter" {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const propertyId = searchParams.get("propertyId");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "10")));
  const dayTypeParam = searchParams.get("dayType");
  const seasonParam = searchParams.get("season");
  const skip = (page - 1) * limit;

  const where = propertyId ? { propertyId } : {};

  // ISS-038: 시간 필터는 application-level (sqlite는 strftime 가능하지만 prisma 호환 위해 메모리 필터)
  const allReviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { name: true } },
      property: { select: { title: true } },
    },
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

  // 평균 평점 (필터된 결과 기준)
  const avgRating =
    filtered.length > 0
      ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length
      : 0;

  // ISS-038: 분포 데이터 (어떤 요일/계절이 많은지)
  const distribution = {
    weekday: 0,
    weekend: 0,
    spring: 0,
    summer: 0,
    autumn: 0,
    winter: 0,
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
      propertyTitle: r.property.title,
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
