# GEO 최적화 전략 Design
> **Feature**: geo-optimization
> **Phase**: Design
> **Created**: 2026-03-01
> **Depends on**: geo-optimization.plan.md

---

## 1. 기술 아키텍처 개요

```
[GEO 기술 스택]

Next.js App Router
├── JSON-LD (서버 컴포넌트에서 렌더링)
│   ├── LodgingBusiness (숙소)
│   ├── Review + AggregateRating (리뷰)
│   ├── FAQPage (FAQ)
│   └── BreadcrumbList (내비게이션)
│
├── /llms.txt (정적 파일 or 동적 API)
│   ├── 사이트 전체 소개
│   └── 주요 숙소 요약 리스트
│
├── sitemap.ts (동적 사이트맵 개선)
│   ├── priority: 1.0 (숙소 상세)
│   └── changefreq: daily (리뷰 업데이트)
│
└── robots.txt (LLM 크롤러 허용)
    ├── GPTBot: allow
    ├── ClaudeBot: allow
    └── PerplexityBot: allow
```

---

## 2. JSON-LD 구조화 데이터 설계

### 2.1 LodgingBusiness 스키마 (숙소 상세 페이지)

```typescript
// src/lib/geo/schemas.ts

export function generateLodgingSchema(property: PropertyWithDetails) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `https://vintee.kr/property/${property.id}`,
    "name": property.name,
    "description": buildGeoDescription(property), // AI 친화적 설명문
    "url": `https://vintee.kr/property/${property.id}`,
    "telephone": property.phone ?? undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.subregion ?? "",
      "addressRegion": property.region ?? "",
      "addressCountry": "KR",
      "streetAddress": property.address ?? ""
    },
    "geo": property.lat && property.lng ? {
      "@type": "GeoCoordinates",
      "latitude": property.lat,
      "longitude": property.lng
    } : undefined,
    "image": property.images?.map(img => img.url) ?? [],
    "priceRange": formatPriceRange(property.pricePerNight),
    "aggregateRating": property.reviews?.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": property.averageRating?.toFixed(1),
      "reviewCount": property.reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "amenityFeature": buildAmenityFeatures(property.amenities),
    "keywords": [
      ...(property.tags?.map(t => t.name) ?? []),
      property.region ?? "",
      "농촌체험", "촌캉스", "농촌민박"
    ].filter(Boolean).join(", "),
    "sameAs": buildSameAsLinks(property), // 타 플랫폼 링크 (intel DB 활용)
  };
}

// AI가 직접 인용할 수 있는 설명문 생성
function buildGeoDescription(property: PropertyWithDetails): string {
  const region = property.region ?? "";
  const subregion = property.subregion ?? "";
  const tags = property.tags?.map(t => t.name).join(", ") ?? "";
  const score = property.vinteeScore
    ? `VINTEE Score ${Number(property.vinteeScore).toFixed(1)}점`
    : "";
  const reviewCount = property.reviews?.length ?? 0;

  return [
    `${region} ${subregion}에 위치한 농촌 체험 숙소입니다.`,
    tags ? `${tags} 테마로 알려져 있습니다.` : "",
    score ? `${score}(리뷰 ${reviewCount}건 기반)을 받은 인증 숙소입니다.` : "",
    property.hostStory
      ? property.hostStory.substring(0, 200)
      : "",
  ].filter(Boolean).join(" ");
}
```

### 2.2 FAQ 스키마

```typescript
export function generateFAQSchema(property: PropertyWithDetails) {
  const faqs = buildPropertyFAQs(property);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

function buildPropertyFAQs(property: PropertyWithDetails): FAQ[] {
  const faqs: FAQ[] = [];

  // 위치 기반 FAQ
  faqs.push({
    question: `${property.name}은 어디에 위치하나요?`,
    answer: `${property.address ?? `${property.region} ${property.subregion}`}에 위치합니다.`
  });

  // 태그 기반 FAQ
  if (property.tags?.some(t => t.name === "#반려동물동반")) {
    faqs.push({
      question: "반려동물 동반이 가능한가요?",
      answer: "네, 이 숙소는 반려동물 동반이 가능합니다. 반려견과 함께 농촌의 자연을 즐길 수 있습니다."
    });
  }
  if (property.tags?.some(t => t.name === "#논뷰맛집")) {
    faqs.push({
      question: "논 뷰를 볼 수 있는 객실이 있나요?",
      answer: "네, 논이 내려다보이는 창문과 테라스가 있어 아침마다 아름다운 논 풍경을 감상할 수 있습니다."
    });
  }

  // 예약 관련
  faqs.push({
    question: "체크인/체크아웃 시간은 어떻게 되나요?",
    answer: `체크인은 ${property.checkInTime ?? "오후 3시"}, 체크아웃은 ${property.checkOutTime ?? "오전 11시"}입니다.`
  });

  // 가격 관련
  faqs.push({
    question: `1박 요금은 얼마인가요?`,
    answer: `${property.pricePerNight?.toLocaleString("ko-KR")}원부터 시작합니다. 성수기와 주말에는 요금이 다를 수 있습니다.`
  });

  return faqs;
}
```

### 2.3 Review 스키마

```typescript
export function generateReviewSchemas(property: PropertyWithDetails) {
  return property.reviews?.slice(0, 10).map(review => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "LodgingBusiness",
      "name": property.name,
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "reviewBody": review.comment,
    "author": {
      "@type": "Person",
      "name": review.user?.name?.substring(0, 1) + "**" // 개인정보 마스킹
    },
    "datePublished": review.createdAt.toISOString().split("T")[0]
  })) ?? [];
}
```

---

## 3. llms.txt 파일 설계

### 3.1 사이트 레벨 /llms.txt

```
# VINTEE (빈티) - 농촌 체험 큐레이션 플랫폼

