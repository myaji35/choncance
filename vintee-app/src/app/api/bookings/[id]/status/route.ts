import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
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
    include: { property: { select: { hostId: true } } },
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

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  const statusLabels: Record<string, string> = {
    CONFIRMED: "확정",
    COMPLETED: "완료",
    CANCELLED: "취소",
  };

  return Response.json({
    message: `예약이 ${statusLabels[parsed.data.status]}되었습니다`,
    booking: updated,
  });
}
