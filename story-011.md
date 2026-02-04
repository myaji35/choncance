# Story 011: 필터 기능

**Epic**: Epic 2 - 테마 기반 숙소 발견
**Story ID**: 011
**Story**: 고급 필터링 시스템 구현
**Priority**: High
**Estimate**: 10시간
**Status**: Not Started
**Dependencies**: story-007 (태그 시스템), story-009 (리스팅 페이지)

---

## 📋 Story Description

리스팅 페이지에 다양한 필터를 제공하여 사용자가 원하는 조건의 숙소를 정확하게 찾을 수 있도록 합니다. 태그, 가격, 지역, 날짜, 인원 등 다양한 필터를 제공하고 URL 쿼리 파라미터로 상태를 유지합니다.

### User Story
```
AS A 촌캉스를 계획하는 사용자
I WANT 태그, 가격, 날짜, 지역 등의 필터로 숙소를 좁혀서 찾고
SO THAT 내 조건에 정확히 맞는 숙소만 빠르게 찾을 수 있다
```

### Business Value
- 사용자가 원하는 조건의 숙소를 정확하게 찾을 수 있어 전환율 향상
- 필터 데이터 분석을 통한 사용자 선호도 파악
- 호스트의 숙소가 타겟 고객에게 정확히 노출
- 검색 경험 개선으로 재방문율 증가

---

## 🎯 Acceptance Criteria

### AC 1: 필터 사이드바
- [ ] 데스크탑: 왼쪽 사이드바에 필터 패널 고정
- [ ] 모바일: 하단 "필터" 버튼 클릭 시 바텀 시트 또는 전체화면 모달
- [ ] 적용된 필터 개수를 "필터 (3)" 형태로 표시

### AC 2: 태그 필터
- [ ] 카테고리별로 태그 그룹 표시 (VIEW, ACTIVITY, FACILITY, VIBE)
- [ ] 체크박스로 다중 선택 가능
- [ ] 선택된 태그는 상단에 칩 형태로 표시
- [ ] URL: `?tags=rice-field-view,pet-friendly`

### AC 3: 가격 필터
- [ ] 슬라이더로 최소/최대 가격 범위 설정
- [ ] 범위: 50,000원 ~ 500,000원 (1만원 단위)
- [ ] 현재 선택된 범위 표시 ("80,000원 ~ 200,000원")
- [ ] URL: `?min_price=80000&max_price=200000`

### AC 4: 지역 필터
- [ ] 시/도 선택 드롭다운 (강원도, 경기도, 전라남도 등)
- [ ] 시/군/구 선택 드롭다운 (시/도 선택 시 활성화)
- [ ] "인기 지역" 바로가기 버튼 (강릉, 담양, 제주 등)
- [ ] URL: `?province=강원도&city=강릉시`

### AC 5: 날짜 필터
- [ ] 체크인/체크아웃 날짜 선택 (Date Picker)
- [ ] 예약 불가능한 날짜는 비활성화
- [ ] 1박 이상 선택 필수
- [ ] URL: `?check_in=2025-02-01&check_out=2025-02-03`

### AC 6: 인원 필터
- [ ] 성인, 어린이 인원 선택 (+/- 버튼)
- [ ] 반려동물 동반 여부 체크박스
- [ ] URL: `?guests=2&children=1&pets=true`

### AC 7: 필터 적용 및 초기화
- [ ] "적용" 버튼 클릭 시 URL 업데이트 및 결과 새로고침
- [ ] "필터 초기화" 버튼으로 모든 필터 제거
- [ ] 필터 변경 시 실시간으로 결과 수 표시 ("47개 숙소 보기")

---

## 🧪 Gherkin Scenarios

### Scenario 1: 태그 필터 적용
```gherkin
Feature: 고급 필터링

  Scenario: 사용자가 태그 필터를 선택한다
    Given 사용자가 "/explore" 페이지를 보고 있다
    When 필터 패널에서 "논뷰맛집"과 "반려동물동반" 태그를 선택한다
    And "적용" 버튼을 클릭한다
    Then URL이 "/explore?tags=rice-field-view,pet-friendly"로 변경된다
    And 두 태그 모두를 가진 숙소만 표시된다
    And 상단에 "논뷰맛집 🌾", "반려동물동반 🐕" 칩이 표시된다
```

