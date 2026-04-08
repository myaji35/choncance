// ISS-035: 비슷한 숙소 추천
// 같은 region 우선 + 공유 태그 점수 + 가격 유사도
import { prisma } from "../prisma";

export interface SimilarProperty {
  id: string;
  title: string;
  location: string;
  pricePerNight: number | null;
  thumbnailUrl: string | null;
  hostName: string | null;
  sharedTags: number;
  avgRating: number;
  reviewCount: number;
}

export async function getSimilarProperties(
  propertyId: string,
  limit = 4
): Promise<SimilarProperty[]> {
  // 1. 기준 숙소 + 태그 조회
  const me = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      location: true,
      pricePerNight: true,
      tags: { select: { tagId: true } },
    },
  });
  if (!me) return [];

  const myTagIds = me.tags.map((t) => t.tagId);
  const myRegion = me.location.split(/\s+/)[0]; // "충남 아산" → "충남"

  // 2. 후보 숙소 (active, 자기 자신 제외)
  const candidates = await prisma.property.findMany({
    where: {
      status: "active",
      id: { not: propertyId },
    },
    select: {
      id: true,
      title: true,
      location: true,
      pricePerNight: true,
      thumbnailUrl: true,
      host: { select: { name: true } },
      tags: { select: { tagId: true } },
      reviews: { select: { rating: true } },
    },
  });

  // 3. 점수 계산
  const scored = candidates.map((c) => {
    const candTagIds = new Set(c.tags.map((t) => t.tagId));
    const sharedTags = myTagIds.filter((id) => candTagIds.has(id)).length;

    // 같은 region이면 +5 보너스
    const sameRegion = c.location.startsWith(myRegion) ? 5 : 0;

    // 가격 유사도 (절대값 차이 작을수록 +)
    let priceProximity = 0;
    if (me.pricePerNight && c.pricePerNight) {
      const diff = Math.abs(me.pricePerNight - c.pricePerNight);
      const ratio = diff / me.pricePerNight;
      if (ratio < 0.2) priceProximity = 3;
      else if (ratio < 0.4) priceProximity = 2;
      else if (ratio < 0.6) priceProximity = 1;
    }

    const score = sharedTags * 2 + sameRegion + priceProximity;

    const avgRating =
      c.reviews.length > 0
        ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
        : 0;

    return {
      id: c.id,
      title: c.title,
      location: c.location,
      pricePerNight: c.pricePerNight,
      thumbnailUrl: c.thumbnailUrl,
      hostName: c.host.name,
      sharedTags,
      avgRating,
      reviewCount: c.reviews.length,
      score,
    };
  });

  // 4. 정렬 + 상위 N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ score, ...rest }) => {
    void score;
    return rest;
  });
}
