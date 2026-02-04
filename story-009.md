# Story 009: 숙소 리스팅 페이지

**Epic**: Epic 2 - 테마 기반 숙소 발견
**Story ID**: 009
**Story**: 숙소 리스팅 페이지 구현
**Priority**: High
**Estimate**: 10시간
**Status**: Not Started
**Dependencies**: story-007 (테마 태그 시스템), story-008 (메인 페이지 큐레이션)

---

## 📋 Story Description

사용자가 테마, 태그, 검색어로 필터링된 숙소 목록을 보고 탐색할 수 있는 리스팅 페이지를 구현합니다. 그리드 레이아웃으로 숙소를 표시하고, 정렬 옵션과 페이지네이션을 제공하여 사용자가 원하는 숙소를 쉽게 찾을 수 있도록 합니다.

### User Story
```
AS A 촌캉스를 계획하는 사용자
I WANT 태그나 테마로 필터링된 숙소 목록을 보고 정렬할 수 있고
SO THAT 내 조건에 맞는 숙소를 효율적으로 탐색할 수 있다
```

### Business Value
- 사용자가 원하는 조건의 숙소를 빠르게 탐색
- 태그 기반 발견으로 전환율 향상
- 호스트의 숙소가 다양한 경로로 노출
- 정렬 및 필터링으로 사용자 경험 개선

---

## 🎯 Acceptance Criteria

### AC 1: 숙소 목록 표시
- [ ] 그리드 레이아웃으로 숙소 카드 표시 (데스크탑 3-4열, 태블릿 2열, 모바일 1열)
- [ ] 각 카드에 대표 이미지, 제목, 위치, 가격, 평점, 태그 표시
- [ ] 카드 클릭 시 숙소 상세 페이지로 이동
- [ ] 하트 아이콘으로 위시리스트 추가/제거 (로그인 필요)

### AC 2: 정렬 옵션
- [ ] "추천순", "낮은 가격순", "높은 가격순", "평점 높은순", "후기 많은순" 정렬 드롭다운
- [ ] 정렬 변경 시 URL 쿼리 파라미터 업데이트 (`?sort=price_asc`)
- [ ] 정렬 결과 즉시 반영

### AC 3: 페이지네이션
- [ ] 페이지당 12개 숙소 표시
- [ ] 하단에 페이지 번호 및 이전/다음 버튼
- [ ] 페이지 변경 시 URL 업데이트 (`?page=2`)
- [ ] 페이지 변경 시 상단으로 스크롤

### AC 4: 필터링 (URL 쿼리 파라미터 기반)
- [ ] `?tags=pet-friendly,rice-field-view` 형태로 태그 필터링
- [ ] `?theme=fire-star-gazing` 형태로 테마 필터링
- [ ] `?location=강원도` 형태로 지역 필터링
- [ ] 필터 적용 시 총 결과 수 표시

### AC 5: 빈 상태 처리
- [ ] 결과가 없을 때 "조건에 맞는 숙소가 없습니다" 메시지 표시
- [ ] "필터 초기화" 버튼 제공

---

## 🧪 Gherkin Scenarios

### Scenario 1: 기본 숙소 목록 조회
```gherkin
Feature: 숙소 리스팅 페이지

  Scenario: 사용자가 /explore 페이지를 방문하면 기본 숙소 목록을 본다
    Given 사용자가 "/explore" 페이지를 방문한다
    When 페이지가 로드된다
    Then 12개의 숙소 카드가 그리드 형태로 표시된다
    And 정렬 옵션은 "추천순"으로 설정되어 있다
    And 페이지네이션이 표시된다
    And 총 숙소 수가 "총 47개의 숙소" 형태로 표시된다
```

### Scenario 2: 정렬 옵션 변경
```gherkin
  Scenario: 사용자가 정렬 옵션을 "낮은 가격순"으로 변경한다
    Given 사용자가 "/explore" 페이지에 있다
    When 사용자가 정렬 드롭다운에서 "낮은 가격순"을 선택한다
    Then URL이 "/explore?sort=price_asc"로 변경된다
    And 숙소 목록이 가격 오름차순으로 재정렬된다
```

### Scenario 3: 태그로 필터링
```gherkin
  Scenario: 사용자가 메인 페이지에서 "#논뷰맛집" 태그를 클릭한다
    Given 사용자가 메인 페이지에서 "#논뷰맛집" 태그를 클릭했다
    When "/explore?tags=rice-field-view" 페이지로 이동한다
    Then "논뷰맛집" 태그가 적용된 숙소만 표시된다
    And 페이지 상단에 "논뷰맛집 🌾" 필터 태그가 표시된다
```

