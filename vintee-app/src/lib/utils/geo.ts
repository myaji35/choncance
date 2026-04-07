// GEO 최적화 공용 유틸

export interface NearbyAttraction {
  name: string;
  distance: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface PropertyForFaq {
  title: string;
  pricePerNight: number | null;
  maxGuests: number;
  checkinTime: string | null;
  checkoutTime: string | null;
  nearbyAttractions: string;
  highlights: string;
  petsAllowed: boolean;
}

export interface ReviewSummary {
  avgRating: number;
  totalCount: number;
}

/** 안전 JSON 파싱 */
export function parseJsonArray<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Property → 자동 생성 FAQ */
export function generateFaqs(property: PropertyForFaq, summary: ReviewSummary): Faq[] {
  const faqs: Faq[] = [];

  if (property.pricePerNight) {
    faqs.push({
      question: `${property.title}의 1박 가격은 얼마인가요?`,
      answer: `${property.title}의 1박 가격은 ${property.pricePerNight.toLocaleString()}원이며, 최대 ${property.maxGuests}명까지 숙박 가능합니다.`,
    });
  }

  if (property.checkinTime && property.checkoutTime) {
    faqs.push({
      question: "체크인/체크아웃 시간은 언제인가요?",
      answer: `체크인은 ${property.checkinTime}, 체크아웃은 ${property.checkoutTime}입니다.`,
    });
  }

  const attractions = parseJsonArray<NearbyAttraction>(property.nearbyAttractions);
  if (attractions.length > 0) {
    const list = attractions.map((a) => `${a.name}(${a.distance})`).join(", ");
    faqs.push({
      question: "주변에 어떤 관광지가 있나요?",
      answer: `${list} 등이 있습니다.`,
    });
  }

  const highlights = parseJsonArray<string>(property.highlights);
  if (highlights.length > 0) {
    faqs.push({
      question: "이 숙소의 특별한 점은 무엇인가요?",
      answer: highlights.join(", ") + " 등이 있습니다.",
    });
  }

  faqs.push({
    question: "반려동물을 데려갈 수 있나요?",
    answer: property.petsAllowed
      ? "네, 반려동물 동반이 가능합니다."
      : "아쉽게도 반려동물 동반이 불가합니다.",
  });

  if (summary.totalCount > 0) {
    faqs.push({
      question: "후기 평점은 어떤가요?",
      answer: `${summary.totalCount}개 후기 기준 평균 ${summary.avgRating.toFixed(1)}점입니다.`,
    });
  }

  return faqs;
}

/** Haversine 거리 (km) */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
