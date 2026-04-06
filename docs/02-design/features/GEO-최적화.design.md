# Design: GEO 최적화 (AI 검색 + 지도 위치 서비스)

**Feature**: GEO-최적화
**Phase**: Design
**Date**: 2026-04-06
**Status**: In Progress
**Plan Reference**: `docs/01-plan/features/GEO-최적화.plan.md`

---

## 1. DB 스키마 변경 (Property 모델 GEO 필드 추가)

### 마이그레이션 스펙

```prisma
model Property {
  // 기존 필드 유지 + 아래 추가

  // GEO 필드
  checkinTime       String?   // "15:00"
  checkoutTime      String?   // "11:00"
  highlights        String    @default("[]")  // JSON: ["논뷰 전망", "바비큐", "한옥"]
  nearbyAttractions String    @default("[]")  // JSON: [{"name":"현충사","distance":"차로 15분"}]
  bestSeason        String?   // "가을", "봄/가을", "사계절"
  hostIntro         String?   // 호스트 자기소개 (E-E-A-T)
  uniqueExperience  String?   // 고유 체험: "감귤 따기, 한복 입기"
  petsAllowed       Boolean   @default(false)
  numberOfRooms     Int       @default(1)
}
```

---

## 2. JSON-LD 컴포넌트 설계

### 2.1 PropertyJsonLd

```tsx
// src/components/seo/PropertyJsonLd.tsx
interface PropertyJsonLdProps {
  property: {
    title: string;
    description: string | null;
    location: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    pricePerNight: number | null;
    amenities: string;        // JSON array string
    phone: string | null;
    thumbnailUrl: string | null;
    checkinTime: string | null;
    checkoutTime: string | null;
    numberOfRooms: number;
    petsAllowed: boolean;
    maxGuests: number;
  };
  reviews: {
    rating: number;
    content: string;
    guestName: string;
  }[];
  summary: {
    avgRating: number;
    totalCount: number;
  };
  url: string;
}
```

**출력 JSON-LD:**

```json
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "...",
  "description": "...",
  "address": { "@type": "PostalAddress", ... },
  "geo": { "@type": "GeoCoordinates", ... },
  "priceRange": "₩120,000/박",
  "amenityFeature": [...],
  "aggregateRating": { "@type": "AggregateRating", ... },
  "review": [...],
  "checkinTime": "15:00",
  "checkoutTime": "11:00",
  "numberOfRooms": 3,
  "petsAllowed": false
}
```

**배치 위치:** `src/app/property/[id]/page.tsx` → `<head>` 내 `<script type="application/ld+json">`

### 2.2 FaqJsonLd

```tsx
// src/components/seo/FaqJsonLd.tsx
interface FaqJsonLdProps {
  property: {
    title: string;
    pricePerNight: number | null;
    maxGuests: number;
    checkinTime: string | null;
    checkoutTime: string | null;
    nearbyAttractions: string; // JSON
    highlights: string;        // JSON
    petsAllowed: boolean;
  };
  summary: {
    avgRating: number;
    totalCount: number;
  };
}
```

**자동 생성 FAQ 로직:**

```typescript
// src/lib/utils/geo.ts

export function generateFaqs(property: PropertyForFaq, summary: ReviewSummary): Faq[] {
  const faqs: Faq[] = [];

  // 가격 FAQ
  if (property.pricePerNight) {
    faqs.push({
      question: `${property.title}의 1박 가격은 얼마인가요?`,
      answer: `${property.title}의 1박 가격은 ${property.pricePerNight.toLocaleString()}원이며, 최대 ${property.maxGuests}명까지 숙박 가능합니다.`,
    });
  }

  // 체크인/아웃 FAQ
  if (property.checkinTime && property.checkoutTime) {
    faqs.push({
      question: `체크인/체크아웃 시간은 언제인가요?`,
      answer: `체크인은 ${property.checkinTime}, 체크아웃은 ${property.checkoutTime}입니다.`,
    });
  }

  // 주변 관광지 FAQ
  const attractions = JSON.parse(property.nearbyAttractions || "[]");
  if (attractions.length > 0) {
    const list = attractions.map((a: {name: string; distance: string}) => `${a.name}(${a.distance})`).join(", ");
    faqs.push({
      question: `주변에 어떤 관광지가 있나요?`,
      answer: `${list} 등이 있습니다.`,
    });
  }

  // 편의시설/하이라이트 FAQ
  const highlights = JSON.parse(property.highlights || "[]");
  if (highlights.length > 0) {
    faqs.push({
      question: `이 숙소의 특별한 점은 무엇인가요?`,
      answer: highlights.join(", ") + " 등이 있습니다.",
    });
  }

  // 반려동물 FAQ
  faqs.push({
    question: `반려동물을 데려갈 수 있나요?`,
    answer: property.petsAllowed
      ? "네, 반려동물 동반이 가능합니다."
      : "아쉽게도 반려동물 동반이 불가합니다.",
  });

  // 리뷰 FAQ
  if (summary.totalCount > 0) {
    faqs.push({
      question: `후기 평점은 어떤가요?`,
      answer: `${summary.totalCount}개 후기 기준 평균 ${summary.avgRating.toFixed(1)}점입니다.`,
    });
  }

  return faqs;
}
```