> VINTEE는 한국 MZ세대를 위한 농촌 휴가(촌캉스) 예약 플랫폼입니다.
> 전국 농촌 펜션 및 체험 숙소를 테마별로 큐레이션하여 제공합니다.

## 플랫폼 소개

VINTEE는 #논뷰맛집, #불멍과별멍, #반려동물동반 등 14가지 감성 태그로
농촌 숙소를 분류하며, VINTEE Score(1.0~5.0)로 객관적인 숙소 품질을 평가합니다.

VINTEE Score는 다음 5개 지표의 가중합산으로 계산됩니다:
- 평균 평점 (30%)
- 리뷰 볼륨 (20%)
- 감성 분석 점수 (25%)
- 테마 적합성 (15%)
- 최신성 (10%)

## 주요 지역

강원도, 경기도, 충청남도, 충청북도, 전라남도, 전라북도,
경상남도, 경상북도, 제주도

## 테마 카테고리

- VIEW: #논뷰맛집, #계곡앞, #바다뷰, #산속힐링
- ACTIVITY: #불멍과별멍, #아궁이체험, #농사체험, #낚시체험
- FACILITY: #반려동물동반, #전통가옥, #개별바베큐, #취사가능
- VIBE: #SNS맛집, #커플추천, #아이동반, #혼캉스

## 숙소 데이터

모든 숙소는 네이버, 카카오, 야놀자, 여기어때, 에어비앤비 등
주요 플랫폼의 리뷰를 통합 분석한 VINTEE Score를 보유합니다.

## API