### Scenario 4: 페이지네이션 이동
```gherkin
  Scenario: 사용자가 2페이지로 이동한다
    Given 사용자가 "/explore" 페이지의 1페이지에 있다
    When 사용자가 페이지네이션에서 "2" 버튼을 클릭한다
    Then URL이 "/explore?page=2"로 변경된다
    And 13-24번째 숙소가 표시된다
    And 페이지 상단으로 자동 스크롤된다
```

### Scenario 5: 위시리스트 추가
```gherkin
  Scenario: 로그인한 사용자가 숙소를 위시리스트에 추가한다
    Given 사용자가 로그인되어 있다
    And "/explore" 페이지에서 숙소 목록을 보고 있다
    When 사용자가 첫 번째 숙소 카드의 하트 아이콘을 클릭한다
    Then 하트 아이콘이 채워진 상태로 변경된다
    And 위시리스트에 숙소가 추가된다
    And "위시리스트에 추가되었습니다" 토스트 메시지가 표시된다
```

### Scenario 6: 비로그인 상태에서 위시리스트 클릭
```gherkin
  Scenario: 비로그인 사용자가 위시리스트 버튼을 클릭한다
    Given 사용자가 로그인되어 있지 않다
    And "/explore" 페이지에서 숙소 목록을 보고 있다
    When 사용자가 숙소 카드의 하트 아이콘을 클릭한다
    Then 로그인 페이지로 리다이렉트된다
    And 로그인 후 원래 페이지로 돌아온다
```

### Scenario 7: 결과 없음
```gherkin
  Scenario: 필터링 결과가 없을 때
    Given 사용자가 "/explore?tags=nonexistent" 페이지를 방문한다
    When 페이지가 로드된다
    Then "조건에 맞는 숙소가 없습니다" 메시지가 표시된다
    And "필터 초기화" 버튼이 표시된다
```

---

## 🔧 API Specifications

### 1. GET /api/v1/properties
**Description**: 숙소 목록 조회 (필터링, 정렬, 페이지네이션 지원)

**Request**:
```http
GET /api/v1/properties?page=1&limit=12&sort=recommended&tags=rice-field-view,pet-friendly&location=강원도
```

**Query Parameters**:
- `page` (optional, default=1): 페이지 번호
- `limit` (optional, default=12): 페이지당 결과 수
- `sort` (optional, default=recommended): 정렬 기준
  - `recommended`: 추천순 (기본값)
  - `price_asc`: 낮은 가격순
  - `price_desc`: 높은 가격순
  - `rating_desc`: 평점 높은순
  - `review_count_desc`: 후기 많은순
- `tags` (optional): 쉼표로 구분된 태그 slug 리스트
- `theme` (optional): 테마 slug (컬렉션 slug)
- `location` (optional): 지역 (시/도 또는 시/군/구)
- `min_price` (optional): 최소 가격
- `max_price` (optional): 최대 가격
- `search` (optional): 검색어 (제목, 설명에서 검색)

**Response** (200 OK):
```json
{
  "total": 47,
  "page": 1,
  "limit": 12,
  "total_pages": 4,
  "properties": [
    {
      "id": "uuid",
      "name": "담양 논뷰하우스",
      "location": "전남 담양군",
      "price_per_night": 90000,
      "main_image_url": "https://example.com/images/property1.jpg",
      "rating": 4.8,
      "review_count": 24,
      "tags": [
        {
          "id": "uuid",
          "name": "논뷰맛집",
          "slug": "rice-field-view",
          "emoji": "🌾",
          "color": "#F4C430"
        },
        {
          "id": "uuid",
          "name": "반려동물동반",
          "slug": "pet-friendly",
          "emoji": "🐕",
          "color": "#A0522D"
        }
      ],
      "is_wishlisted": false
    },
    {
      "id": "uuid",
      "name": "강릉 바다뷰펜션",
      "location": "강원 강릉시",
      "price_per_night": 150000,
      "main_image_url": "https://example.com/images/property2.jpg",
      "rating": 4.9,
      "review_count": 38,
      "tags": [
        {
          "id": "uuid",
          "name": "바다뷰",
          "slug": "ocean-view",
          "emoji": "🌊",
          "color": "#4A90E2"
        }
      ],
      "is_wishlisted": true
    }
  ],
  "filters_applied": {
    "tags": ["rice-field-view", "pet-friendly"],
    "location": "강원도",
    "sort": "recommended"
  }
}
```

---

### 2. POST /api/v1/wishlist
**Description**: 위시리스트에 숙소 추가

**Request**:
```http
POST /api/v1/wishlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "property_id": "uuid"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "property_id": "uuid",
  "created_at": "2025-01-15T14:30:00Z"
}
```

