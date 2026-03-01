# US-01: 테마 기반 숙소 발견

**Story ID**: US-01
**Epic**: Epic 2 - 테마 기반 발견
**상태**: ✅ 완료 (83%)
**우선순위**: P0 (Critical)
**작성일**: 2026-02-10

---

## User Story

**As a** MZ세대 여행객 (20-30대 직장인)
**I want to** 감성 태그(#논뷰맛집, #불멍과별멍 등)로 숙소를 발견하고 필터링하기
**So that** 스펙 나열이 아닌 내가 원하는 경험 중심으로 빠르게 숙소를 선택할 수 있다

---

## 배경 (Background)

기존 숙박 플랫폼(에어비앤비, 여기어때)은 지역 기반 검색과 스펙 나열 방식으로 운영되어, MZ세대가 원하는 **감성적 경험**을 찾기 어렵다. VINTEE는 **테마 태그** 중심의 큐레이션으로 차별화한다.

### 문제점 (Pain Points)
- 에어비앤비: "서울 근교" 검색 → 수백 개 결과 → 하나씩 클릭해서 확인 (피로도 ↑)
- 여기어때: 가격/평점 필터만 제공 → 감성적 선택 불가능
- 농촌체험마을: 검색 기능 부실 → 원하는 숙소 찾기 어려움

### 기대 효과 (Expected Benefits)
- 평균 검색 시간 80% 단축 (30분 → 6분)
- 예약 전환율 3% → 5% 향상 (테마 매칭으로 만족도 ↑)
- 재방문율 30% → 50% 향상 (맞춤형 발견 경험)

---

## 시나리오 (Scenarios)

### Scenario 1: 논 뷰가 보이는 힐링 숙소 찾기

**Context**: 서울 직장인 지수(28세)는 주말에 논이 보이는 조용한 펜션에서 쉬고 싶다.

**Steps**:
1. VINTEE 홈페이지 접속 (`/`)
2. 상단 검색바에서 **"#논뷰맛집"** 태그 클릭
3. 필터링된 숙소 리스트 확인 (`/explore?tag=논뷰맛집`)
   - 8개 숙소 표시 (전국)
   - 각 카드에 대표 이미지 + 태그 배지 표시
4. 첫 번째 숙소 "논뷰 힐링 펜션" 클릭
5. 숙소 상세 페이지에서 갤러리 확인
   - 논 전망 사진 5장
   - 호스트 스토리: "아침마다 논을 바라보며 커피 한잔..."
6. 날짜 선택 (다음 주 토요일~일요일)
7. 예약하기 버튼 클릭
8. 체크아웃 페이지로 이동

**Expected Outcome**:
- ✅ 검색 시간 30분 → 5분으로 단축
- ✅ 원하는 경험(논 뷰)을 정확히 찾음
- ✅ 호스트 스토리로 신뢰감 형성

---

### Scenario 2: 반려동물 동반 가능한 독채 숙소 찾기

**Context**: 프리랜서 은지(32세)는 반려견과 함께 주말 여행을 계획 중이다.

**Steps**:
1. VINTEE 탐색 페이지 접속 (`/explore`)
2. 좌측 필터 사이드바에서 **"#반려동물동반"** 태그 선택
3. 추가 필터 적용:
   - 지역: 경기도
   - 가격: 5만원 ~ 10만원
   - 인원: 2명
   - 반려동물: 가능 ✅
4. 필터링된 결과 3개 표시
5. "반려견 천국 독채 펜션" 선택
6. 숙소 상세 페이지에서 확인:
   - 넓은 마당 사진 (반려견 자유 활동 가능)
   - 호스트 스토리: "저희 펜션은 반려견 2마리와 함께..."
   - 편의시설: 울타리 마당, 배변 패드 제공
7. 날짜 선택 후 예약

**Expected Outcome**:
- ✅ 반려동물 동반 가능한 숙소만 필터링
- ✅ 추가 필터로 정확한 매칭
- ✅ 호스트 스토리로 안심감 제공

---

### Scenario 3: 불멍과 별멍 가능한 커플 숙소 찾기

**Context**: IT 개발자 민호(30세)는 여자친구와 기념일 여행을 준비 중이다.

**Steps**:
1. VINTEE 홈페이지 접속
2. 테마 섹션에서 **"#불멍과별멍"** 태그 클릭
3. 필터링된 결과 12개 표시
4. 추가 필터:
   - 지역: 강원도
   - 가격: 10만원 ~ 15만원
   - 태그 추가: #커플추천
5. 최종 결과 4개 표시
6. "별빛 캠프파이어 독채" 선택
7. 숙소 상세 페이지:
   - 캠프파이어 사진 5장
   - 별 관측 포인트 사진
   - 호스트 스토리: "저희 펜션은 광공해가 없어..."
8. 관련 숙소 추천 확인 (같은 태그)
9. 날짜 선택 후 예약

**Expected Outcome**:
- ✅ 복합 태그 필터링으로 정확한 매칭
- ✅ 로맨틱한 경험 제공
- ✅ 관련 숙소 추천으로 추가 탐색 가능

---

## 수락 기준 (Acceptance Criteria)

### AC-1: 태그 시스템
- [ ] 16개 태그가 4개 카테고리로 분류되어 있다
  - VIEW: #논뷰맛집, #계곡앞, #바다뷰, #산속힐링
  - ACTIVITY: #불멍과별멍, #아궁이체험, #농사체험, #낚시체험
  - FACILITY: #반려동물동반, #전통가옥, #개별바베큐, #취사가능
  - VIBE: #SNS맛집, #커플추천, #아이동반, #혼캉스
- [ ] 각 태그는 고유한 slug를 가진다 (URL-friendly)
- [ ] 태그는 숙소와 다대다 관계로 연결된다

### AC-2: 검색 및 필터링
- [ ] 홈페이지에서 태그를 클릭하면 `/explore?tag={slug}`로 이동한다
- [ ] 탐색 페이지에서 텍스트 검색이 가능하다 (숙소명, 지역, 태그)
- [ ] 좌측 필터 사이드바에서 복합 필터가 가능하다:
  - [ ] 가격 범위 (슬라이더)
  - [ ] 지역 (드롭다운)
  - [ ] 체크인/체크아웃 날짜 (캘린더)
  - [ ] 인원 (카운터)
  - [ ] 반려동물 동반 여부 (체크박스)
  - [ ] 태그 (복수 선택)
- [ ] 필터 적용 시 URL 쿼리 파라미터가 업데이트된다
- [ ] 필터 초기화 버튼이 제공된다

### AC-3: 숙소 리스트 표시
- [ ] 필터링된 숙소가 카드 형식으로 표시된다
- [ ] 각 카드는 다음을 포함한다:
  - [ ] 대표 이미지 (1:1 비율)
  - [ ] 숙소명 (최대 2줄)
  - [ ] 태그 배지 (최대 3개)
  - [ ] 가격 (1박 기준)
  - [ ] 지역 (시/군)
  - [ ] 하트 아이콘 (위시리스트 - 향후 구현)
- [ ] 카드 호버 시 그림자 효과 적용
- [ ] 카드 클릭 시 숙소 상세 페이지로 이동

### AC-4: 숙소 상세 페이지
- [ ] 갤러리 섹션 (이미지 슬라이더, 최대 10장)
- [ ] 숙소 정보 섹션:
  - [ ] 숙소명 + 지역
  - [ ] 태그 배지 (모두 표시)
  - [ ] 호스트 스토리 (최대 500자)
  - [ ] 편의시설 리스트 (아이콘 + 텍스트)
  - [ ] 체크인/체크아웃 시간
  - [ ] 취소 정책
- [ ] 예약 위젯 (우측 고정):
  - [ ] 날짜 선택 (캘린더)
  - [ ] 인원 선택 (카운터)
  - [ ] 가격 계산 (1박 × 박수)
  - [ ] 예약하기 버튼
- [ ] 관련 숙소 추천 (같은 태그, 최대 4개)

### AC-5: 성능 및 UX
- [ ] 초기 로딩 시간 3초 이내
- [ ] 필터 적용 시 1초 이내 결과 표시
- [ ] 모바일 반응형 (375px ~ 1920px)
- [ ] 태그 배지는 색상으로 카테고리 구분
  - VIEW: 녹색
  - ACTIVITY: 주황색
  - FACILITY: 파란색
  - VIBE: 보라색

---

## 기술 구현 (Technical Implementation)

### 프론트엔드

**컴포넌트 구조**:
```
src/components/
├── explore/
│   ├── SearchBar.tsx         // 텍스트 검색 (Next.js App Router)
│   ├── FilterSidebar.tsx     // 좌측 필터 (가격, 지역, 날짜, 태그)
│   ├── PropertyList.tsx      // 숙소 카드 리스트
│   └── PropertyCard.tsx      // 개별 숙소 카드
├── property/
│   ├── PropertyGallery.tsx   // 이미지 갤러리
│   ├── PropertyInfo.tsx      // 숙소 정보
│   ├── BookingWidget.tsx     // 예약 위젯
│   └── RelatedProperties.tsx // 관련 숙소
└── tag/
    ├── TagBadge.tsx          // 태그 배지 (카테고리별 색상)
    ├── TagList.tsx           // 태그 리스트
    └── ThemeSection.tsx      // 홈페이지 테마 섹션
```

**페이지 라우팅**:
```
src/app/
├── page.tsx                  // 홈페이지 (테마 섹션)
├── explore/
│   └── page.tsx              // 탐색 페이지 (/explore?tag=논뷰맛집)
└── property/[id]/
    └── page.tsx              // 숙소 상세 (/property/clxxxxx)
```

---

### 백엔드

**API Endpoints**:
```typescript
// 1. 태그 목록 조회
GET /api/tags
Response:
{
  "tags": [
    {
      "id": "cltag001",
      "name": "논뷰맛집",
      "slug": "rice-field-view",
      "category": "VIEW",
      "description": "논이 한눈에 들어오는 숙소",
      "_count": { "properties": 8 }
    },
    ...
  ]
}

// 2. 숙소 목록 조회 (필터링)
GET /api/properties?tag=논뷰맛집&region=경기도&minPrice=50000&maxPrice=100000
Response:
{
  "properties": [
    {
      "id": "clprop001",
      "name": "논뷰 힐링 펜션",
      "address": "경기도 양평군...",
      "pricePerNight": 80000,
      "images": ["https://...", ...],
      "tags": [
        { "name": "논뷰맛집", "slug": "rice-field-view", "category": "VIEW" }
      ],
      "amenities": ["Wi-Fi", "주차", "BBQ"],
      "rating": 4.8,
      "reviewCount": 12
    },
    ...
  ],
  "total": 8,
  "page": 1,
  "limit": 20
}

// 3. 숙소 상세 조회
GET /api/properties/clprop001
Response:
{
  "id": "clprop001",
  "name": "논뷰 힐링 펜션",
  "address": "경기도 양평군...",
  "pricePerNight": 80000,
  "images": ["https://...", ...],
  "tags": [...],
  "amenities": [...],
  "hostStory": "저희 펜션은 아침마다...",
  "checkIn": "15:00",
  "checkOut": "11:00",
  "cancellationPolicy": "체크인 7일 전까지 전액 환불",
  "host": {
    "id": "clhost001",
    "name": "박영수",
    "profileImage": "https://...",
    "approvalStatus": "APPROVED"
  }
}
```

---

### 데이터베이스

**Prisma Schema** (관련 모델):
```prisma
model Tag {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  category    TagCategory
  description String?
  properties  Property[] @relation("PropertyTags")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum TagCategory {
  VIEW
  ACTIVITY
  FACILITY
  VIBE
}

model Property {
  id            String   @id @default(cuid())
  name          String
  address       String
  pricePerNight Int
  images        String[]
  hostStory     String   @db.Text
  amenities     String[]
  tags          Tag[]    @relation("PropertyTags")
  hostId        String
  host          HostProfile @relation(...)
  // ...
}
```

---

## 테스트 시나리오 (Test Scenarios)

### E2E Test (Playwright)

```typescript
// tests/theme-discovery.spec.ts
import { test, expect } from '@playwright/test';

test('사용자가 #논뷰맛집 태그로 숙소를 발견할 수 있다', async ({ page }) => {
  // 1. 홈페이지 접속
  await page.goto('/');

  // 2. #논뷰맛집 태그 클릭
  await page.click('text=#논뷰맛집');

  // 3. 탐색 페이지로 이동 확인
  await expect(page).toHaveURL(/\/explore\?tag=rice-field-view/);

  // 4. 필터링된 숙소 카드 확인
  const propertyCards = page.locator('.property-card');
  await expect(propertyCards).toHaveCount(8);

  // 5. 각 카드에 #논뷰맛집 태그 배지가 있는지 확인
  const tagBadges = page.locator('[data-testid="tag-badge"]:has-text("논뷰맛집")');
  await expect(tagBadges).toHaveCount(8);

  // 6. 첫 번째 숙소 클릭
  await propertyCards.first().click();

  // 7. 숙소 상세 페이지로 이동 확인
  await expect(page).toHaveURL(/\/property\/clprop\w+/);

  // 8. 갤러리 이미지 확인 (최소 1장)
  const galleryImages = page.locator('[data-testid="gallery-image"]');
  await expect(galleryImages).toHaveCountGreaterThan(0);

  // 9. 호스트 스토리 확인
  await expect(page.locator('[data-testid="host-story"]')).toBeVisible();

  // 10. 예약 위젯 확인
  await expect(page.locator('[data-testid="booking-widget"]')).toBeVisible();
});

test('사용자가 복합 필터를 적용할 수 있다', async ({ page }) => {
  await page.goto('/explore');

  // 1. 태그 선택
  await page.click('[data-testid="tag-filter-논뷰맛집"]');

  // 2. 가격 범위 선택
  await page.fill('[data-testid="price-min"]', '50000');
  await page.fill('[data-testid="price-max"]', '100000');

  // 3. 지역 선택
  await page.selectOption('[data-testid="region-filter"]', '경기도');

  // 4. 필터 적용 버튼 클릭
  await page.click('[data-testid="apply-filters"]');

  // 5. URL 쿼리 파라미터 확인
  await expect(page).toHaveURL(/tag=rice-field-view.*minPrice=50000.*maxPrice=100000.*region=경기도/);

  // 6. 필터링된 결과 확인
  const propertyCards = page.locator('.property-card');
  await expect(propertyCards.count()).toBeGreaterThan(0);
});
```

---

## 디자인 참고 (Design Reference)

### SLDS 스타일 적용

**Card 컴포넌트** (PropertyCard):
```tsx
<Card className="border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow duration-200">
  <div className="relative">
    <Image
      src={property.images[0]}
      alt={property.name}
      className="w-full h-48 object-cover rounded-t"
    />
    <Button className="absolute top-2 right-2 bg-white/80 hover:bg-white">
      <Heart className="w-4 h-4" />
    </Button>
  </div>
  <CardHeader className="bg-gray-50 px-4 py-3 border-b">
    <CardTitle className="text-lg font-bold text-[#16325C] line-clamp-2">
      {property.name}
    </CardTitle>
  </CardHeader>
  <CardContent className="p-4">
    <div className="flex gap-1 mb-2">
      {property.tags.slice(0, 3).map(tag => (
        <TagBadge key={tag.id} tag={tag} />
      ))}
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{property.region}</span>
      <span className="text-lg font-bold text-[#00A1E0]">
        {property.pricePerNight.toLocaleString()}원/박
      </span>
    </div>
  </CardContent>
</Card>
```

**Tag Badge**:
```tsx
// 카테고리별 색상 매핑
const categoryColors = {
  VIEW: 'bg-green-100 text-green-800',
  ACTIVITY: 'bg-orange-100 text-orange-800',
  FACILITY: 'bg-blue-100 text-blue-800',
  VIBE: 'bg-purple-100 text-purple-800',
};

<Badge className={cn(
  'text-xs px-2 py-1 rounded',
  categoryColors[tag.category]
)}>
  #{tag.name}
</Badge>
```

---

## 우선순위 (Priority)

**P0 (Critical)**: MVP 핵심 기능
- ✅ 태그 시스템 구축 (16개 태그)
- ✅ 텍스트 검색
- ✅ 숙소 리스트 표시
- ✅ 숙소 상세 페이지

**P1 (High)**: MVP 완성
- ✅ 고급 필터 (가격, 지역, 날짜, 인원)
- ✅ 관련 숙소 추천
- ⏸️ 숙소 리스팅 페이지 UI/UX 개선 (진행 중)

**P2 (Medium)**: Post-MVP
- 🔮 위시리스트 기능
- 🔮 AI 기반 개인화 추천
- 🔮 태그 자동 제안 (호스트 등록 시)

---

## 관련 문서

- **Epic**: `/docs/epic.md`
- **API 문서**: `/docs/architecture/api-reference.md` (TBD)
- **디자인 가이드**: `/docs/architecture/design-system.md` (TBD)
- **Prisma Schema**: `/prisma/schema.prisma`

---

**마지막 업데이트**: 2026-02-10
**작성자**: Claude Sonnet 4.5 with Gagahoho Engineering Team
