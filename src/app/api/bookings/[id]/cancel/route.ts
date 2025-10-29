import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Calculate cancellation policy
 */
function getCancellationPolicy(checkInDate: Date, cancellationDate: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - cancellationDate.getTime()) / msPerDay
  );

  // 체크인 7일 전: 전액 환불
  if (daysUntilCheckIn >= 7) {
    return {
      refundRate: 1.0,
      description: "전액 환불",
    };
  }

  // 체크인 3~6일 전: 50% 환불
  if (daysUntilCheckIn >= 3) {
    return {
      refundRate: 0.5,
      description: "50% 환불",
    };
  }

  // 체크인 2일 전 이내: 환불 불가
  return {
    refundRate: 0,
    description: "환불 불가",
  };
}

/**
 * Request refund from Toss Payments
 */
async function requestTossPaymentRefund(
  paymentKey: string,
  amount: number,
  reason: string
): Promise<void> {
  const tossSecretKey = process.env.TOSS_SECRET_KEY;

  if (!tossSecretKey) {
    // For development without Toss API key, simulate success
    console.warn("⚠️ TOSS_SECRET_KEY not found. Simulating refund success for development.");
    return;
  }

  const response = await fetch(
    `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(tossSecretKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cancelAmount: amount,
        cancelReason: reason,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "환불 요청 실패");
  }
}

/**
 * PATCH /api/bookings/[id]/cancel
 * Cancel a booking
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "취소 사유를 입력해주세요" },
        { status: 400 }
      );
    }

    // Find booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId, // Ensure user owns this booking
      },
      include: {
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "이 예약은 취소할 수 없습니다" },
        { status: 400 }
      );
    }

    // Calculate refund amount based on cancellation policy
    const policy = getCancellationPolicy(
      new Date(booking.checkIn),
      new Date()
    );

    const refundAmount = Math.round(
      Number(booking.totalAmount) * policy.refundRate
    );

    // Process cancellation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      // Update payment status
      let updatedPayment = null;
      if (booking.payment && refundAmount > 0) {
        updatedPayment = await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            refundAmount,
            refundReason: reason,
          },
        });

        // Create refund transaction record
        await tx.paymentTransaction.create({
          data: {
            paymentId: booking.payment.id,
            externalId: `REFUND-${Date.now()}`,
            type: "REFUND",
            amount: refundAmount,
            status: "SUCCESS",
            method: booking.payment.paymentMethod || "GUEST_CANCEL",
            metadata: {
              reason,
              policy: policy.description,
              refundRate: policy.refundRate,
            },
          },
        });
      }

      return { updatedBooking, updatedPayment };
    });

    // Request refund from Toss Payments (outside transaction)
    if (
      booking.payment &&
      booking.payment.paymentKey &&
      refundAmount > 0
    ) {
      try {
        await requestTossPaymentRefund(
          booking.payment.paymentKey,
          refundAmount,
          reason
        );
      } catch (error) {
        console.error("Toss Payment refund error:", error);
        // Don't fail the cancellation if refund request fails
        // The payment status is already updated in DB
      }
    }

    return NextResponse.json({
      success: true,
      booking: result.updatedBooking,
      refund: {
        amount: refundAmount,
        processingDays: "3-5일",
        policy: policy.description,
      },
    });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "예약 취소에 실패했습니다",
      },
      { status: 500 }
    );
  }
}
