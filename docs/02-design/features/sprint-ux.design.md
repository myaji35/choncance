# VINTEE Sprint-UX 상세 설계 문서

> **Plan 참조**: `docs/01-plan/features/sprint-ux.plan.md`
> **작성일**: 2026-03-01
> **목표**: UX 완성도 70% → 90%+ (핵심 사용자 여정 3가지 완성)

---

## 1. 시스템 현황 분석

### 1.1 기존 구현 자산 (재사용 가능)

```
재사용 확정 컴포넌트:
├── src/components/review/review-card.tsx      ✅ (props: id, rating, content, images, user, hostReply)
├── src/components/review/review-form.tsx      ✅ (리뷰 작성 폼)
├── src/components/host/image-upload.tsx       ✅ (dnd-kit DnD, 멀티업로드)
├── src/components/booking/booking-widget.tsx  ✅ (날짜 선택 + checkAvailability API)
└── src/app/property/[id]/page.tsx             ✅ (이미 reviews 쿼리 있음, 단 count=0 숨김)

기존 API (재사용):
├── GET /api/reviews?propertyId={id}           ✅
├── GET /api/availability/check                ✅ (price breakdown 포함)
└── POST /api/host/properties                  ✅
```

### 1.2 핵심 발견사항

**UX-01 (리뷰)**: `property/[id]/page.tsx`에 이미 리뷰 쿼리가 있으나
`averageRating.count > 0` 조건으로 **리뷰 없을 때 섹션 자체가 숨겨짐**.
→ Empty State 추가만 하면 됨. 최소 수정.

**UX-02 (가격)**: `BookingWidget`의 `priceBreakdown`은 `/api/availability/check`
응답의 `data.price`를 받음. API 응답 구조 확인 후 명세 UI만 추가.

**UX-03 (폼)**: `PropertyRegistrationForm`이 단일 긴 폼으로 구현됨.
→ 동일 state/submit 로직을 유지하며 **5단계 Step UI만 씌우는** 방식으로 최소화.

---

## 2. UX-01: 숙소 상세 리뷰 섹션

### 2.1 설계 목표

```
Before: 리뷰 0개 → 섹션 미표시 (신뢰 공백)
After:  리뷰 0개 → Empty State + "첫 리뷰 남기기" CTA
        리뷰 N개 → 평점 요약 + 카드 목록 (최대 6개) + "더보기"
```

### 2.2 변경 파일

**수정: `src/app/property/[id]/page.tsx`**

```diff
- {averageRating.count > 0 && (
+ {/* Reviews Section - 항상 표시, count=0이면 Empty State */}
+ (
  <section className="py-8 border-t">
+   <div className="flex items-center justify-between mb-6">
+     <h2 className="text-2xl font-bold flex items-center gap-2">
+       <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
+       리뷰
+       {averageRating.count > 0 && (
+         <span className="text-gray-500 font-normal text-lg">
+           {averageRating.average.toFixed(1)} ({averageRating.count}개)
+         </span>
+       )}
+     </h2>
+   </div>
+
+   {averageRating.count === 0 ? (
+     <EmptyState
+       icon="star"
+       title="아직 리뷰가 없어요"
+       description="이 숙소에 첫 번째 리뷰를 남겨보세요"
+     />
+   ) : (
      <div className="space-y-4">
        {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
      </div>
+   )}
  </section>
- )}
```

**신규: `src/components/ui/empty-state.tsx`**

```tsx
interface EmptyStateProps {
  icon: "star" | "calendar" | "home" | "search" | "inbox"
  title: string
  description?: string
  action?: { label: string; href?: string; onClick?: () => void }
}
```

### 2.3 데이터 플로우

```
property/[id]/page.tsx (Server Component)
  ├── prisma.review.findMany({ propertyId, take: 6 })
  ├── prisma.review.aggregate({ _avg: { rating: true }, _count: true })
  └── → ReviewSection (inline) or EmptyState
```

### 2.4 UI 레이아웃

```
┌─────────────────────────────────────────┐
│ ⭐ 리뷰  4.7 (12개)                      │
├─────────────────────────────────────────┤
│ [ReviewCard] [ReviewCard] [ReviewCard]  │
│ [ReviewCard] [ReviewCard] [ReviewCard]  │
│                                         │
│         더 많은 리뷰 보기 →             │
└─────────────────────────────────────────┘

리뷰 없을 때:
┌─────────────────────────────────────────┐
│ ⭐ 리뷰                                  │
├─────────────────────────────────────────┤
│        ☆                                │
│   아직 리뷰가 없어요                     │
│   이 숙소에 첫 번째 리뷰를 남겨보세요    │
└─────────────────────────────────────────┘
```

---

## 3. UX-02: 예약 가격 명세 개선