---

## 3. GEO 스코어 유틸리티

### 계산 함수

```typescript
// src/lib/utils/geo-score.ts

interface GeoScoreResult {
  total: number;        // 0-100
  items: GeoScoreItem[];
  suggestions: string[];
}

interface GeoScoreItem {
  label: string;
  score: number;
  maxScore: number;
  status: "pass" | "warn" | "fail";
}

export function calculateGeoScore(
  property: PropertyForGeo,
  reviewStats: { count: number; avgRating: number; replyRate: number }
): GeoScoreResult
```

### 점수 배점

| 항목 | 배점 | 계산 로직 |
|------|:----:|----------|
| 기본 정보 완성 | 20 | title + description + location + price + maxGuests 모두 존재 |
| 상세 설명 길이 | 10 | description >= 200자 → 10, >= 100자 → 5, else 0 |
| 하이라이트 | 10 | highlights 3개 이상 → 10, 1-2개 → 5, 0 → 0 |
| 주변 관광지 | 10 | nearbyAttractions 2개 이상 → 10, 1개 → 5, 0 → 0 |
| 호스트 소개 | 10 | hostIntro >= 50자 → 10, >= 20자 → 5, else 0 |
| 고유 체험 | 10 | uniqueExperience 입력 → 10, else 0 |
| 체크인/아웃 | 5 | 둘 다 입력 → 5, 하나만 → 2, 없음 → 0 |
| 추천 계절 | 5 | bestSeason 입력 → 5, else 0 |
| 리뷰 수 | 10 | 5개 이상 → 10, 1개당 2점 |
| 평균 별점 | 5 | 4.0 이상 → 5, 3.0 이상 → 3, else 0 |
| 답글률 | 5 | 80% 이상 → 5, 50% 이상 → 3, else 0 |

---

## 4. 페이지 설계

### 4.1 숙소 상세 페이지 구조 개선 (`/property/[id]`)

```
┌──────────────────────────────────────────────────┐
│ <article itemscope itemtype="LodgingBusiness">   │
│                                                  │
│ <header>                                         │
│   <h1>논뷰 한옥 펜션 — 충남 아산</h1>              │
│   120,000원/박 · 최대 6명 · 체크인 15:00          │
│ </header>                                        │
│                                                  │
│ <section aria-label="숙소 소개">                   │
│   <p>넓은 논 풍경이 펼쳐지는 전통 한옥 펜션...</p>  │
│ </section>                                       │
│                                                  │
│ <section aria-label="하이라이트">                   │
│   · 논뷰 전망 · 바비큐 가능 · 온돌 체험            │
│ </section>                                       │
│                                                  │
│ <section aria-label="위치">                       │
│   [Kakao Map 지도]                               │
│   주변: 현충사(15분), 아산온천(10분)               │
│ </section>                                       │
│                                                  │
│ <section aria-label="호스트 소개">                  │
│   김호스트 · 아산에서 3대째 한옥 운영...            │
│ </section>                                       │
│                                                  │
│ <section aria-label="자주 묻는 질문">               │
│   FAQ 아코디언 UI                                │
│ </section>                                       │
│                                                  │
│ <section aria-label="후기">                       │
│   ReviewList                                     │
│ </section>                                       │
│                                                  │
│ </article>                                       │
│                                                  │
│ [예약 폼 사이드바]                                │
│                                                  │
│ <script type="application/ld+json">              │
│   LodgingBusiness + FAQPage                      │
│ </script>                                        │
└──────────────────────────────────────────────────┘
```

