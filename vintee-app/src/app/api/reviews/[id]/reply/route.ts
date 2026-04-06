import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hostReplySchema } from "@/lib/validations/review";

// POST /api/reviews/[id]/reply — 호스트 답글 등록
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reviewId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = hostReplySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "유효성 검사 실패" },
      { status: 400 }
    );
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      property: { select: { hostId: true } },
    },
  });

  if (!review) {
    return Response.json({ error: "리뷰를 찾을 수 없습니다" }, { status: 404 });
  }

  // 호스트 소유권 확인
  if (review.property.hostId !== user.id) {
    return Response.json(
      { error: "본인 숙소의 리뷰에만 답글을 작성할 수 있습니다" },
      { status: 403 }
    );
  }

  // 중복 답글 방지
  if (review.hostReply) {
    return Response.json(
      { error: "이미 답글을 작성하셨습니다" },
      { status: 409 }
    );
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      hostReply: parsed.data.content,
      repliedAt: new Date(),
    },
  });

  return Response.json({
    reviewId: updated.id,
    hostReply: updated.hostReply,
    repliedAt: updated.repliedAt,
  });
}
