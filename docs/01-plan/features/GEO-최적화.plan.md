# Plan: GEO (Generative Engine Optimization) 최적화

**Feature**: GEO-최적화
**Phase**: Plan
**Created**: 2026-04-06
**Project**: VINTEE (농촌 휴가 체험 큐레이션 플랫폼)
**Level**: Dynamic
**대상**: 등록 펜션(호스트) 회원의 숙소가 AI 검색엔진에서 추천되도록 최적화

---

## 1. 배경 및 목적

### 문제 정의

기존 SEO(Search Engine Optimization)는 Google/Naver 검색 결과 노출에 집중하지만,
**2025년 이후 사용자의 검색 행동이 AI 검색엔진으로 이동**하고 있다.

- ChatGPT → "충남 아산 근처 한옥 펜션 추천해줘"
- Perplexity → "가족 여행 좋은 농촌 숙소"
- Google AI Overview → "촌캉스 추천 숙소 TOP 5"
- Naver Cue → "제주 감귤 농장 체험 숙소"

이러한 **Generative AI 검색엔진(GE)**이 VINTEE 숙소를 **인용(citation)하고 추천**하도록 최적화하는 것이 GEO의 핵심이다.

### 목표

1. AI 검색엔진이 VINTEE 숙소 페이지를 **크롤링하고 이해**할 수 있도록 구조화
2. AI가 숙소를 **추천 답변에 인용(cite)**할 확률을 높이는 콘텐츠 전략
3. 호스트(펜션 회원)에게 **GEO 점수 및 가이드**를 제공하여 자발적 품질 향상 유도

---

## 2. GEO vs SEO 차이점

| 항목 | SEO | GEO |
|------|-----|-----|
| 대상 | Google/Naver 크롤러 | ChatGPT, Perplexity, Gemini |
| 목표 | 검색 결과 상위 노출 | AI 답변에 인용/추천 |
| 핵심 요소 | 키워드, 백링크, 메타태그 | 구조화 데이터, 신뢰성, 고유 정보 |
| 콘텐츠 | 키워드 밀도 | **인용 가능한 팩트** (가격, 위치, 특징) |
| 기술 | sitemap, robots.txt | JSON-LD, 시맨틱 HTML, FAQ 스키마 |
| 신호 | PageRank, CTR | **E-E-A-T** (경험, 전문성, 권위, 신뢰) |

---

## 3. GEO 전략 5대 축

### 3.1 구조화 데이터 (Schema.org JSON-LD)

AI 검색엔진이 숙소 정보를 정확히 파싱할 수 있도록 **JSON-LD 구조화 데이터**를 모든 숙소 상세 페이지에 삽입.

```json
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "논뷰 한옥 펜션",
  "description": "넓은 논 풍경이 펼쳐지는 전통 한옥 펜션...",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "충남",
    "addressLocality": "아산",
    "streetAddress": "탕정면 매곡리 123"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 36.785,
    "longitude": 127.004
  },
  "priceRange": "₩120,000/박",
  "amenityFeature": ["바비큐", "주차장", "와이파이"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.8,
    "reviewCount": 12
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "홍*동" },
      "reviewRating": { "@type": "Rating", "ratingValue": 5 },
      "reviewBody": "논 풍경이 정말 아름다웠어요..."
    }
  ],
  "telephone": "010-1234-5678",
  "url": "https://vintee.kr/property/prop-001",
  "image": "https://vintee.kr/images/prop-001.jpg",
  "checkinTime": "15:00",
  "checkoutTime": "11:00",
  "numberOfRooms": 3,
  "petsAllowed": false
}
```

**구현 위치**: `src/app/property/[id]/page.tsx` — `<script type="application/ld+json">`

---

### 3.2 인용 가능한 팩트 콘텐츠 (Citable Facts)

AI 엔진은 **구체적 숫자와 팩트**를 인용한다. 호스트가 입력하는 정보를 구조화하여 AI가 인용하기 쉬운 형태로 노출.

#### 호스트 입력 필드 추가 (Property 모델 확장)

| 필드 | 설명 | GEO 효과 |
|------|------|---------|
| `checkinTime` | 체크인 시간 (15:00) | 시간 팩트 인용 |
| `checkoutTime` | 체크아웃 시간 (11:00) | 시간 팩트 인용 |
| `highlights` | 숙소 하이라이트 3~5개 | "바비큐 가능, 논뷰, 한옥" |
| `nearbyAttractions` | 주변 관광지 (JSON) | "○○사찰 차로 10분" |
| `bestSeason` | 추천 계절 | "가을 단풍 시즌 추천" |
| `hostIntro` | 호스트 소개 (E-E-A-T) | 경험/전문성 신호 |
| `uniqueExperience` | 고유 체험 프로그램 | "감귤 따기, 한복 입기" |