### Scenario 2: 가격 필터 적용
```gherkin
  Scenario: 사용자가 가격 범위를 설정한다
    Given 사용자가 필터 패널을 보고 있다
    When 가격 슬라이더를 80,000원 ~ 200,000원으로 조정한다
    And "적용" 버튼을 클릭한다
    Then URL이 "/explore?min_price=80000&max_price=200000"로 변경된다
    And 1박 가격이 80,000원 ~ 200,000원 범위의 숙소만 표시된다
```

### Scenario 3: 날짜 필터 적용
```gherkin
  Scenario: 사용자가 체크인/체크아웃 날짜를 선택한다
    Given 사용자가 필터 패널을 보고 있다
    When 체크인 날짜로 "2025-02-01"을 선택한다
    And 체크아웃 날짜로 "2025-02-03"을 선택한다
    And "적용" 버튼을 클릭한다
    Then URL이 "/explore?check_in=2025-02-01&check_out=2025-02-03"로 변경된다
    And 해당 날짜에 예약 가능한 숙소만 표시된다
```

### Scenario 4: 복합 필터 적용
```gherkin
  Scenario: 사용자가 여러 필터를 조합하여 적용한다
    Given 사용자가 필터 패널을 보고 있다
    When "바다뷰" 태그를 선택한다
    And 가격 범위를 100,000원 ~ 200,000원으로 설정한다
    And 지역을 "강원도 - 강릉시"로 선택한다
    And "적용" 버튼을 클릭한다
    Then URL이 "/explore?tags=ocean-view&min_price=100000&max_price=200000&province=강원도&city=강릉시"로 변경된다
    And 모든 조건을 만족하는 숙소만 표시된다
```

### Scenario 5: 필터 초기화
```gherkin
  Scenario: 사용자가 필터를 초기화한다
    Given 사용자가 여러 필터를 적용하여 "/explore?tags=ocean-view&min_price=100000"를 보고 있다
    When "필터 초기화" 버튼을 클릭한다
    Then URL이 "/explore"로 변경된다
    And 모든 숙소가 표시된다
    And 필터 패널의 모든 선택이 해제된다
```

### Scenario 6: 모바일 필터
```gherkin
  Scenario: 모바일에서 필터 버튼을 클릭한다
    Given 사용자가 모바일 환경에서 "/explore" 페이지를 보고 있다
    When 하단의 "필터" 버튼을 클릭한다
    Then 전체화면 필터 모달이 나타난다
    And 모든 필터 옵션이 표시된다
```

### Scenario 7: 적용된 필터 칩 제거
```gherkin
  Scenario: 사용자가 적용된 필터 칩을 제거한다
    Given 사용자가 "논뷰맛집", "바다뷰" 태그를 적용한 "/explore?tags=rice-field-view,ocean-view"를 보고 있다
    When "바다뷰 🌊" 칩의 X 버튼을 클릭한다
    Then URL이 "/explore?tags=rice-field-view"로 변경된다
    And "논뷰맛집" 태그만 적용된 숙소가 표시된다
    And "바다뷰 🌊" 칩이 제거된다
```

---

## 🔧 API Specifications

### 1. GET /api/v1/filters/locations
**Description**: 지역 필터 옵션 조회 (시/도 및 시/군/구)

**Request**:
```http
GET /api/v1/filters/locations?province=강원도
```

**Query Parameters**:
- `province` (optional): 시/도 (선택 시 해당 시/도의 시/군/구 반환)

**Response** (200 OK):
```json
{
  "provinces": [
    { "name": "강원도", "count": 23 },
    { "name": "경기도", "count": 18 },
    { "name": "전라남도", "count": 15 },
    { "name": "제주특별자치도", "count": 12 }
  ],
  "cities": [
    { "name": "강릉시", "count": 8 },
    { "name": "속초시", "count": 6 },
    { "name": "평창군", "count": 5 },
    { "name": "양양군", "count": 4 }
  ]
}
```

---

### 2. GET /api/v1/filters/price-range
**Description**: 현재 등록된 숙소의 가격 범위 조회

**Request**:
```http
GET /api/v1/filters/price-range
```

**Response** (200 OK):
```json
{
  "min_price": 50000,
  "max_price": 450000,
  "average_price": 120000
}
```

---

### 3. GET /api/v1/properties (필터 파라미터 추가)
**Description**: 기존 story-009의 API에 필터 파라미터 추가

