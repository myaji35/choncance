// ISS-041: 토스 결제 승인 엔드포인트
// 클라이언트(토스 위젯 success 콜백) → 이 엔드포인트로 paymentKey + orderId + amount 전달
// 서버가 Payment 생성 + Toss confirm API 호출 + Booking.paymentStatus 업데이트

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { confirmTossPayment } from "@/lib/toss";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const confirmSchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1), // = bookingId
  amount: z.number().int().min(1),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rl = rateLimit(`payment:${ip}`, 20, 10 * 60_000);
  if (!rl.allowed) {
    return Response.json(
      { error: "결제 요청이 너무 많아요. 잠시 후 다시 시도해주세요" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 형식이 올바르지 않습니다" }, { status: 400 });
  }
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "입력값 오류" },
      { status: 400 }
    );
  }

  const { paymentKey, orderId, amount } = parsed.data;

  // 1. Booking 조회 + 소유권 + 금액 검증
  const booking = await prisma.booking.findUnique({
    where: { id: orderId },
    include: { property: { select: { title: true } } },
  });
  if (!booking) {
    return Response.json({ error: "예약을 찾을 수 없습니다" }, { status: 404 });
  }
  if (booking.userId !== user.id) {
    return Response.json({ error: "본인의 예약만 결제할 수 있습니다" }, { status: 403 });
  }
  if (booking.totalPrice !== amount) {
    return Response.json(
      { error: "결제 금액이 예약 금액과 다릅니다" },
      { status: 400 }
    );
  }
  if (booking.paymentStatus === "paid") {
    return Response.json(
      { error: "이미 결제 완료된 예약입니다" },
      { status: 409 }
    );
  }

  // 2. Toss confirm API 호출 (mock이면 즉시 ok)
  const result = await confirmTossPayment({ paymentKey, orderId, amount });
  if (!result.ok) {
    return Response.json(
      { error: result.error ?? "결제 승인 실패" },
      { status: 502 }
    );
  }

  // 3. Payment + Booking.paymentStatus 트랜잭션
  const payment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: {
        bookingId: booking.id,
        provider: result.method === "MOCK" ? "mock" : "toss",
        providerPaymentKey: result.paymentKey ?? paymentKey,
        orderId,
        amount,
        method: result.method ?? null,
        status: "paid",
        paidAt: new Date(),
        rawResponse: result.rawResponse ?? null,
      },
    });
    await tx.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "paid" },
    });
    return p;
  });

  return Response.json(
    {
      message: "결제가 완료되었습니다",
      payment: {
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        paidAt: payment.paidAt,
      },
    },
    { status: 200 }
  );
}
