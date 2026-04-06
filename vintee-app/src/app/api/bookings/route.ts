import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
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
  if (checkInDate >= checkOutDate) {
    return Response.json({ error: "체크아웃은 체크인 이후여야 합니다" }, { status: 400 });
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
