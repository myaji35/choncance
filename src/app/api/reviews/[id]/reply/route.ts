import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notifyHostReply } from "@/lib/notifications";

/**
 * POST /api/reviews/:id/reply
 * Host reply to a review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reply } = body;

    if (!reply || reply.trim().length === 0) {
      return NextResponse.json(
        { error: "Reply content is required" },
        { status: 400 }
      );
    }

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
