import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { haversineDistance } from "@/lib/utils/geo";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = sp.get("lat");
  const lng = sp.get("lng");
  const radius = sp.get("radius");
  const bounds = sp.get("bounds"); // "swLat,swLng,neLat,neLng"

  const properties = await prisma.property.findMany({
    where: { status: "active" },
    select: {
      id: true,
      title: true,
      location: true,
      address: true,
      latitude: true,
      longitude: true,
      pricePerNight: true,
      maxGuests: true,
      thumbnailUrl: true,
    },
  });

  // 지도 영역(bounds) 기반 필터링
  if (bounds) {
    const parts = bounds.split(",").map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const [swLat, swLng, neLat, neLng] = parts;
      const filtered = properties.filter(
        (p) =>
          p.latitude !== null &&
          p.longitude !== null &&
          p.latitude >= swLat &&
          p.latitude <= neLat &&
          p.longitude >= swLng &&
          p.longitude <= neLng
      );
      return Response.json({
        properties: filtered,
        bounds: { swLat, swLng, neLat, neLng },
      });
    }
  }

  // 반경(radius) 기반 필터링
  if (lat && lng && radius) {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radiusNum = Number(radius);
    if (
      Number.isFinite(latNum) &&
      Number.isFinite(lngNum) &&
      Number.isFinite(radiusNum) &&
      radiusNum > 0
    ) {
      const filtered = properties
        .filter((p) => p.latitude !== null && p.longitude !== null)
        .map((p) => ({
          ...p,
          distanceKm: haversineDistance(latNum, lngNum, p.latitude!, p.longitude!),
        }))
        .filter((p) => p.distanceKm <= radiusNum)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return Response.json({
        properties: filtered,
        center: { lat: latNum, lng: lngNum },
        radius: radiusNum,
      });
    }
  }

  return Response.json({ properties });
}

const propertySchema = z.object({
  title: z.string().min(2, "숙소명은 2자 이상이어야 합니다").max(100),
  description: z.string().max(2000).optional(),
  location: z.string().min(2, "지역을 입력해주세요"),
  address: z.string().optional(),
  pricePerNight: z.number().int().min(0).optional(),
  maxGuests: z.number().int().min(1).max(20).default(4),
  phone: z.string().optional(),
  status: z.enum(["draft", "active"]).default("draft"),
  // GEO 필드
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
  // ISS-024: 이미지 배열 + 썸네일
  images: z.array(z.string().url().or(z.string().startsWith("/uploads/"))).max(20).optional(),
  thumbnailUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOST") {
    return Response.json({ error: "호스트만 숙소를 등록할 수 있습니다" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" },
      { status: 400 }
    );
  }

  const { highlights, nearbyAttractions, images, ...rest } = parsed.data;
  const property = await prisma.property.create({
    data: {
      ...rest,
      hostId: user.id,
      ...(highlights ? { highlights: JSON.stringify(highlights) } : {}),
      ...(nearbyAttractions ? { nearbyAttractions: JSON.stringify(nearbyAttractions) } : {}),
      ...(images ? { images: JSON.stringify(images) } : {}),
    },
  });

  return Response.json(
    { message: "숙소가 등록되었습니다", property },
    { status: 201 }
  );
}
