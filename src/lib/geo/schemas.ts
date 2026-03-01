/**
 * VINTEE GEO (Generative Engine Optimization) — JSON-LD 구조화 데이터 생성 유틸
 * AI 검색 엔진(ChatGPT, Perplexity, Google AI Overview)이 숙소 정보를 인용할 수 있도록 최적화
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vintee.kr";

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

interface TagLike {
  name: string;
  slug?: string;
}

interface ReviewLike {
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  user?: { name: string | null } | null;
}

interface PropertyForGEO {
  id: string;
  name: string;
  description: string;
  address: string;
  province?: string | null;
  city?: string | null;
  location?: { lat?: number; lng?: number } | unknown;
  pricePerNight: number;
  hostStory?: string | null;
  amenities?: string[];
  images?: string[];
  thumbnailUrl?: string | null;
  checkInTime?: string;
  checkOutTime?: string;
  allowsPets?: boolean;
  tags?: TagLike[];
  reviews?: ReviewLike[];
}

export interface FAQ {
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

function buildGeoDescription(property: PropertyForGEO): string {
  const province = property.province ?? "";
  const city = property.city ?? "";
  const tagNames = property.tags?.map((t) => t.name).join(", ") ?? "";
  const reviewCount = property.reviews?.length ?? 0;
  const avgRating =
    reviewCount > 0
      ? (
          (property.reviews ?? []).reduce((s, r) => s + r.rating, 0) /
          reviewCount
        ).toFixed(1)
      : null;

  const parts = [
    `${province} ${city}에 위치한 농촌 체험 숙소입니다.`.trim(),
    tagNames ? `${tagNames} 테마로 알려져 있습니다.` : "",
    avgRating
      ? `투숙객 평점 ${avgRating}점(${reviewCount}건 기준)을 받은 검증된 숙소입니다.`
      : "",
    property.hostStory ? property.hostStory.substring(0, 200) : "",
  ]
    .filter(Boolean)
    .join(" ");

  return parts || property.description;
}

function extractCoords(
  location: unknown
): { lat: number; lng: number } | null {
  if (!location || typeof location !== "object") return null;
  const loc = location as Record<string, unknown>;
  if (typeof loc.lat === "number" && typeof loc.lng === "number") {
    return { lat: loc.lat, lng: loc.lng };
  }
  return null;
}

function buildAmenityFeatures(
  amenities: string[]
): Array<{ "@type": string; name: string; value: boolean }> {
  const labelMap: Record<string, string> = {
    wifi: "Wi-Fi",
    parking: "주차장",
    kitchen: "취사 시설",
    bbq: "바베큐",
    pets: "반려동물 동반",
    pool: "수영장",
    fireplace: "벽난로",
    sauna: "사우나",
    washer: "세탁기",
  };
  return amenities.map((a) => ({
    "@type": "LocationFeatureSpecification",
    name: labelMap[a] ?? a,
    value: true,
  }));
}

// ---------------------------------------------------------------------------
// 1. LodgingBusiness 스키마 (메인)
// ---------------------------------------------------------------------------

export function generateLodgingSchema(property: PropertyForGEO) {
  const coords = extractCoords(property.location);
  const reviews = property.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${SITE_URL}/property/${property.id}`,
    name: property.name,
    description: buildGeoDescription(property),
    url: `${SITE_URL}/property/${property.id}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city ?? "",
      addressRegion: property.province ?? "",
      addressCountry: "KR",
    },
    priceRange: `₩${property.pricePerNight.toLocaleString("ko-KR")}~`,
    keywords: [
      ...(property.tags?.map((t) => t.name) ?? []),
      property.province ?? "",
      property.city ?? "",
      "농촌체험",
      "촌캉스",
      "농촌민박",
      "펜션",
    ]
      .filter(Boolean)
      .join(", "),
  };

  if (coords) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: coords.lat,
      longitude: coords.lng,
    };
  }

  const images = [
    ...(property.thumbnailUrl ? [property.thumbnailUrl] : []),
    ...(property.images ?? []),
  ].filter(Boolean);
  if (images.length > 0) schema.image = images;

  if (avgRating && reviews.length > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviews.length,
      bestRating: "5",
      worstRating: "1",
    };
  }

  if (property.amenities && property.amenities.length > 0) {
    schema.amenityFeature = buildAmenityFeatures(property.amenities);
  }

  schema.checkinTime = `T${property.checkInTime ?? "15:00"}`;
  schema.checkoutTime = `T${property.checkOutTime ?? "11:00"}`;

  if (property.allowsPets) {
    schema.petsAllowed = true;
  }

  return schema;
}

// ---------------------------------------------------------------------------
// 2. Review 스키마 (리뷰 목록)
// ---------------------------------------------------------------------------

export function generateReviewSchemas(property: PropertyForGEO) {
  return (property.reviews ?? []).slice(0, 10).map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "LodgingBusiness",
      name: property.name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: "5",
    },
    reviewBody: review.comment ?? "",
    author: {
      "@type": "Person",
      // 개인정보 마스킹: 첫 글자 + **
      name: review.user?.name
        ? review.user.name.substring(0, 1) + "**"
        : "익명",
    },
    datePublished:
      typeof review.createdAt === "string"
        ? review.createdAt.split("T")[0]
        : review.createdAt.toISOString().split("T")[0],
  }));
}

// ---------------------------------------------------------------------------
// 3. FAQ 스키마
// ---------------------------------------------------------------------------

export function buildPropertyFAQs(property: PropertyForGEO): FAQ[] {
  const faqs: FAQ[] = [];
  const province = property.province ?? "";
  const city = property.city ?? "";
  const tagNames = property.tags?.map((t) => t.name) ?? [];

  // 위치
  faqs.push({
    question: `${property.name}은(는) 어디에 위치하나요?`,
    answer: `${province} ${city} ${property.address}에 위치합니다.`.trim(),
  });

  // 가격
  faqs.push({
    question: "1박 요금은 얼마인가요?",
    answer: `1박 기준 ${property.pricePerNight.toLocaleString("ko-KR")}원부터 시작합니다. 날짜 및 인원에 따라 다를 수 있습니다.`,
  });

  // 체크인/아웃
  faqs.push({
    question: "체크인과 체크아웃 시간은 언제인가요?",
    answer: `체크인은 ${property.checkInTime ?? "오후 3시"}, 체크아웃은 ${property.checkOutTime ?? "오전 11시"}입니다.`,
  });

  // 태그 기반 FAQ
  if (tagNames.includes("#반려동물동반") || property.allowsPets) {
    faqs.push({
      question: "반려동물을 데려올 수 있나요?",
      answer:
        "네, 반려동물 동반이 가능한 숙소입니다. 단, 예약 시 사전에 반려동물 정보를 알려주세요.",
    });
  }
  if (tagNames.includes("#논뷰맛집")) {
    faqs.push({
      question: "논 뷰를 직접 볼 수 있나요?",
      answer:
        "네, 객실 창문과 테라스에서 아름다운 논 풍경을 감상할 수 있습니다. 특히 일출과 황금빛 가을 풍경이 장관입니다.",
    });
  }
  if (tagNames.includes("#아궁이체험")) {
    faqs.push({
      question: "아궁이 체험이 가능한가요?",
      answer:
        "네, 전통 아궁이 체험이 가능합니다. 장작으로 불을 지피고 군고구마를 구워 먹는 특별한 경험을 할 수 있습니다.",
    });
  }
  if (tagNames.includes("#농사체험")) {
    faqs.push({
      question: "농사 체험 프로그램이 있나요?",
      answer:
        "계절에 따라 모내기, 수확, 텃밭 가꾸기 등 다양한 농사 체험 프로그램을 운영합니다. 예약 시 문의해 주세요.",
    });
  }
  if (tagNames.includes("#개별바베큐")) {
    faqs.push({
      question: "바베큐가 가능한가요?",
      answer:
        "네, 개별 바베큐 시설이 마련되어 있습니다. 숯불 그릴을 사용할 수 있으며, 식재료는 별도로 준비하셔야 합니다.",
    });
  }

  // 취소 정책
  faqs.push({
    question: "예약 취소 정책은 어떻게 되나요?",
    answer:
      "체크인 7일 전까지 취소 시 전액 환불, 3일 전까지 취소 시 50% 환불, 그 이후 취소 시 환불이 불가합니다.",
  });

  return faqs;
}

export function generateFAQSchema(property: PropertyForGEO) {
  const faqs = buildPropertyFAQs(property);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// 4. BreadcrumbList 스키마
// ---------------------------------------------------------------------------

export function generateBreadcrumbSchema(property: PropertyForGEO) {
  const items = [
    { name: "홈", url: SITE_URL },
    { name: "숙소 탐색", url: `${SITE_URL}/explore` },
  ];

  if (property.province) {
    items.push({
      name: property.province,
      url: `${SITE_URL}/explore?region=${encodeURIComponent(property.province)}`,
    });
  }
  items.push({
    name: property.name,
    url: `${SITE_URL}/property/${property.id}`,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// 5. WebSite 스키마 (홈페이지용)
// ---------------------------------------------------------------------------

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "VINTEE (빈티)",
    url: SITE_URL,
    description:
      "한국 MZ세대를 위한 농촌 휴가 체험 큐레이션 플랫폼. #논뷰맛집, #불멍과별멍 등 감성 태그로 농촌 숙소를 발견하세요.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/explore?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "VINTEE",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// 편의 함수: 전체 스키마 배열 반환
// ---------------------------------------------------------------------------

export function generateAllPropertySchemas(property: PropertyForGEO) {
  return [
    generateLodgingSchema(property),
    generateFAQSchema(property),
    generateBreadcrumbSchema(property),
    ...generateReviewSchemas(property),
  ];
}
