import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

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

    const { id: paymentId } = params;
    const body = await request.json();
    const { reason, cancelAmount } = body;

    // 결제 정보 조회
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 권한 확인
    if (payment.booking.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 이미 환불된 경우
    if (payment.status === "CANCELLED" || payment.status === "FAILED") {
      return NextResponse.json(
        { error: "Payment already refunded or canceled" },
        { status: 400 }
      );
    }

    // 환불 가능한 상태인지 확인
    if (payment.status !== "DONE") {
      return NextResponse.json(
        { error: "Payment is not in a refundable state" },
        { status: 400 }
      );
    }

    // 환불 금액 확인
    const refundAmount = cancelAmount || payment.amount;
    if (refundAmount > payment.amount) {
      return NextResponse.json(
        { error: "Refund amount exceeds payment amount" },
        { status: 400 }
      );
    }

    // 토스 페이먼츠 환불 API 호출
    const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;

    if (TOSS_SECRET_KEY && payment.paymentKey) {
      try {
        const tossResponse = await fetch(
          `https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cancelReason: reason || "고객 요청",
              cancelAmount: Number(refundAmount),
            }),
          }
        );

        if (!tossResponse.ok) {
          const errorData = await tossResponse.json();
          console.error("Toss Payments refund error:", errorData);
          return NextResponse.json(
            { error: errorData.message || "환불 처리 실패" },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Toss Payments API error:", error);
        // 개발 환경에서는 계속 진행
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { error: "환불 처리 중 오류가 발생했습니다" },
            { status: 500 }
          );
        }
      }
    }

    // 데이터베이스 업데이트 (트랜잭션)
    const result = await prisma.$transaction(async (tx) => {
      // 결제 상태 업데이트
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: Number(refundAmount) === Number(payment.amount) ? "CANCELLED" : "DONE",
          cancelledAt: Number(refundAmount) === Number(payment.amount) ? new Date() : undefined,
          refundedAt: new Date(),
        },
      });

      // 환불 트랜잭션 생성
      const refundTransaction = await tx.paymentTransaction.create({
        data: {
          paymentId: paymentId,
          type: "REFUND",
          amount: refundAmount,
          status: "SUCCESS",
          metadata: {
            reason: reason || "고객 요청",
            refundedAt: new Date().toISOString(),
          },
        },
      });

      // 예약 상태 업데이트 (전액 환불인 경우)
      if (Number(refundAmount) === Number(payment.amount)) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: "CANCELLED",
          },
        });
      }

      return { payment: updatedPayment, transaction: refundTransaction };
    });

    // TODO: 환불 완료 이메일 발송

    return NextResponse.json({
      success: true,
      refund: {
        paymentId: result.payment.id,
        refundAmount: Number(refundAmount),
        status: result.payment.status,
        transactionId: result.transaction.id,
      },
    });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: "환불 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
