import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notifyHostReply } from "@/lib/notifications";
import { hostReplySchema } from "@/lib/validations/review";

/**
 * POST /api/reviews/:id/reply
 * Host reply to a review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUser();
    const userId = authUser?.profile?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Zod 서버 검증 (10-300자)
    const parsed = hostReplySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { reply } = parsed.data;

    // Find review and verify host ownership
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        property: {
          include: {
            host: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user is the property host
    if (review.property.host.userId !== userId) {
      return NextResponse.json(
        { error: "Only the host can reply to reviews" },
        { status: 403 }
      );
    }

    // 중복 답글 방지
    if (review.hostReply) {
      return NextResponse.json(
        { error: "Already replied to this review" },
        { status: 409 }
      );
    }

    // Update review with host reply
    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        hostReply: reply,
        repliedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send notification to review author
    try {
      await notifyHostReply(
        review.userId,
        review.propertyId,
        review.property.name
      );
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error("Reply to review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