---

### 3. DELETE /api/v1/wishlist/{property_id}
**Description**: 위시리스트에서 숙소 제거

**Request**:
```http
DELETE /api/v1/wishlist/{property_id}
Authorization: Bearer <token>
```

**Response** (204 No Content)

---

### 4. GET /api/v1/wishlist
**Description**: 내 위시리스트 조회

**Request**:
```http
GET /api/v1/wishlist
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "property": {
        "id": "uuid",
        "name": "강릉 바다뷰펜션",
        "location": "강원 강릉시",
        "price_per_night": 150000,
        "main_image_url": "https://...",
        "rating": 4.9,
        "review_count": 38
      },
      "created_at": "2025-01-15T14:30:00Z"
    }
  ]
}
```

---

## 🗄️ Database Schema

### Table: `properties` (기존 테이블에 필드 추가)
```sql
ALTER TABLE properties
ADD COLUMN main_image_url VARCHAR(500),
ADD COLUMN rating DECIMAL(2, 1) DEFAULT 0.0,
ADD COLUMN review_count INTEGER DEFAULT 0;

CREATE INDEX idx_properties_price ON properties(price_per_night);
CREATE INDEX idx_properties_rating ON properties(rating DESC);
CREATE INDEX idx_properties_location ON properties(location);
```

### Table: `wishlists`
사용자의 위시리스트

```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_property ON wishlists(property_id);
```

---

## 🛠️ Implementation Tasks

### Backend Tasks

#### 1. 데이터베이스 마이그레이션 (30분)
- [ ] properties 테이블에 `main_image_url`, `rating`, `review_count` 필드 추가
- [ ] wishlists 테이블 생성
- [ ] Alembic 마이그레이션 실행

#### 2. 모델 생성 (30분)
- [ ] `backend/app/models/property.py` 수정
  - Property 모델에 필드 추가
- [ ] `backend/app/models/wishlist.py` 생성
  - Wishlist 모델 정의

#### 3. 스키마 생성 (1시간)
- [ ] `backend/app/schemas/property.py` 생성
  - PropertyListRequest (쿼리 파라미터)
  - PropertyListResponse, PropertyCardResponse
- [ ] `backend/app/schemas/wishlist.py` 생성
  - WishlistCreateRequest, WishlistResponse

#### 4. API 엔드포인트 구현 (3시간)
- [ ] `backend/app/routers/property.py` 생성
  - GET /api/v1/properties (필터링, 정렬, 페이지네이션)
    - 태그 필터링: JOIN property_tags
    - 정렬 로직: ORDER BY price_per_night, rating, review_count
    - 페이지네이션: LIMIT, OFFSET
    - 위시리스트 여부 체크 (로그인 사용자)
- [ ] `backend/app/routers/wishlist.py` 생성
  - POST /api/v1/wishlist
  - DELETE /api/v1/wishlist/{property_id}
  - GET /api/v1/wishlist
- [ ] main.py에 라우터 등록

#### 5. 시드 데이터 작성 (1시간)
- [ ] `backend/scripts/seed_properties.py` 생성
  - 20-30개의 샘플 숙소 데이터
  - main_image_url, rating, review_count 포함
  - property_tags 매핑

---

### Frontend Tasks

#### 1. 타입 정의 (30분)
- [ ] `src/types/property.ts` 생성
  - Property, PropertyCard, PropertyListResponse 인터페이스
- [ ] `src/types/wishlist.ts` 생성
  - Wishlist, WishlistItem 인터페이스

#### 2. API 클라이언트 (1시간)
- [ ] `src/lib/api/property.ts` 생성
  - getProperties(params: PropertyListParams)
- [ ] `src/lib/api/wishlist.ts` 생성
  - addToWishlist(propertyId: string)
  - removeFromWishlist(propertyId: string)
  - getWishlist()

#### 3. 컴포넌트 생성 (2.5시간)
- [ ] `src/components/explore/PropertyCard.tsx`
  - 이미지, 제목, 위치, 가격, 평점, 태그
  - 하트 아이콘 (위시리스트)
  - Hover 효과
- [ ] `src/components/explore/PropertyGrid.tsx`
  - 반응형 그리드 레이아웃
  - 빈 상태 처리
- [ ] `src/components/explore/SortDropdown.tsx`
  - 정렬 옵션 드롭다운
  - URL 쿼리 파라미터 업데이트
- [ ] `src/components/explore/Pagination.tsx`
  - 페이지 번호, 이전/다음 버튼
  - URL 업데이트 및 스크롤 처리
- [ ] `src/components/explore/FilterTags.tsx`
  - 적용된 필터 태그 표시
  - 태그 제거 버튼