### 4.2 GEO 스코어 대시보드 (`/host/geo`)

```
┌─────────────────────────────────────────┐
│ GEO 최적화 점수                          │
│                                         │
│ ┌─── 숙소 선택 ─────────────────────┐  │
│ │ [논뷰 한옥 펜션 ▼]                │  │
│ └──────────────────────────────────┘  │
│                                         │
│ 72 / 100  ████████████████░░░░░░░      │
│                                         │
│ ┌─ 항목별 점수 ────────────────────┐  │
│ │ ✅ 기본 정보        20/20        │  │
│ │ ✅ 상세 설명        10/10        │  │
│ │ ⚠️ 하이라이트       0/10        │  │
│ │ ⚠️ 주변 관광지      0/10        │  │
│ │ ✅ 호스트 소개      10/10        │  │
│ │ ❌ 고유 체험         0/10        │  │
│ │ ✅ 체크인/아웃       5/5         │  │
│ │ ✅ 추천 계절         5/5         │  │
│ │ ✅ 리뷰             10/10        │  │
│ │ ✅ 평균 별점         5/5         │  │
│ │ ⚠️ 답글률           2/5         │  │
│ └──────────────────────────────────┘  │
│                                         │
│ 💡 개선 제안                            │
│ · 하이라이트를 3개 이상 입력하면 +10점    │
│ · 주변 관광지를 추가하면 +10점           │
│ · 고유 체험을 입력하면 +10점             │
│                                         │
│ [숙소 정보 수정하기]                     │
└─────────────────────────────────────────┘
```

### 4.3 숙소 등록/수정 폼 GEO 필드 추가

기존 `/host/properties/new` 및 `/host/properties/[id]/edit` 폼에 GEO 섹션 추가:

```
─── 기본 정보 (기존) ───
숙소명, 소개, 지역, 주소, 가격, 최대 인원

─── GEO 최적화 정보 (신규) ───
체크인 시간   [15:00]
체크아웃 시간  [11:00]
하이라이트    [+ 추가] 논뷰 전망 ✕ | 바비큐 가능 ✕ | 온돌 체험 ✕
주변 관광지   [+ 추가] 현충사 / 차로 15분 ✕
추천 계절     [사계절 ▼]
고유 체험     [감귤 따기, 한복 입기]
호스트 소개   [아산에서 3대째 한옥을 운영...]
반려동물 가능  [□]
객실 수      [3]
```

### 4.4 지도 컴포넌트

#### PropertyMap (숙소 상세)

```tsx
// src/components/map/PropertyMap.tsx
interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  nearbyAttractions?: { name: string; distance: string }[];
}
```

- Kakao Map SDK `<Map>` + `<MapMarker>`
- 숙소 위치 마커 (메인)
- 주변 관광지 마커 (보조, 다른 색상)
- 길찾기 버튼 → Kakao Map 앱 딥링크

#### PropertiesMap (리스팅 지도 뷰)

```tsx
// src/components/map/PropertiesMap.tsx
interface PropertiesMapProps {
  properties: {
    id: string;
    title: string;
    latitude: number | null;
    longitude: number | null;
    pricePerNight: number | null;
    avgRating: number;
  }[];
}
```

- 복수 마커 렌더링
- 마커 클릭 → 미니 카드 인포윈도우 (이름, 가격, 평점)
- 카드 클릭 → `/property/[id]` 이동

---

## 5. API 스펙

### 5.1 숙소 위치 기반 검색

```
GET /api/properties?lat=36.785&lng=127.004&radius=30

Response 200:
{
  properties: [...],
  center: { lat, lng },
  radius: 30
}
```

**구현:** Prisma raw query + Haversine 공식

```typescript
// SQLite Haversine (km 단위)
const haversine = `
  (6371 * acos(
    cos(radians(${lat})) * cos(radians(latitude)) *
    cos(radians(longitude) - radians(${lng})) +
    sin(radians(${lat})) * sin(radians(latitude))
  ))
`;
```

**주의:** SQLite에는 `radians()`, `acos()` 등 삼각함수가 없음.
→ **대안:** JavaScript에서 모든 active 숙소를 조회 후 메모리에서 필터링 (숙소 수 < 1000이면 성능 문제 없음)

