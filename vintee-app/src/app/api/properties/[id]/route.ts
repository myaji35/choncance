import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return Response.json({ error: "숙소를 찾을 수 없습니다" }, { status: 404 });
  return Response.json({ property });
}

const updateSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  location: z.string().min(2).optional(),
  address: z.string().optional(),
  pricePerNight: z.number().int().min(0).optional(),
  maxGuests: z.number().int().min(1).max(20).optional(),
  phone: z.string().optional(),
  status: z.enum(["draft", "active", "inactive"]).optional(),
  // GEO
  checkinTime: z.string().max(10).optional(),
  checkoutTime: z.string().max(10).optional(),
  highlights: z.array(z.string().max(50)).max(20).optional(),
  nearbyAttractions: z
    .array(
      z.object({
        name: z.string().max(50),
        distance: z.string().max(50),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
      })
    )
    .max(20)
    .optional(),
  bestSeason: z.string().max(20).optional(),
  hostIntro: z.string().max(2000).optional(),
  uniqueExperience: z.string().max(500).optional(),
  petsAllowed: z.boolean().optional(),
  numberOfRooms: z.number().int().min(1).max(99).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return Response.json({ error: "숙소를 찾을 수 없습니다" }, { status: 404 });
  if (property.hostId !== user.id) return Response.json({ error: "권한이 없습니다" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "입력값 오류" }, { status: 400 });
  }

  const { highlights, nearbyAttractions, ...rest } = parsed.data;
  const updated = await prisma.property.update({
    where: { id },
    data: {
      ...rest,
      ...(highlights ? { highlights: JSON.stringify(highlights) } : {}),
      ...(nearbyAttractions ? { nearbyAttractions: JSON.stringify(nearbyAttractions) } : {}),
    },
  });
  return Response.json({ message: "숙소가 수정되었습니다", property: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const property = await prisma.property.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  });
  if (!property) return Response.json({ error: "숙소를 찾을 수 없습니다" }, { status: 404 });
  if (property.hostId !== user.id) return Response.json({ error: "권한이 없습니다" }, { status: 403 });

  if (property._count.bookings > 0) {
    return Response.json({ error: "예약이 있는 숙소는 삭제할 수 없습니다. 비활성화를 이용해주세요." }, { status: 400 });
  }

  await prisma.property.delete({ where: { id } });
  return Response.json({ message: "숙소가 삭제되었습니다" });
}
