// GEO 스코어 계산
import { parseJsonArray, type NearbyAttraction } from "./geo";

export interface GeoScoreItem {
  label: string;
  score: number;
  maxScore: number;
  status: "pass" | "warn" | "fail";
}

export interface GeoScoreResult {
  total: number;
  items: GeoScoreItem[];
  suggestions: string[];
}

export interface PropertyForGeo {
  title: string;
  description: string | null;
  location: string;
  pricePerNight: number | null;
  maxGuests: number;
  highlights: string;
  nearbyAttractions: string;
  hostIntro: string | null;
  uniqueExperience: string | null;
  checkinTime: string | null;
  checkoutTime: string | null;
  bestSeason: string | null;
}

export interface ReviewStats {
  count: number;
  avgRating: number;
  replyRate: number; // 0-1
}

function statusOf(score: number, max: number): GeoScoreItem["status"] {
  if (score === max) return "pass";
  if (score === 0) return "fail";
  return "warn";
}

export function calculateGeoScore(
  property: PropertyForGeo,
  reviewStats: ReviewStats
): GeoScoreResult {
  const items: GeoScoreItem[] = [];
  const suggestions: string[] = [];

  // 1. 기본 정보 완성 (20)
  {
    const has =
      !!property.title &&
      !!property.description &&
      !!property.location &&
      property.pricePerNight !== null &&
      property.maxGuests > 0;
    const score = has ? 20 : 0;
    items.push({ label: "기본 정보", score, maxScore: 20, status: statusOf(score, 20) });
    if (!has) suggestions.push("기본 정보(제목/소개/지역/가격/최대인원)를 모두 입력하세요 (+20점)");
  }

  // 2. 상세 설명 길이 (10)
  {
    const len = property.description?.length ?? 0;
    const score = len >= 200 ? 10 : len >= 100 ? 5 : 0;
    items.push({ label: "상세 설명", score, maxScore: 10, status: statusOf(score, 10) });
    if (score < 10) suggestions.push("상세 설명을 200자 이상 작성하세요 (+10점)");
  }

  // 3. 하이라이트 (10)
  {
    const arr = parseJsonArray<string>(property.highlights);
    const score = arr.length >= 3 ? 10 : arr.length >= 1 ? 5 : 0;
    items.push({ label: "하이라이트", score, maxScore: 10, status: statusOf(score, 10) });
    if (score < 10) suggestions.push("하이라이트를 3개 이상 입력하면 +10점");
  }

  // 4. 주변 관광지 (10)
  {
    const arr = parseJsonArray<NearbyAttraction>(property.nearbyAttractions);
    const score = arr.length >= 2 ? 10 : arr.length >= 1 ? 5 : 0;
    items.push({ label: "주변 관광지", score, maxScore: 10, status: statusOf(score, 10) });
    if (score < 10) suggestions.push("주변 관광지를 2개 이상 추가하면 +10점");
  }

  // 5. 호스트 소개 (10)
  {
    const len = property.hostIntro?.length ?? 0;
    const score = len >= 50 ? 10 : len >= 20 ? 5 : 0;
    items.push({ label: "호스트 소개", score, maxScore: 10, status: statusOf(score, 10) });
    if (score < 10) suggestions.push("호스트 소개를 50자 이상 작성하면 +10점 (E-E-A-T 강화)");
  }

  // 6. 고유 체험 (10)
  {
    const score = property.uniqueExperience && property.uniqueExperience.trim().length > 0 ? 10 : 0;
    items.push({ label: "고유 체험", score, maxScore: 10, status: statusOf(score, 10) });
    if (score < 10) suggestions.push("이 숙소만의 고유 체험을 입력하면 +10점");
  }

  // 7. 체크인/아웃 (5)
  {
    const both = !!property.checkinTime && !!property.checkoutTime;
    const one = !!property.checkinTime || !!property.checkoutTime;
    const score = both ? 5 : one ? 2 : 0;
    items.push({ label: "체크인/아웃", score, maxScore: 5, status: statusOf(score, 5) });
    if (score < 5) suggestions.push("체크인/체크아웃 시간을 모두 입력하세요 (+5점)");
  }

  // 8. 추천 계절 (5)
  {
    const score = property.bestSeason ? 5 : 0;
    items.push({ label: "추천 계절", score, maxScore: 5, status: statusOf(score, 5) });
    if (score < 5) suggestions.push("추천 계절을 입력하면 +5점");
  }

  // 9. 리뷰 수 (10)
  {
    const score = Math.min(10, reviewStats.count * 2);
    items.push({ label: "리뷰 수", score, maxScore: 10, status: statusOf(score, 10) });
    if (score < 10) suggestions.push("리뷰가 5개 이상이면 +10점 (현재 " + reviewStats.count + "개)");
  }

  // 10. 평균 별점 (5)
  {
    const score = reviewStats.avgRating >= 4.0 ? 5 : reviewStats.avgRating >= 3.0 ? 3 : 0;
    items.push({ label: "평균 별점", score, maxScore: 5, status: statusOf(score, 5) });
    if (score < 5) suggestions.push("평균 별점 4.0 이상을 유지하세요");
  }

  // 11. 답글률 (5)
  {
    const score = reviewStats.replyRate >= 0.8 ? 5 : reviewStats.replyRate >= 0.5 ? 3 : 0;
    items.push({ label: "답글률", score, maxScore: 5, status: statusOf(score, 5) });
    if (score < 5) suggestions.push("리뷰 답글률을 80% 이상으로 올리세요 (+5점)");
  }

  const total = items.reduce((sum, i) => sum + i.score, 0);
  return { total, items, suggestions };
}
