import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

/**
 * POST /api/payments/confirm
 * Toss Payments 결제 승인
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Find payment by orderId
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { booking: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify amount
    if (Number(payment.amount) !== amount) {
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      );
    }

    // Call Toss Payments API to confirm payment
    const tossSecretKey = process.env.TOSS_SECRET_KEY;

    if (!tossSecretKey) {
      // For development without Toss API key, simulate success
      console.warn("⚠️ TOSS_SECRET_KEY not found. Simulating payment success for development.");

      // Update payment and booking status
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentKey,
            status: "DONE",
            approvedAt: new Date(),
          },
        }),
        prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        }),
        prisma.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            externalId: paymentKey,
            type: "PAYMENT",
            amount: payment.amount,
            status: "SUCCESS",
            method: "SIMULATED",
            metadata: {
              orderId,
              simulatedPayment: true,
            },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        orderId,
        bookingId: payment.bookingId,
        message: "결제가 완료되었습니다 (개발 모드)",
      });
    }

    // Make request to Toss Payments
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(tossSecretKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error("Toss Payments error:", tossData);

      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
        },
      });

      return NextResponse.json(
        { error: tossData.message || "결제 승인 실패" },
        { status: 400 }
      );
    }

    // Update payment and booking status
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentKey,
          status: "DONE",
          paymentMethod: tossData.method,
          approvedAt: new Date(),
        },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      }),
      prisma.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          externalId: tossData.transactionKey || paymentKey,
          type: "PAYMENT",
          amount: payment.amount,
          status: "SUCCESS",
          method: tossData.method || "UNKNOWN",
          metadata: tossData,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      orderId,
      bookingId: payment.bookingId,
      message: "결제가 완료되었습니다",
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