#### 페이지 콘텐츠 구조

```html
<article>
  <h1>논뷰 한옥 펜션 — 충남 아산</h1>
  
  <section aria-label="핵심 정보">
    <p>1박 가격: 120,000원 | 최대 6명 | 체크인 15:00 | 체크아웃 11:00</p>
  </section>
  
  <section aria-label="숙소 하이라이트">
    <h2>이 숙소의 특별한 점</h2>
    <ul>
      <li>넓은 논뷰 전망 — 사계절 다른 풍경</li>
      <li>전통 한옥 구조 — 온돌 체험</li>
      <li>마당 바비큐 — 장작 무료 제공</li>
    </ul>
  </section>
  
  <section aria-label="주변 관광지">
    <h2>주변 볼거리</h2>
    <ul>
      <li>현충사 — 차로 15분</li>
      <li>아산 온천 — 차로 10분</li>
      <li>외암민속마을 — 차로 20분</li>
    </ul>
  </section>
  
  <section aria-label="호스트 소개">
    <h2>호스트 김호스트</h2>
    <p>아산에서 3대째 한옥을 운영하고 있습니다. 10년 넘게 촌캉스 숙소를 운영하며...</p>
  </section>
  
  <section aria-label="후기">
    <h2>후기 12개 · 평균 4.8점</h2>
    <!-- ReviewList -->
  </section>
</article>
```

---

### 3.3 FAQ 스키마 (FAQPage JSON-LD)

AI 검색엔진이 질문-답변 형태로 인용할 수 있도록 **FAQ 구조화 데이터** 자동 생성.

#### 자동 생성 FAQ 로직

숙소 데이터 기반으로 FAQ를 자동 생성:

```
Q: "논뷰 한옥 펜션의 1박 가격은 얼마인가요?"
A: "논뷰 한옥 펜션의 1박 가격은 120,000원이며, 최대 6명까지 숙박 가능합니다."

Q: "체크인/체크아웃 시간은 언제인가요?"
A: "체크인은 15:00, 체크아웃은 11:00입니다."

Q: "주변에 어떤 관광지가 있나요?"
A: "현충사(차로 15분), 아산 온천(차로 10분), 외암민속마을(차로 20분)이 있습니다."

Q: "바비큐가 가능한가요?"
A: "네, 마당에서 바비큐가 가능하며 장작이 무료로 제공됩니다."

Q: "후기 평점은 어떤가요?"
A: "12개 후기 기준 평균 4.8점입니다. 게스트들은 논뷰 전망과 한옥 분위기를 높이 평가합니다."
```

#### JSON-LD FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "논뷰 한옥 펜션의 1박 가격은?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "120,000원이며, 최대 6명까지 숙박 가능합니다."
      }
    }
  ]
}
```

---

### 3.4 호스트 GEO 스코어 대시보드

호스트에게 **GEO 최적화 점수**를 보여주고, 어떤 정보를 추가하면 AI 검색엔진 노출이 높아지는지 가이드.

#### GEO 점수 계산 기준 (100점 만점)

| 항목 | 배점 | 조건 |
|------|:----:|------|
| 기본 정보 완성도 | 20 | title, description, location, price, maxGuests |
| 상세 설명 길이 | 10 | description >= 200자 |
| 하이라이트 | 10 | highlights 3개 이상 |
| 주변 관광지 | 10 | nearbyAttractions 2개 이상 |
| 호스트 소개 | 10 | hostIntro >= 50자 |
| 고유 체험 | 10 | uniqueExperience 입력 |
| 체크인/아웃 시간 | 5 | checkinTime + checkoutTime |
| 추천 계절 | 5 | bestSeason 입력 |
| 리뷰 수 | 10 | 리뷰 5개 이상 = 만점, 1개당 2점 |
| 평균 별점 | 5 | 4.0 이상 = 만점, 3점대 = 3점 |
| 호스트 답글률 | 5 | 80% 이상 = 만점 |

#### 대시보드 UI

```
┌─────────────────────────────────────────┐
│ GEO 점수                                │
│                                         │
│ 72 / 100  ████████████░░░░              │
│                                         │
│ ✅ 기본 정보 완성 (20/20)                │
│ ✅ 상세 설명 (10/10)                     │
│ ⚠️ 하이라이트 미입력 (0/10)              │
│ ⚠️ 주변 관광지 미입력 (0/10)             │
│ ✅ 호스트 소개 (10/10)                   │
│ ❌ 고유 체험 미입력 (0/10)               │
│ ✅ 체크인/아웃 시간 (5/5)                │
│ ✅ 추천 계절 (5/5)                       │
│ ✅ 리뷰 12개 (10/10)                    │
│ ✅ 평균 4.8점 (5/5)                     │
│ ⚠️ 답글률 60% (3/5)                    │
│                                         │
│ 💡 개선 제안:                            │
│ · 하이라이트를 3개 이상 입력하면 +10점    │
│ · 주변 관광지를 추가하면 +10점           │
│ · 고유 체험을 입력하면 +10점             │
│                                         │
│ [정보 수정하기]                          │
└─────────────────────────────────────────┘
```

---

### 3.5 llms.txt / ai.txt 크롤링 허용

AI 검색엔진 크롤러에게 사이트 구조를 알려주는 **llms.txt** 파일 제공.

#### /public/llms.txt

```
# VINTEE — 농촌 휴가 체험 큐레이션 플랫폼

