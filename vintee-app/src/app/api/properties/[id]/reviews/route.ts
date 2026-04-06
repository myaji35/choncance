import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskName } from "@/lib/utils/review";

// GET /api/properties/[id]/reviews — 숙소별 리뷰 목록
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "10")));
  const skip = (page - 1) * limit;

  const where = { propertyId };

  const [reviews, total, agg] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { user: { select: { name: true } } },
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
      avgRating: agg._avg.rating ?? 0,
      totalCount: total,
    },
  });
}
