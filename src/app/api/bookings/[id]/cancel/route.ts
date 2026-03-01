import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notifyBookingCancelled } from "@/lib/notifications";
import { cancelBookingSchema } from "@/lib/validations/booking";

/**
 * Calculate cancellation refund based on days until check-in
 *
 * Policy:
 *   - < 1 day (24h): cancellation not allowed
 *   - 1-2 days: 0% refund (no refund)
 *   - 3-6 days: 50% refund
 *   - 7+ days: 100% refund
 */
function getCancellationPolicy(checkInDate: Date, now: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilCheckIn = (checkInDate.getTime() - now.getTime()) / msPerDay;

  // 체크인 24시간 이내: 취소 불가
  if (daysUntilCheckIn < 1) {
    return {
      allowed: false,
      refundRate: 0,
      description: "체크인 24시간 전에는 취소할 수 없습니다",
    };
  }

  // 체크인 7일 이상 전: 전액 환불
  if (daysUntilCheckIn >= 7) {
    return {
      allowed: true,
      refundRate: 1.0,
      description: "전액 환불",
    };
  }

  // 체크인 3~6일 전: 50% 환불
  if (daysUntilCheckIn >= 3) {
    return {
      allowed: true,
      refundRate: 0.5,
      description: "50% 환불",
    };
  }

  // 체크인 1~2일 전: 환불 불가
  return {
    allowed: true,
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
    console.warn("TOSS_SECRET_KEY not found. Simulating refund success for development.");
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
 * POST /api/bookings/[id]/cancel
 * Cancel a booking and process refund based on cancellation policy
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 인증 확인
    const authUser = await getUser();
    const userId = authUser?.profile?.id;

    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    // 2. Request body Zod 검증
    const body = await request.json();
    const parsed = cancelBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { cancelReason } = parsed.data;
    const { id: bookingId } = await params;

    // 3. 예약 조회 (본인 예약인지 확인)
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      include: {
        payment: true,
        property: {
          select: {
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

    if (!booking) {
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 4. 이미 취소/완료된 예약이면 400 반환
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "이미 취소된 예약입니다" },
        { status: 400 }
      );
    }

    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { error: "이미 완료된 예약은 취소할 수 없습니다" },
        { status: 400 }
      );
    }

    if (booking.status === "REJECTED") {
      return NextResponse.json(
        { error: "거절된 예약은 취소할 수 없습니다" },
        { status: 400 }
      );
    }

    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "이 예약은 취소할 수 없는 상태입니다" },
        { status: 400 }
      );
    }

    // 5. 체크인 날짜 기반 환불율 계산
    const policy = getCancellationPolicy(new Date(booking.checkIn), new Date());

    if (!policy.allowed) {
      return NextResponse.json(
        { error: policy.description },
        { status: 400 }
      );
    }

    const refundAmount = Math.round(
      Number(booking.totalAmount) * policy.refundRate
    );

    // 6. Toss Payments 환불 API 호출 (환불율 > 0이고 결제 완료 건만)
    if (
      refundAmount > 0 &&
      booking.payment &&
      booking.payment.paymentKey &&
      booking.payment.status === "DONE"
    ) {
      try {
        await requestTossPaymentRefund(
          booking.payment.paymentKey,
          refundAmount,
          cancelReason
        );
      } catch (error) {
        console.error("Toss Payment refund error:", error);
        // 프로덕션에서는 환불 실패 시 취소 중단
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { error: "환불 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요." },
            { status: 500 }
          );
        }
        // 개발 환경에서는 계속 진행
      }
    }

    // 7. prisma.$transaction으로 booking + payment 상태 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 예약 상태 업데이트
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: cancelReason,
        },
      });

      // 결제 상태 업데이트 (결제 건이 있을 때)
      let updatedPayment = null;
      if (booking.payment) {
        const paymentUpdateData: Record<string, unknown> = {
          refundReason: cancelReason,
        };

        if (refundAmount > 0) {
          paymentUpdateData.status = "CANCELLED";
          paymentUpdateData.cancelledAt = new Date();
          paymentUpdateData.refundedAt = new Date();
          paymentUpdateData.refundAmount = refundAmount;
        }

        updatedPayment = await tx.payment.update({
          where: { id: booking.payment.id },
          data: paymentUpdateData,
        });

        // 환불 트랜잭션 레코드 생성
        if (refundAmount > 0) {
          await tx.paymentTransaction.create({
            data: {
              paymentId: booking.payment.id,
              externalId: `REFUND-${Date.now()}`,
              type: "REFUND",
              amount: refundAmount,
              status: "SUCCESS",
              method: booking.payment.paymentMethod || "GUEST_CANCEL",
              metadata: {
                cancelReason,
                policy: policy.description,
                refundRate: policy.refundRate,
                originalAmount: Number(booking.totalAmount),
              },
            },
          });
        }
      }

      return { updatedBooking, updatedPayment };
    });

    // 8. 호스트에게 취소 알림
    try {
      await notifyBookingCancelled(
        booking.property.host.userId,
        booking.id,
        booking.property.name
      );
    } catch (error) {
      console.error("Failed to send cancellation notification:", error);
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: result.updatedBooking.id,
        status: result.updatedBooking.status,
        cancelledAt: result.updatedBooking.cancelledAt,
        cancellationReason: result.updatedBooking.cancellationReason,
      },
      refund: {
        amount: refundAmount,
        rate: policy.refundRate,
        policy: policy.description,
        processingDays: refundAmount > 0 ? "3-5 영업일" : null,
      },
    });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { error: "예약 취소 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
