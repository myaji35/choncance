import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations/review";

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

  return Response.json(
    { message: "리뷰가 등록되었습니다", review },
    { status: 201 }
  );
}

// GET /api/reviews?propertyId=...&page=1&limit=10 — 리뷰 목록 조회
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const propertyId = searchParams.get("propertyId");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "10")));
  const skip = (page - 1) * limit;

  const where = propertyId ? { propertyId } : {};

  const [reviews, total, agg] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true } },
        property: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({
      where,
      _avg: { rating: true },
    }),
  ]);

  return Response.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      guestName: r.user.name,
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
      avgRating: agg._avg.rating ?? 0,
      totalCount: total,
    },
  });
}
