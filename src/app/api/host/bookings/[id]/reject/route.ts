import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyBookingRejected } from "@/lib/notifications";
import { PaymentStatus } from "@prisma/client";

/**
 * PATCH /api/host/bookings/:id/reject
 * Reject a booking
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a host
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId },
    });

    if (!hostProfile) {
      return NextResponse.json(
        { error: "Not a host" },
        { status: 403 }
      );
    }

    // Get rejection reason from request body
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Rejection reason must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Find booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            host: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if host owns this property
    if (booking.property.host.userId !== userId) {
      return NextResponse.json(
        { error: "You don't own this property" },
        { status: 403 }
      );
    }

    // Check if booking can be rejected
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending bookings can be rejected" },
        { status: 400 }
      );
    }

    // Update booking status and issue refund if payment exists
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
          rejectedAt: new Date(),
        },
        include: {
          property: true,
          payment: true,
        },
      });

      // If payment exists and is completed, process refund
      if (booking.payment && booking.payment.status === "DONE") {
        // Check if running in development mode
        const isDevelopment = process.env.NODE_ENV === "development";

        if (isDevelopment) {
          // Development mode: Just update payment status to CANCELLED
          await tx.payment.update({
            where: { id: booking.payment.id },
            data: {
              status: "CANCELLED",
              refundedAt: new Date(),
            },
          });

          await tx.paymentTransaction.create({
            data: {
              paymentId: booking.payment.id,
              type: "REFUND",
              amount: booking.totalAmount,
              status: PaymentStatus.DONE,
              method: "DEVELOPMENT_MODE",
            },
          });
        } else {
          // Production mode: Use Toss Payments API
          const refundResponse = await fetch(
            `https://api.tosspayments.com/v1/payments/${booking.payment.paymentKey}/cancel`,
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${Buffer.from(
                  process.env.TOSS_SECRET_KEY + ":"
                ).toString("base64")}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                cancelReason: `호스트 거절: ${reason}`,
                cancelAmount: Number(booking.totalAmount),
              }),
            }
          );

          if (!refundResponse.ok) {
            throw new Error("Failed to process refund");
          }

          // Update payment status
          await tx.payment.update({
            where: { id: booking.payment.id },
            data: {
              status: "CANCELLED",
              refundedAt: new Date(),
            },
          });

          // Record refund transaction
          await tx.paymentTransaction.create({
            data: {
              paymentId: booking.payment.id,
              type: "REFUND",
              amount: booking.totalAmount,
              status: PaymentStatus.DONE,
              method: booking.payment.paymentMethod || "HOST_REJECT",
            },
          });
        }
      }

      return updated;
    });

    // Send notification to guest
    try {
      await notifyBookingRejected(
        booking.userId,
        booking.id,
        booking.property.name
      );
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error("Reject booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
