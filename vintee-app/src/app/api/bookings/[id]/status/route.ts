import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail, tplBookingDecisionToGuest } from "@/lib/email";
import { cancelTossPayment } from "@/lib/toss";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "유효하지 않은 상태입니다" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: { select: { hostId: true, title: true } },
      user: { select: { email: true, name: true } },
      payments: {
        where: { status: "paid" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!booking) {
    return Response.json({ error: "예약을 찾을 수 없습니다" }, { status: 404 });
  }

  // 호스트만 상태 변경 가능 (취소는 게스트도 가능)
  const isHost = booking.property.hostId === user.id;
  const isGuest = booking.userId === user.id;

  if (parsed.data.status === "CANCELLED") {
    if (!isHost && !isGuest) {
      return Response.json({ error: "권한이 없습니다" }, { status: 403 });
    }
  } else {
    if (!isHost) {
      return Response.json({ error: "호스트만 상태를 변경할 수 있습니다" }, { status: 403 });
    }
  }

  // 상태 전이 검증
  const validTransitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "CANCELLED"],
  };

  if (!validTransitions[booking.status]?.includes(parsed.data.status)) {
    return Response.json(
      { error: `${booking.status} 상태에서 ${parsed.data.status}로 변경할 수 없습니다` },
      { status: 400 }
    );
  }

  // ISS-043: CANCELLED 전환 시 기존 Payment 자동 환불
  let refundInfo: { amount: number } | null = null;
  if (parsed.data.status === "CANCELLED" && booking.payments.length > 0) {
    const pay = booking.payments[0];
    if (pay.providerPaymentKey) {
      const cancelRes = await cancelTossPayment({
        paymentKey: pay.providerPaymentKey,
        cancelReason: isHost ? "호스트 거절" : "게스트 취소",
      });
      if (cancelRes.ok) {
        await prisma.payment.update({
          where: { id: pay.id },
          data: {
            status: "refunded",
            refundedAt: new Date(),
            rawResponse: cancelRes.rawResponse ?? pay.rawResponse,
          },
        });
        refundInfo = { amount: pay.amount };
      } else {
        console.error("[refund] failed:", cancelRes.error);
      }
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: parsed.data.status,
      ...(parsed.data.status === "CANCELLED" && refundInfo
        ? { paymentStatus: "refunded" }
        : {}),
    },
  });

  const statusLabels: Record<string, string> = {
    CONFIRMED: "확정",
    COMPLETED: "완료",
    CANCELLED: "취소",
  };

  // ISS-023: 호스트의 결정(승인/거절)을 게스트에게 알림
  // (게스트 자가 취소나 COMPLETED는 알림 생략)
  if (
    isHost &&
    (parsed.data.status === "CONFIRMED" || parsed.data.status === "CANCELLED") &&
    booking.user?.email
  ) {
    try {
      const tpl = tplBookingDecisionToGuest({
        guestName: booking.user.name ?? "게스트",
        propertyTitle: booking.property.title,
        checkIn: booking.checkIn.toISOString().slice(0, 10),
        checkOut: booking.checkOut.toISOString().slice(0, 10),
        decision: parsed.data.status,
        bookingId: booking.id,
      });
      await sendEmail({
        to: booking.user.email,
        subject: tpl.subject,
        html: tpl.html,
      });
    } catch (err) {
      console.error("[booking-status] guest notification failed:", err);
    }
  }

  return Response.json({
    message: `예약이 ${statusLabels[parsed.data.status]}되었습니다`,
    booking: updated,
  });
}