#### 4. 리스팅 페이지 생성 (1.5시간)
- [ ] `src/app/explore/page.tsx` 생성
  - 서버 컴포넌트로 데이터 페칭
  - 쿼리 파라미터 파싱
  - PropertyGrid, SortDropdown, Pagination 통합
  - 로딩 및 에러 상태 처리
- [ ] `src/app/explore/loading.tsx` 생성
  - 스켈레톤 UI

#### 5. 반응형 스타일링 (1시간)
- [ ] 모바일: 1열 그리드
- [ ] 태블릿: 2열 그리드
- [ ] 데스크탑: 3-4열 그리드
- [ ] Tailwind CSS Grid 활용

---

## 📚 Technical Notes

### 1. 필터링 로직 (Backend)
```python
query = select(Property)

# 태그 필터링
if tags:
    query = query.join(PropertyTag).join(Tag).where(Tag.slug.in_(tags))

# 지역 필터링
if location:
    query = query.where(Property.location.like(f"%{location}%"))

# 가격 필터링
if min_price:
    query = query.where(Property.price_per_night >= min_price)
if max_price:
    query = query.where(Property.price_per_night <= max_price)

# 검색어 필터링
if search:
    query = query.where(
        or_(
            Property.name.ilike(f"%{search}%"),
            Property.description.ilike(f"%{search}%")
        )
    )

# 정렬
if sort == "price_asc":
    query = query.order_by(Property.price_per_night.asc())
elif sort == "price_desc":
    query = query.order_by(Property.price_per_night.desc())
elif sort == "rating_desc":
    query = query.order_by(Property.rating.desc())
elif sort == "review_count_desc":
    query = query.order_by(Property.review_count.desc())
else:
    query = query.order_by(Property.created_at.desc())  # 추천순 (기본)

# 페이지네이션
offset = (page - 1) * limit
query = query.limit(limit).offset(offset)
```

### 2. URL 쿼리 파라미터 관리 (Frontend)
```typescript
// useSearchParams + useRouter 조합
const searchParams = useSearchParams();
const router = useRouter();

const updateQueryParams = (newParams: Record<string, string>) => {
  const params = new URLSearchParams(searchParams);
  Object.entries(newParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });
  router.push(`/explore?${params.toString()}`);
};
```

### 3. 위시리스트 낙관적 업데이트
```typescript
const handleWishlistToggle = async (propertyId: string) => {
  // 낙관적 UI 업데이트
  setIsWishlisted(!isWishlisted);

  try {
    if (isWishlisted) {
      await removeFromWishlist(propertyId);
    } else {
      await addToWishlist(propertyId);
    }
  } catch (error) {
    // 실패 시 원래 상태로 복구
    setIsWishlisted(isWishlisted);
    toast.error("오류가 발생했습니다");
  }
};
```

### 4. SEO 최적화
- 각 필터 조합마다 고유한 meta 태그 생성
- Canonical URL 설정
- 페이지네이션 페이지는 noindex (중복 콘텐츠 방지)

---

## 🔗 Dependencies

- **story-007**: 태그 시스템 구현 필요
- **story-008**: 메인 페이지에서 리스팅 페이지로 링크 연결
- **story-010**: 검색 기능 구현 후 search 파라미터 활용
- **story-011**: 필터 UI 구현 후 고급 필터링 통합

---

## ✅ Definition of Done

- [ ] 숙소 목록이 그리드 레이아웃으로 표시됨
- [ ] 정렬 옵션 (추천순, 가격순, 평점순, 후기순) 작동
- [ ] 페이지네이션 작동 (12개씩 표시)
- [ ] 태그, 테마, 지역으로 필터링 가능
- [ ] 위시리스트 추가/제거 기능 작동 (로그인 필요)
- [ ] 비로그인 상태에서 위시리스트 클릭 시 로그인 페이지로 리다이렉트
- [ ] 결과 없을 때 빈 상태 UI 표시
- [ ] 모바일/태블릿/데스크탑 반응형 작동
- [ ] API 응답 시간 < 1초 (로컬 환경 기준)
- [ ] 코드 리뷰 완료 및 main 브랜치 머지
- [ ] STORY-TRACKER.md 업데이트

---

## 📝 Notes

- 무한 스크롤 대신 페이지네이션 사용 (SEO 및 사용자 경험 고려)
- 위시리스트는 추후 "내 위시리스트" 페이지에서 확인 가능
- 정렬 기준 중 "추천순"은 향후 추천 알고리즘으로 개선 가능 (현재는 최신순)
- 이미지 Lazy loading 및 Blur placeholder 적용하여 성능 최적화
