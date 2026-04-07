import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateGeoScore } from "@/lib/utils/geo-score";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOST") {
    return Response.json({ error: "호스트만 접근할 수 있습니다" }, { status: 403 });
  }

  const propertyId = request.nextUrl.searchParams.get("propertyId");
  if (!propertyId) {
    return Response.json({ error: "propertyId가 필요합니다" }, { status: 400 });
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    return Response.json({ error: "숙소를 찾을 수 없습니다" }, { status: 404 });
  }
  if (property.hostId !== user.id) {
    return Response.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const [count, agg, replied] = await Promise.all([
    prisma.review.count({ where: { propertyId } }),
    prisma.review.aggregate({ where: { propertyId }, _avg: { rating: true } }),
    prisma.review.count({ where: { propertyId, hostReply: { not: null } } }),
  ]);

  const replyRate = count > 0 ? replied / count : 0;
  const result = calculateGeoScore(property, {
    count,
    avgRating: agg._avg.rating ?? 0,
    replyRate,
  });

  return Response.json(result);
}