## 소개
VINTEE는 한국의 농촌 지역 숙소(한옥 펜션, 산골 오두막, 농장 스테이 등)를 큐레이션하는 플랫폼입니다.
촌캉스(촌+바캉스)를 즐기고 싶은 여행자에게 검증된 숙소 정보와 실제 게스트 리뷰를 제공합니다.

## 주요 페이지
- /properties — 전체 숙소 리스트 (검색/필터 가능)
- /property/{id} — 숙소 상세 (가격, 위치, 리뷰, FAQ)
- /properties?location=제주 — 지역별 숙소

## 데이터 형식
- 모든 숙소 상세 페이지에 Schema.org LodgingBusiness JSON-LD 제공
- 리뷰는 Schema.org Review JSON-LD 포함
- FAQ는 Schema.org FAQPage JSON-LD 포함

## 연락처
- 웹사이트: https://vintee.kr
- 이메일: contact@vintee.kr
```

#### robots.txt AI 크롤러 허용

```
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: *
Allow: /
Disallow: /api/
Disallow: /host/
Disallow: /bookings/

Sitemap: https://vintee.kr/sitemap.xml
```

---

## 4. 구현 우선순위

| 순서 | 항목 | 우선순위 | 난이도 | GEO 효과 |
|:----:|------|:--------:|:------:|:--------:|
| 1 | JSON-LD LodgingBusiness 스키마 | P0 | 소 | ★★★★★ |
| 2 | 시맨틱 HTML 구조 (article/section) | P0 | 소 | ★★★★ |
| 3 | FAQ 자동 생성 + FAQPage JSON-LD | P0 | 중 | ★★★★★ |
| 4 | llms.txt + robots.txt AI 허용 | P0 | 소 | ★★★★ |
| 5 | Property 모델 GEO 필드 추가 | P1 | 중 | ★★★ |
| 6 | 숙소 등록/수정 폼 GEO 필드 | P1 | 중 | ★★★ |
| 7 | GEO 스코어 대시보드 | P1 | 대 | ★★★★ |
| 8 | sitemap.xml 자동 생성 | P1 | 소 | ★★★ |
| 9 | 호스트 GEO 가이드 페이지 | P2 | 소 | ★★ |

---

## 5. 기대 효과

### 정량적 목표

| 지표 | 현재 | 목표 (3개월) |
|------|:----:|:-----------:|
| AI 검색엔진 인용 횟수 | 0 | 50+ |
| ChatGPT 추천 답변 포함률 | 0% | 20%+ |
| Perplexity 소스 인용 | 0 | 30+ |
| 호스트 평균 GEO 점수 | - | 70/100 |
| 구조화 데이터 적용률 | 0% | 100% |

### 정성적 효과

- **호스트 가치 제안**: "VINTEE에 등록하면 AI 검색에서 추천됩니다"
- **차별화**: 야놀자/여기어때 등 기존 OTA 대비 GEO 선점
- **콜드 스타트 해소**: AI가 추천하면 사용자 유입 → 리뷰 증가 → AI 추천 강화 선순환

---

## 6. 지도 기반 위치 서비스 (GEO Map)

GEO 최적화와 함께, 등록 펜션을 **지도 위에 시각적으로 표시**하여 사용자 경험을 향상시킨다.

### 6.1 숙소 지도 뷰 (/properties/map)

```
┌──────────────────────────────────────────────┐
│ [리스트 뷰]  [지도 뷰]                        │
├──────────────────────────────────────────────┤
│                                              │
│   🏠 논뷰 한옥        ┌─────────────────┐   │
│   ₩12만               │                 │   │
│                        │   Kakao Map     │   │
│        🏠 산골 오두막   │                 │   │
│        ₩8만            │   📍📍📍         │   │
│                        │                 │   │
│   🏠 감귤 농장         │                 │   │
│   ₩15만               └─────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