**Query Parameters** (추가):
- `check_in` (optional): 체크인 날짜 (YYYY-MM-DD)
- `check_out` (optional): 체크아웃 날짜 (YYYY-MM-DD)
- `guests` (optional): 성인 인원
- `children` (optional): 어린이 인원
- `pets` (optional): 반려동물 동반 여부 (true/false)
- `province` (optional): 시/도
- `city` (optional): 시/군/구

---

## 🗄️ Database Schema

### Table: `properties` (기존 테이블에 필드 추가)
```sql
ALTER TABLE properties
ADD COLUMN max_guests INTEGER DEFAULT 4,
ADD COLUMN allows_pets BOOLEAN DEFAULT false,
ADD COLUMN province VARCHAR(50),
ADD COLUMN city VARCHAR(50);

CREATE INDEX idx_properties_province ON properties(province);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_max_guests ON properties(max_guests);
```

### Table: `bookings` (날짜 필터링용)
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_price INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_property ON bookings(property_id, check_in, check_out);
CREATE INDEX idx_bookings_user ON bookings(user_id);
```

---

## 🛠️ Implementation Tasks

### Backend Tasks

#### 1. 데이터베이스 마이그레이션 (1시간)
- [ ] properties 테이블에 `max_guests`, `allows_pets`, `province`, `city` 필드 추가
- [ ] bookings 테이블 생성
- [ ] Alembic 마이그레이션 실행

#### 2. 모델 생성 (30분)
- [ ] `backend/app/models/property.py` 수정
  - Property 모델에 필드 추가
- [ ] `backend/app/models/booking.py` 생성
  - Booking 모델 정의

#### 3. 스키마 생성 (1시간)
- [ ] `backend/app/schemas/filter.py` 생성
  - LocationFilterResponse, PriceRangeResponse
- [ ] `backend/app/schemas/property.py` 수정
  - PropertyListRequest에 필터 파라미터 추가

#### 4. API 엔드포인트 구현 (3시간)
- [ ] `backend/app/routers/filter.py` 생성
  - GET /api/v1/filters/locations
  - GET /api/v1/filters/price-range
- [ ] `backend/app/routers/property.py` 수정
  - GET /api/v1/properties에 날짜, 인원, 지역 필터 로직 추가
  - 날짜 필터: bookings 테이블과 조인하여 예약 가능 여부 확인
- [ ] main.py에 라우터 등록

#### 5. 날짜 필터링 로직 (1.5시간)
- [ ] 예약 불가능한 날짜 체크 쿼리
- [ ] 날짜 범위 중복 체크 (check_in < existing_check_out AND check_out > existing_check_in)

#### 6. 시드 데이터 업데이트 (1시간)
- [ ] `backend/scripts/seed_properties.py` 수정
  - max_guests, allows_pets, province, city 추가

---

### Frontend Tasks

#### 1. 타입 정의 (30분)
- [ ] `src/types/filter.ts` 생성
  - FilterParams, LocationOption, PriceRange 인터페이스

#### 2. API 클라이언트 (30분)
- [ ] `src/lib/api/filter.ts` 생성
  - getLocations(province?: string)
  - getPriceRange()

#### 3. 컴포넌트 생성 (3.5시간)
- [ ] `src/components/explore/FilterSidebar.tsx`
  - 데스크탑 사이드바 레이아웃
  - 모든 필터 컴포넌트 통합
- [ ] `src/components/explore/FilterModal.tsx` (모바일)
  - 바텀 시트 또는 전체화면 모달
- [ ] `src/components/explore/TagFilter.tsx`
  - 카테고리별 태그 체크박스
- [ ] `src/components/explore/PriceRangeFilter.tsx`
  - 슬라이더 (shadcn/ui Slider 컴포넌트)
  - 가격 범위 표시
- [ ] `src/components/explore/LocationFilter.tsx`
  - 시/도 드롭다운
  - 시/군/구 드롭다운
  - 인기 지역 버튼
- [ ] `src/components/explore/DateFilter.tsx`
  - Date Picker (react-day-picker 또는 shadcn/ui Calendar)
  - 체크인/체크아웃 선택
- [ ] `src/components/explore/GuestFilter.tsx`
  - 성인/어린이 인원 선택 (+/- 버튼)
  - 반려동물 체크박스
- [ ] `src/components/explore/AppliedFilters.tsx`
  - 적용된 필터 칩 표시
  - 개별 칩 제거 버튼

#### 4. 필터 상태 관리 (1.5시간)
- [ ] URL 쿼리 파라미터와 동기화
- [ ] 필터 변경 시 디바운스 적용 (500ms)
- [ ] "적용" 버튼 클릭 시 URL 업데이트
- [ ] "필터 초기화" 버튼

#### 5. 리스팅 페이지 통합 (1시간)
- [ ] `src/app/explore/page.tsx` 수정
  - FilterSidebar (데스크탑) 추가
  - "필터" 버튼 (모바일) 추가
  - AppliedFilters 표시
- [ ] 필터 변경 시 PropertyGrid 업데이트

#### 6. 반응형 스타일링 (1시간)
- [ ] 데스크탑: 왼쪽 고정 사이드바 (300px)
- [ ] 모바일: 하단 "필터" 버튼, 바텀 시트 모달
- [ ] 필터 패널 스크롤 처리

---

## 📚 Technical Notes

### 1. 날짜 필터링 로직 (Backend)
```python
# 예약 불가능한 날짜 체크
if check_in and check_out:
    # 해당 기간에 예약이 있는 숙소 제외
    subquery = (
        select(Booking.property_id)
        .where(
            and_(
                Booking.check_in < check_out,
                Booking.check_out > check_in,
                Booking.status.in_(['CONFIRMED', 'PENDING'])
            )
        )
    )
    query = query.where(Property.id.notin_(subquery))
