import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail, tplNewBookingToHost } from "@/lib/email";
import { z } from "zod";

const bookingSchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().min(1, "체크인 날짜를 선택해주세요"),
  checkOut: z.string().min(1, "체크아웃 날짜를 선택해주세요"),
  guestCount: z.number().int().min(1).max(20).default(1),
  message: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" },
      { status: 400 }
    );
  }

  const { propertyId, checkIn, checkOut, guestCount, message } = parsed.data;

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property || property.status !== "active") {
    return Response.json({ error: "숙소를 찾을 수 없습니다" }, { status: 404 });
  }

  if (property.hostId === user.id) {
    return Response.json({ error: "본인 숙소는 예약할 수 없습니다" }, { status: 400 });
  }

  if (guestCount > property.maxGuests) {
    return Response.json(
      { error: `최대 ${property.maxGuests}명까지 예약 가능합니다` },
      { status: 400 }
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return Response.json({ error: "날짜 형식이 올바르지 않습니다" }, { status: 400 });
  }
  if (checkInDate >= checkOutDate) {
    return Response.json({ error: "체크아웃은 체크인 이후여야 합니다" }, { status: 400 });
  }

  // ISS-009: 과거 날짜 거부 (오늘 0시 기준)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkInDate < today) {
    return Response.json(
      { error: "과거 날짜는 예약할 수 없습니다" },
      { status: 400 }
    );
  }

  // ISS-009: 너무 먼 미래 거부 (24개월)
  const maxFuture = new Date(today);
  maxFuture.setMonth(maxFuture.getMonth() + 24);
  if (checkInDate > maxFuture) {
    return Response.json(
      { error: "예약은 최대 24개월 이내만 가능합니다" },
      { status: 400 }
    );
  }

  // ISS-010: 동일 숙소 날짜 겹침 검증 (PENDING/CONFIRMED 상태만)
  // 겹침 조건: NOT (existing.checkOut <= new.checkIn OR existing.checkIn >= new.checkOut)
  const overlapping = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: { in: ["PENDING", "CONFIRMED"] },
      AND: [
        { checkIn: { lt: checkOutDate } },
        { checkOut: { gt: checkInDate } },
      ],
    },
    select: { id: true, checkIn: true, checkOut: true },
  });
  if (overlapping) {
    return Response.json(
      { error: "선택하신 날짜는 이미 예약되어 있습니다" },
      { status: 409 }
    );
  }

  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = (property.pricePerNight ?? 0) * nights;

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestCount,
      totalPrice,
      message: message || null,
      status: "PENDING",
    },
  });

  // ISS-023: 호스트에게 새 예약 알림 (실패해도 booking 생성은 성공으로 간주)
  try {
    const host = await prisma.user.findUnique({
      where: { id: property.hostId },
      select: { email: true, name: true },
    });
    if (host?.email) {
      const tpl = tplNewBookingToHost({
        hostName: host.name ?? "호스트",
        guestName: user.name ?? "게스트",
        propertyTitle: property.title,
        checkIn: checkInDate.toISOString().slice(0, 10),
        checkOut: checkOutDate.toISOString().slice(0, 10),
        guestCount,
        bookingId: booking.id,
      });
      await sendEmail({ to: host.email, subject: tpl.subject, html: tpl.html });
    }
  } catch (err) {
    console.error("[booking] host notification failed:", err);
  }

  return Response.json(
    { message: "예약이 완료되었습니다", booking },
    { status: 201 }
  );
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      property: { select: { id: true, title: true, location: true, thumbnailUrl: true } },
      review: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ bookings });
}