### 3.1 설계 목표

```
Before: "총 ₩150,000" (합계만)
After:  숙박비  ₩50,000 × 2박 (평일) = ₩100,000
        숙박비  ₩60,000 × 1박 (주말) = ₩ 60,000
        서비스 수수료 (10%)           = ₩ 16,000
        ─────────────────────────────
        총 결제금액                   = ₩176,000
```

### 3.2 평일/주말 판별 로직

```typescript
// 평일: 월(1)~목(4), 주말: 금(5)~일(0)
const WEEKEND_DAYS = [0, 5, 6]; // 일, 금, 토

function classifyNights(checkIn: Date, checkOut: Date) {
  let weekdayNights = 0;
  let weekendNights = 0;
  const current = new Date(checkIn);

  while (current < checkOut) {
    const day = current.getDay();
    if (WEEKEND_DAYS.includes(day)) {
      weekendNights++;
    } else {
      weekdayNights++;
    }
    current.setDate(current.getDate() + 1);
  }
  return { weekdayNights, weekendNights };
}
```

### 3.3 API 응답 구조 확인 및 신규 필드

`/api/availability/check` 응답의 `price` 객체에 명세 필드 추가:

```typescript
// 현재 응답 (추정):
{ available: true, price: { total: 150000, nights: 3 } }

// 목표 응답:
{
  available: true,
  price: {
    weekdayNights: 2,
    weekendNights: 1,
    weekdayPrice: 50000,    // property.pricePerNight
    weekendPrice: 60000,    // property.weekendPrice (없으면 pricePerNight × 1.2)
    accommodationCost: 160000,
    serviceFee: 16000,      // Math.round(accommodationCost × 0.1)
    total: 176000,
    nights: 3,
  }
}
```

### 3.4 변경 파일

**수정: `src/app/api/availability/check/route.ts`**
- `price` 응답에 `weekdayNights`, `weekendNights`, `weekdayPrice`, `weekendPrice`, `accommodationCost`, `serviceFee` 추가

**신규: `src/components/booking/price-breakdown.tsx`**

```tsx
interface PriceBreakdownProps {
  breakdown: {
    weekdayNights: number
    weekendNights: number
    weekdayPrice: number
    weekendPrice: number
    accommodationCost: number
    serviceFee: number
    total: number
  }
}

export function PriceBreakdown({ breakdown }: PriceBreakdownProps) {
  // 숙박비 명세 행 (평일/주말 분리)
  // 서비스 수수료 행
  // 합계 행 (굵게)
}
```

**수정: `src/components/booking/booking-widget.tsx`**
- `priceBreakdown` 표시 부분에 `<PriceBreakdown>` 컴포넌트 삽입

### 3.5 UI 레이아웃

```
┌─────────────────────────────────┐
│ 날짜 선택 후 가격 명세:          │
├─────────────────────────────────┤
│ 숙박비 (평일 2박)               │
│   ₩50,000 × 2 = ₩100,000      │
│ 숙박비 (주말 1박)               │
│   ₩60,000 × 1 = ₩ 60,000      │
├─────────────────────────────────┤
│ 서비스 수수료 (10%)   ₩ 16,000  │
├═════════════════════════════════│
│ 총 결제금액         ₩176,000    │
└─────────────────────────────────┘
```

---

## 4. UX-03: 멀티스텝 숙소 등록 폼

### 4.1 설계 목표

```
Before: 단일 긴 스크롤 폼 (이탈율 ~60%)
After:  5단계 가이드 폼 + Progress Bar + localStorage 임시저장
```

### 4.2 5단계 구성

| Step | 제목 | 필드 | 필수 |
|------|------|------|------|
| 1 | 기본 정보 | 이름, 유형, 시/도, 상세주소, 최대인원 | ✅ |
| 2 | 시설 & 편의 | 편의시설(체크박스), 반려동물 허용, 체크인/아웃 시간 | - |
| 3 | 사진 업로드 | 이미지 (최소 3장, 최대 20장), DnD 순서 변경 | ✅ |
| 4 | 스토리 & 태그 | 호스트 스토리(50자+), 테마 태그(1개+), 이용 규칙 | ✅ |
| 5 | 가격 & 제출 | 평일 요금, 주말 요금(선택), 할인율, 요약 확인 | ✅ |

### 4.3 컴포넌트 구조

```
src/components/host/property-registration/
├── multi-step-form.tsx          # 컨테이너 (step 상태 관리)
├── step-progress.tsx            # Progress Bar + 단계 표시
├── step-1-basic.tsx             # 기본 정보
├── step-2-amenities.tsx         # 시설
├── step-3-photos.tsx            # 이미지 (image-upload 재활용)
├── step-4-story.tsx             # 스토리 & 태그
└── step-5-pricing.tsx           # 가격 & 제출
```