```

### 2. URL 쿼리 파라미터 관리 (Frontend)
```typescript
const buildFilterUrl = (filters: FilterParams): string => {
  const params = new URLSearchParams();

  if (filters.tags?.length) {
    params.set('tags', filters.tags.join(','));
  }
  if (filters.min_price) {
    params.set('min_price', filters.min_price.toString());
  }
  if (filters.max_price) {
    params.set('max_price', filters.max_price.toString());
  }
  if (filters.check_in) {
    params.set('check_in', filters.check_in);
  }
  if (filters.check_out) {
    params.set('check_out', filters.check_out);
  }
  if (filters.province) {
    params.set('province', filters.province);
  }
  if (filters.city) {
    params.set('city', filters.city);
  }

  return `/explore?${params.toString()}`;
};
```

### 3. 슬라이더 컴포넌트 (shadcn/ui)
```bash
npx shadcn@latest add slider
```

```tsx
import { Slider } from "@/components/ui/slider";

<Slider
  min={50000}
  max={500000}
  step={10000}
  value={[minPrice, maxPrice]}
  onValueChange={([min, max]) => {
    setMinPrice(min);
    setMaxPrice(max);
  }}
/>
```

### 4. Date Picker 컴포넌트 (shadcn/ui Calendar)
```bash
npx shadcn@latest add calendar popover
```

```tsx
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">체크인</Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={checkIn}
      onSelect={setCheckIn}
      disabled={(date) => date < new Date()}
    />
  </PopoverContent>
</Popover>
```

### 5. 성능 최적화
- 필터 변경 시 디바운스 적용
- 결과 수 카운트는 별도 API 호출 (COUNT 쿼리)
- 필터 옵션은 캐싱 (Redis 또는 React Query)

---

## 🔗 Dependencies

- **story-007**: 태그 시스템 구현 필요
- **story-009**: 리스팅 페이지에 필터 통합

---

## ✅ Definition of Done

- [ ] 데스크탑에서 왼쪽 사이드바에 필터 패널 표시
- [ ] 모바일에서 "필터" 버튼 클릭 시 바텀 시트 모달 표시
- [ ] 태그, 가격, 지역, 날짜, 인원 필터 모두 작동
- [ ] 필터 적용 시 URL 쿼리 파라미터 업데이트
- [ ] 적용된 필터가 칩 형태로 표시되며 개별 제거 가능
- [ ] "필터 초기화" 버튼으로 모든 필터 제거
- [ ] 날짜 필터로 예약 불가능한 숙소 제외
- [ ] 필터 변경 시 실시간 결과 수 표시
- [ ] API 응답 시간 < 1초 (로컬 환경 기준)
- [ ] 코드 리뷰 완료 및 main 브랜치 머지
- [ ] STORY-TRACKER.md 업데이트

---

## 📝 Notes

- 가격 슬라이더는 실제 등록된 숙소의 가격 범위에 맞춰 동적으로 조정
- 날짜 필터는 향후 캘린더 뷰 기능으로 확장 가능
- 필터 조합 분석을 통해 인기 있는 조건 파악 가능
- 저장된 필터 기능은 로그인 사용자 대상으로 향후 추가 가능
