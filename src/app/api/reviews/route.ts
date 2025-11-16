import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notifyReviewReceived } from "@/lib/notifications";

/**
 * POST /api/reviews
 * Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUser();
    const userId = authUser?.profile?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, rating, content, images, snsShareConsent = false } = body;

    // Validation
    if (!bookingId || !rating || !content) {
      return NextResponse.json(
        { error: "bookingId, rating, and content are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Find booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      include: {
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking is completed
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed bookings" },
        { status: 400 }
      );
    }

    // Check if review already exists
    if (booking.review) {
      return NextResponse.json(
        { error: "Review already exists for this booking" },
        { status: 400 }
      );
    }

    // Create review and award credits in a transaction
    const review = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          userId,
          propertyId: booking.propertyId,
          bookingId,
          rating,
          content,
          images: images || [],
          snsShareConsent,
          creditAwarded: snsShareConsent, // Award credits immediately if consent given
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
              host: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });

      // Award 1000 credits if SNS consent is given
      if (snsShareConsent) {
        // Update user credits
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: { increment: 1000 },
            totalEarned: { increment: 1000 },
          },
        });

        // Create credit history record
        await tx.creditHistory.create({
          data: {
            userId,
            amount: 1000,
            type: "EARNED_REVIEW_SNS",
            reviewId: newReview.id,
            description: `SNS 공유 동의 리뷰 작성: ${newReview.property.name}`,
          },
        });
      }

      return newReview;
    });

    // Send notification to property host
    try {
      await notifyReviewReceived(
        review.property.host.userId,
        review.propertyId,
        review.property.name,
        rating
      );
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      review,
      creditsAwarded: snsShareConsent ? 1000 : 0,
      message: snsShareConsent ? "리뷰가 작성되었고 1000 크레딧이 지급되었습니다." : "리뷰가 작성되었습니다."
    }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews
 * Get reviews (filtered by propertyId, userId, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (userId) where.userId = userId;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate average rating if filtering by property
    let averageRating = null;
    if (propertyId) {
      const stats = await prisma.review.aggregate({
        where: { propertyId },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });

      averageRating = {
        average: stats._avg.rating || 0,
        count: stats._count.id,
      };
    }

    return NextResponse.json({
      reviews,
      averageRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