### 4.4 상태 관리 설계

```typescript
// multi-step-form.tsx
interface FormDraft {
  step: number;
  data: {
    name: string; type: string; province: string; city: string;
    address: string; maxGuests: number;           // Step 1
    amenities: string[]; allowsPets: boolean;
    checkInTime: string; checkOutTime: string;    // Step 2
    images: string[]; thumbnailIndex: number;     // Step 3
    hostStory: string; selectedTags: string[];
    rules: string;                               // Step 4
    pricePerNight: number; weekendPrice?: number;
    discountRate?: number;                       // Step 5
  }
}

// localStorage 키: "vintee_property_draft"
// 저장 시점: 각 Step "다음" 클릭 시
// 복원 시점: 폼 마운트 시 (useEffect)
// 삭제 시점: 제출 성공 후
```

### 4.5 네비게이션 로직

```typescript
const [currentStep, setCurrentStep] = useState(1);
const TOTAL_STEPS = 5;

const goNext = () => {
  if (validateCurrentStep()) {
    saveDraftToLocalStorage();
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  }
};

const goPrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

const handleSubmit = async () => {
  // 기존 PropertyRegistrationForm의 handleSubmit 로직 이동
  // POST /api/host/properties (기존 API 재활용)
};
```

### 4.6 Progress Bar UI

```
Step 1/5: 기본 정보
━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░  20%

[이전]                               [다음 →]
```

### 4.7 기존 폼과의 차이점

```
변경 없는 것:
- POST /api/host/properties 호출 (그대로)
- FormData 구조 (그대로)
- 유효성 검사 로직 (Step별로 분산)
- 이미지 업로드 (image-upload.tsx 재사용)

변경되는 것:
- src/app/host/properties/new/page.tsx
  → PropertyRegistrationForm → MultiStepForm 으로 교체
- src/components/host/property-registration-form.tsx
  → 내부 로직 추출 → multi-step-form.tsx로 이동
```

---

## 5. UX-04: Empty State 공통 컴포넌트

### 5.1 컴포넌트 설계

**신규: `src/components/ui/empty-state.tsx`**

```typescript
interface EmptyStateProps {
  icon?: "star" | "calendar" | "home" | "search" | "inbox" | "heart"
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: "default" | "outline"
  }
  className?: string
}
```

### 5.2 적용 위치

| 페이지 | 조건 | Empty State 텍스트 |
|--------|------|-------------------|
| `/bookings` | 예약 없을 때 | "아직 예약이 없어요" / "숙소 탐색하기 →" |
| `/host/bookings` | 예약 없을 때 | "아직 예약이 없어요" / "숙소 등록하기 →" |
| `/host/properties` | 숙소 없을 때 | "등록된 숙소가 없어요" / "첫 숙소 등록하기 →" |
| `/explore` | 검색 결과 없을 때 | "검색 결과가 없어요" / "필터 초기화" |
| `property/[id]` 리뷰 | 리뷰 없을 때 | "아직 리뷰가 없어요" |
| `/wishlist` | 위시리스트 없을 때 | "찜한 숙소가 없어요" / "숙소 탐색하기 →" |

### 5.3 UI 스케치

```
     🏡          ← lucide-react icon (w-16 h-16 text-gray-300)
아직 예약이 없어요   ← text-xl font-semibold text-gray-700
지금 VINTEE 숙소를   ← text-sm text-gray-500
탐색해보세요

  [ 숙소 탐색하기 ]   ← Button variant="default"
```

---

## 6. UX-05: 탐색 페이지 페이지네이션

### 6.1 설계 목표

```
Before: 전체 숙소 한 번에 로드 (DB 부하 + 느린 TTI)
After:  12개씩 cursor 기반 로드 + "더보기" 버튼
```

### 6.2 API 변경

**수정: `src/app/api/properties/route.ts`**

```typescript
// 쿼리 파라미터 추가:
// ?cursor={lastPropertyId}&limit=12

const cursor = searchParams.get("cursor");
const limit = parseInt(searchParams.get("limit") || "12");

const properties = await prisma.property.findMany({
  take: limit + 1,         // 다음 페이지 있는지 확인용 +1
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  // ... 기존 where/orderBy 유지
});

const hasMore = properties.length > limit;
const items = hasMore ? properties.slice(0, limit) : properties;
const nextCursor = hasMore ? items[items.length - 1].id : null;

return NextResponse.json({ properties: items, nextCursor, hasMore });
```

### 6.3 클라이언트 변경

**수정: `src/app/explore/page.tsx` 또는 PropertyList 컴포넌트**