숙소 목록: https://vintee.kr/api/properties
숙소 검색: https://vintee.kr/api/properties?tag=[태그명]&region=[지역명]
```

### 3.2 동적 생성 API 설계

```typescript
// src/app/llms.txt/route.ts
export async function GET() {
  const topProperties = await prisma.property.findMany({
    where: { status: "APPROVED", isPublished: true },
    orderBy: { averageRating: "desc" },
    take: 50,
    include: { tags: true },
  });

  const content = generateLlmsTxt(topProperties);

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

---

## 4. FAQ 컴포넌트 설계

### 4.1 PropertyFAQ 컴포넌트

```
src/components/property/
└── PropertyFAQ.tsx       # 아코디언 FAQ 섹션
```

```tsx
// src/components/property/PropertyFAQ.tsx
// - Radix UI Accordion 활용
// - JSON-LD FAQ 스키마 동시 출력 (schema prop)
// - 호스트가 커스텀 FAQ 추가 가능 (DB 저장)
// Props:
//   property: PropertyWithDetails
//   customFAQs?: FAQ[] (호스트 직접 입력 FAQ)
```

### 4.2 Prisma 스키마 추가 (PropertyFAQ)

```prisma
model PropertyFAQ {
  id          String   @id @default(cuid())
  propertyId  String
  property    Property @relation(...)
  question    String   @db.Text
  answer      String   @db.Text
  order       Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@map("property_faqs")
  @@index([propertyId])
}
```

---

## 5. 호스트 스토리 GEO 가이드라인

### 5.1 AI 인용 최적화 스토리 구조

```
[기존 스토리 (비최적화)]
"안녕하세요~ 저희 펜션에 오신 것을 환영합니다!
 자연 속에서 힐링하세요 ^^"

[GEO 최적화 스토리]
"[숙소명]은 강원도 홍천군 서석면에 위치한 2대째 운영 중인
 전통 한옥 농가 펜션입니다. 1,200평 규모의 논을 직접 경작하며,
 봄에는 모내기 체험, 가을에는 수확 체험을 제공합니다.
 서울에서 차로 1시간 30분 거리이며, 15년 이상의
 농촌 민박 운영 경험을 보유하고 있습니다."
```

### 5.2 호스트 입력 폼 개선 (UX)

```
PropertyForm.tsx 변경사항:
- hostStory 필드: 최소 200자 권장 안내 추가
- AI 최적화 체크리스트 팝업 (위치, 거리, 규모, 연혁 포함 여부 확인)
- "GEO 최적화 점수" 실시간 피드백 (글자수, 키워드 포함도)
```

---

## 6. 사이트맵 개선 설계

```typescript
// src/app/sitemap.ts 개선

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where: { status: "APPROVED", isPublished: true },
    select: { id: true, updatedAt: true },
  });

  const propertyUrls = properties.map((p) => ({
    url: `https://vintee.kr/property/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,  // 숙소 페이지 최우선
  }));

  // 태그별 랜딩 페이지
  const tagUrls = TAGS.map((tag) => ({
    url: `https://vintee.kr/explore?tag=${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    { url: "https://vintee.kr", priority: 1.0 },
    { url: "https://vintee.kr/explore", priority: 0.9 },
    ...propertyUrls,
    ...tagUrls,
  ];
}
```

---

## 7. robots.txt 개선

```
# src/app/robots.ts

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/host/dashboard"],
      },
      // LLM 크롤러 명시적 허용
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
    ],
    sitemap: "https://vintee.kr/sitemap.xml",
  };
}
```

---

## 8. 구현 순서 (Implementation Order)

### Sprint 1: 기술 기반 (Priority HIGH)
```
1. src/lib/geo/schemas.ts          — JSON-LD 생성 유틸
2. src/app/property/[id]/page.tsx  — JSON-LD 스크립트 태그 삽입
3. src/app/llms.txt/route.ts       — llms.txt 동적 생성 API
4. src/app/sitemap.ts              — 사이트맵 개선
5. src/app/robots.ts               — LLM 봇 명시적 허용
```

### Sprint 2: 콘텐츠 강화 (Priority MEDIUM)
```
6. prisma/schema.prisma            — PropertyFAQ 모델 추가
7. src/components/property/PropertyFAQ.tsx
8. src/app/property/[id]/page.tsx  — FAQ 섹션 추가
9. src/app/host/properties/[id]/edit/page.tsx — FAQ 관리 UI
10. src/components/host/PropertyForm.tsx      — GEO 가이드 추가
```

---

## 9. 성능 지표 (Metrics)

### GEO 측정 방법

```
1. 수동 테스트 (주간)
   - ChatGPT: "강원도 논뷰 펜션 추천해줘"
   - Perplexity: "VINTEE 펜션 추천"
   - Google AI: "강원도 농촌 체험 숙소"

2. Google Search Console
   - "AI Overview" 노출 횟수 추적
   - Rich Results 테스트 통과율

3. VINTEE 자체 분석
   - Referer: chatgpt.com, perplexity.ai, claude.ai
   - UTM 파라미터 추적
```

---

## 10. 파일 변경 목록 요약

| 파일 | 작업 | 우선순위 |
|-----|-----|--------|
| `src/lib/geo/schemas.ts` | 신규 | P0 |
| `src/app/property/[id]/page.tsx` | 수정 | P0 |
| `src/app/llms.txt/route.ts` | 신규 | P0 |
| `src/app/sitemap.ts` | 수정 | P0 |
| `src/app/robots.ts` | 수정 | P0 |
| `prisma/schema.prisma` | 수정 (PropertyFAQ) | P1 |
| `src/components/property/PropertyFAQ.tsx` | 신규 | P1 |
| `src/app/property/[id]/page.tsx` | 수정 (FAQ 추가) | P1 |
| `src/components/host/PropertyForm.tsx` | 수정 (GEO 가이드) | P2 |