**기능:**
- Kakao Map SDK (무료, 한국 지도 최적화)
- 숙소 마커 클릭 → 미니 카드 팝업 (이름, 가격, 평점)
- 지도 이동/줌 시 해당 영역 숙소 실시간 필터
- 리스트 뷰 ↔ 지도 뷰 토글

**구현:**
- 라이브러리: `react-kakao-maps-sdk`
- Property 모델의 `latitude`, `longitude` 활용 (이미 존재)
- API: `GET /api/properties?bounds=lat1,lng1,lat2,lng2` (지도 영역 필터)

### 6.2 숙소 상세 지도

숙소 상세 페이지(`/property/[id]`)에 **위치 지도 + 주변 관광지** 표시.

```
┌─────────────────────────────────────┐
│ 위치                                │
│ ┌─────────────────────────────┐    │
│ │                             │    │
│ │   Kakao Map                 │    │
│ │       📍 논뷰 한옥 펜션      │    │
│ │                             │    │
│ └─────────────────────────────┘    │
│ 충남 아산시 탕정면 매곡리 123       │
│                                    │
│ 주변 관광지                         │
│ · 🏛️ 현충사 — 차로 15분 (8.2km)   │
│ · ♨️ 아산 온천 — 차로 10분 (5.1km) │
│ · 🏘️ 외암민속마을 — 차로 20분     │
└─────────────────────────────────────┘
```

**기능:**
- 숙소 위치 마커 + 주변 관광지 마커
- 주변 관광지는 호스트가 `nearbyAttractions` 필드에 입력
- 길찾기 링크 (Kakao Map 앱 연동)

### 6.3 위치 기반 검색

사용자의 현재 위치 또는 원하는 지역 중심으로 **반경 검색**.

```
GET /api/properties?lat=36.785&lng=127.004&radius=30
```

**기능:**
- 반경 30km 이내 숙소 검색 (SQLite Haversine 공식)
- "내 주변 숙소" 버튼 (Geolocation API)
- 거리순 정렬 옵션

**SQLite 거리 계산:**
```sql
SELECT *, 
  (6371 * acos(
    cos(radians(?)) * cos(radians(latitude)) * 
    cos(radians(longitude) - radians(?)) + 
    sin(radians(?)) * sin(radians(latitude))
  )) AS distance
FROM Property
WHERE status = 'active'
HAVING distance < ?
ORDER BY distance
```

### 6.4 구현 우선순위

| 순서 | 항목 | 우선순위 | 난이도 |
|:----:|------|:--------:|:------:|
| 1 | 숙소 상세 지도 (단일 마커) | P0 | 소 |
| 2 | 숙소 리스팅 지도 뷰 | P1 | 중 |
| 3 | 주변 관광지 마커 | P1 | 소 |
| 4 | 위치 기반 반경 검색 | P2 | 중 |
| 5 | 지도 영역 기반 실시간 필터 | P2 | 대 |

### 6.5 기술 스택

| 항목 | 선택 | 근거 |
|------|------|------|
| 지도 SDK | Kakao Map | 한국 지도 정확도 최고, 무료 |
| React 바인딩 | `react-kakao-maps-sdk` | Next.js 호환, 타입 지원 |
| 좌표 데이터 | Property.latitude/longitude | 이미 스키마에 존재 |
| 거리 계산 | Haversine (SQL raw query) | SQLite 호환 |

---

## 7. 의존성

- **Sprint 2 완료** (SEO 메타데이터 기반 확보)
- **호스트 숙소 등록 폼** (GEO 필드 추가)
- **리뷰 시스템** (리뷰 데이터 → JSON-LD 변환)
- **Kakao Map API 키 발급** (https://developers.kakao.com)

---

## 8. 다음 단계

```
/pdca design GEO-최적화
```

설계 문서에서 다룰 내용:
- JSON-LD 컴포넌트 상세 구현
- FAQ 자동 생성 로직
- GEO 스코어 계산 유틸리티
- Property 모델 마이그레이션 스펙
- GEO 대시보드 컴포넌트 설계

---

*작성: Claude Opus 4.6 with VINTEE Engineering Team*
*PDCA Phase: Plan*