```typescript
const [cursor, setCursor] = useState<string | null>(null);
const [properties, setProperties] = useState<Property[]>([]);
const [hasMore, setHasMore] = useState(true);
const [isLoading, setIsLoading] = useState(false);

const loadMore = async () => {
  setIsLoading(true);
  const params = new URLSearchParams({ ..., limit: "12" });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/properties?${params}`);
  const data = await res.json();
  setProperties(prev => [...prev, ...data.properties]);
  setCursor(data.nextCursor);
  setHasMore(data.hasMore);
  setIsLoading(false);
};
```

### 6.4 Skeleton 로딩 카드

**신규: `src/components/property/property-card-skeleton.tsx`**

```tsx
export function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );
}
```

---

## 7. 구현 순서 (Implementation Order)

```
Day 1: Quick Wins
├── [1] EmptyState 컴포넌트 신규 생성
├── [2] property/[id] 리뷰 섹션 항상 표시 + EmptyState 적용
└── [3] bookings, host/bookings, host/properties Empty State 적용

Day 2: 가격 명세
├── [4] availability/check API 응답에 가격 명세 필드 추가
├── [5] PriceBreakdown 컴포넌트 신규 생성
└── [6] BookingWidget에 PriceBreakdown 통합

Day 3-4: 멀티스텝 폼
├── [7] multi-step-form.tsx 컨테이너 + step-progress.tsx
├── [8] step-1~3 구현 (기본/시설/이미지)
├── [9] step-4~5 구현 (스토리/가격)
└── [10] localStorage 드래프트 저장/복원

Day 5: 페이지네이션 + 마무리
├── [11] API cursor 페이지네이션
├── [12] PropertyCardSkeleton + 더보기 버튼
└── [13] 빌드 검증 + gap-detector 분석
```

---

## 8. 파일 변경 목록 (예상)

### 신규 생성 (6개)

| 파일 | 설명 |
|------|------|
| `src/components/ui/empty-state.tsx` | 공통 Empty State |
| `src/components/booking/price-breakdown.tsx` | 가격 명세 카드 |
| `src/components/property/property-card-skeleton.tsx` | 스켈레톤 카드 |
| `src/components/host/property-registration/multi-step-form.tsx` | 멀티스텝 컨테이너 |
| `src/components/host/property-registration/step-progress.tsx` | 진행 표시바 |
| `src/components/host/property-registration/step-[1-5].tsx` | 5개 스텝 컴포넌트 |

### 수정 (7개)

| 파일 | 변경 내용 |
|------|---------|
| `src/app/property/[id]/page.tsx` | 리뷰 섹션 항상 표시 |
| `src/app/bookings/page.tsx` | Empty State 적용 |
| `src/app/host/bookings/page.tsx` | Empty State 적용 |
| `src/app/host/properties/page.tsx` | Empty State 적용 |
| `src/app/host/properties/new/page.tsx` | MultiStepForm 교체 |
| `src/app/api/availability/check/route.ts` | 가격 명세 필드 추가 |
| `src/app/api/properties/route.ts` | Cursor 페이지네이션 |

---

## 9. 완료 기준 (Acceptance Criteria)

### UX-01 리뷰 섹션
- [ ] 리뷰 0개 → Empty State 표시 (별 아이콘 + 안내 텍스트)
- [ ] 리뷰 N개 → 평점 요약 + ReviewCard 목록 (최대 6개)
- [ ] 6개 초과 시 "더 많은 리뷰 보기" 텍스트 표시

### UX-02 가격 명세
- [ ] 평일/주말 밤수 분리 계산 및 표시
- [ ] 서비스 수수료(10%) 명시
- [ ] 날짜 변경 시 실시간 업데이트
- [ ] 금액 천단위 구분자 표시 (₩50,000)

### UX-03 멀티스텝 폼
- [ ] 5단계 네비게이션 (이전/다음 버튼)
- [ ] Progress Bar (Step N/5 + 퍼센트)
- [ ] 각 Step 유효성 검사 통과 후에만 다음 이동
- [ ] localStorage 임시저장 (새로고침 후 복원)
- [ ] 제출 성공 → `/host/properties` 이동 + PENDING 상태

### UX-04 Empty State
- [ ] 예약/숙소/리뷰 없을 때 각 페이지에서 Empty State 표시
- [ ] CTA 버튼 동작 확인

### UX-05 페이지네이션
- [ ] 초기 로드 12개
- [ ] "더보기" 클릭 시 추가 12개 로드
- [ ] 더 이상 없을 때 버튼 숨김
- [ ] 로딩 중 Skeleton 표시

### 전체
- [ ] `npm run build` TypeScript 에러 0개
- [ ] Zod `.issues` 패턴 일관 사용

---

*작성자: Claude Code (2026-03-01)*
*다음 단계: `/pdca do sprint-ux` 로 구현 시작*