```typescript
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

### 5.2 GEO 스코어 API

```
GET /api/host/geo-score?propertyId=prop-001

Response 200:
{
  total: 72,
  items: [
    { label: "기본 정보", score: 20, maxScore: 20, status: "pass" },
    { label: "하이라이트", score: 0, maxScore: 10, status: "fail" },
    ...
  ],
  suggestions: [
    "하이라이트를 3개 이상 입력하면 +10점",
    ...
  ]
}
```

---

## 6. 정적 파일

### 6.1 llms.txt

**경로:** `public/llms.txt`
**내용:** Plan 문서 3.5절 참조

### 6.2 robots.txt 업데이트

**경로:** `public/robots.txt`
**내용:** GPTBot, ChatGPT-User, PerplexityBot, Google-Extended Allow

### 6.3 sitemap.xml 동적 생성

```tsx
// src/app/sitemap.ts
import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where: { status: "active" },
    select: { id: true, updatedAt: true },
  });

  return [
    { url: "https://vintee.kr", lastModified: new Date(), priority: 1.0 },
    { url: "https://vintee.kr/properties", lastModified: new Date(), priority: 0.9 },
    ...properties.map((p) => ({
      url: `https://vintee.kr/property/${p.id}`,
      lastModified: p.updatedAt,
      priority: 0.8,
    })),
  ];
}
```

---

## 7. 구현 파일 목록 (Implementation Checklist)

### DB

- [ ] `prisma/schema.prisma` — Property 모델 GEO 필드 추가
- [ ] `prisma/migrations/xxx_geo_fields/` — 마이그레이션

### SEO 컴포넌트

- [ ] `src/components/seo/PropertyJsonLd.tsx` — LodgingBusiness JSON-LD
- [ ] `src/components/seo/FaqJsonLd.tsx` — FAQPage JSON-LD

### 유틸리티

- [ ] `src/lib/utils/geo.ts` — generateFaqs(), haversineDistance()
- [ ] `src/lib/utils/geo-score.ts` — calculateGeoScore()

### 지도 컴포넌트

- [ ] `src/components/map/PropertyMap.tsx` — 숙소 상세 지도
- [ ] `src/components/map/PropertiesMap.tsx` — 리스팅 지도 뷰

### 페이지

- [ ] `src/app/property/[id]/page.tsx` — 시맨틱 HTML + JSON-LD + FAQ + 지도 통합
- [ ] `src/app/properties/page.tsx` — 리스트/지도 뷰 토글 추가
- [ ] `src/app/host/geo/page.tsx` — GEO 스코어 대시보드
- [ ] `src/app/host/properties/new/page.tsx` — GEO 필드 추가
- [ ] `src/app/host/properties/[id]/edit/page.tsx` — GEO 필드 추가

### API

- [ ] `src/app/api/properties/route.ts` — lat/lng/radius 파라미터 추가
- [ ] `src/app/api/host/geo-score/route.ts` — GEO 스코어 API

### 정적 파일

- [ ] `public/llms.txt`
- [ ] `public/robots.txt`
- [ ] `src/app/sitemap.ts`

---

## 8. 구현 순서

```
Phase 1: 기반 (P0)
  1. Property 모델 GEO 필드 마이그레이션
  2. PropertyJsonLd 컴포넌트
  3. FaqJsonLd 컴포넌트 + generateFaqs()
  4. 숙소 상세 페이지 시맨틱 HTML 리팩토링
  5. llms.txt + robots.txt + sitemap.ts

Phase 2: 호스트 도구 (P1)
  6. 숙소 등록/수정 폼 GEO 필드 추가
  7. calculateGeoScore() 유틸리티
  8. GEO 스코어 대시보드 (/host/geo)
  9. GEO 스코어 API

Phase 3: 지도 (P1)
  10. PropertyMap 컴포넌트 (숙소 상세)
  11. 숙소 상세 페이지 지도 섹션 추가
  12. haversineDistance() + 위치 기반 검색 API
  13. PropertiesMap + 리스팅 지도 뷰 토글

Phase 4: 시드 데이터
  14. 시드 데이터에 GEO 필드 추가
```

---

*작성: Claude Opus 4.6 with VINTEE Engineering Team*
*PDCA Phase: Design*
