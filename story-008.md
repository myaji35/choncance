# Story 008: 메인 페이지 큐레이션

**Epic**: Epic 2 - 테마 기반 숙소 발견
**Story ID**: 008
**Story**: 메인 페이지 큐레이션 시스템 구축
**Priority**: High
**Estimate**: 8시간
**Status**: Not Started
**Dependencies**: story-007 (테마 태그 시스템)

---

## 📋 Story Description

메인 페이지에 테마 기반으로 큐레이션된 숙소 컬렉션을 표시합니다. MZ세대 사용자가 "오늘의 추천", "논뷰맛집", "불멍과별멍" 같은 감성적인 테마로 빠르게 숙소를 발견할 수 있도록 돕습니다.

### User Story
```
AS A 촌캉스를 계획하는 사용자
I WANT 메인 페이지에서 테마별로 큐레이션된 숙소 컬렉션을 보고
SO THAT 내 취향에 맞는 숙소를 빠르게 발견할 수 있다
```

### Business Value
- 사용자가 메인 페이지에서 즉시 영감을 받을 수 있음
- 테마 기반 큐레이션으로 전환율 향상
- 호스트의 숙소가 테마 컬렉션에 노출되어 예약률 증가
- 브랜드 정체성 강화 (감성적, 스토리 중심의 발견)

---

## 🎯 Acceptance Criteria

### AC 1: 히어로 섹션 큐레이션
- [ ] 메인 페이지 상단에 "오늘의 추천" 또는 "에디터의 선택" 히어로 배너 표시
- [ ] 큰 이미지와 감성적인 타이틀, 짧은 설명 포함
- [ ] 클릭 시 해당 숙소 상세 페이지로 이동
- [ ] 자동 슬라이드 또는 수동 네비게이션 지원

### AC 2: 테마 컬렉션 섹션
- [ ] "논뷰맛집", "바다뷰", "불멍과별멍" 등 3-4개의 테마 컬렉션 표시
- [ ] 각 컬렉션당 4-6개의 숙소 카드를 가로 스크롤 형태로 표시
- [ ] 숙소 카드에 대표 이미지, 제목, 위치, 가격, 태그 표시
- [ ] "전체 보기" 버튼으로 해당 테마의 전체 리스팅 페이지로 이동

### AC 3: 인기 태그 섹션
- [ ] 사용자들이 많이 찾는 태그를 버튼 형태로 표시
- [ ] 태그 클릭 시 해당 태그의 리스팅 페이지로 이동
- [ ] 이모지와 색상으로 시각적 매력 강화

### AC 4: 반응형 디자인
- [ ] 모바일/태블릿/데스크탑 모든 화면에서 최적화
- [ ] 모바일에서는 세로 스크롤, 데스크탑에서는 그리드 레이아웃

---

## 🧪 Gherkin Scenarios

### Scenario 1: 메인 페이지 방문 시 큐레이션 콘텐츠 표시
```gherkin
Feature: 메인 페이지 큐레이션

  Scenario: 사용자가 메인 페이지에 접속하면 큐레이션 콘텐츠를 본다
    Given 사용자가 ChonCance 메인 페이지를 방문한다
    When 페이지가 로드된다
    Then 히어로 섹션에 "오늘의 추천" 숙소가 표시된다
    And "논뷰맛집" 컬렉션이 4개의 숙소 카드와 함께 표시된다
    And "바다뷰" 컬렉션이 4개의 숙소 카드와 함께 표시된다
    And "불멍과별멍" 컬렉션이 4개의 숙소 카드와 함께 표시된다
    And 인기 태그 섹션이 표시된다
```

### Scenario 2: 히어로 배너 자동 슬라이드
```gherkin
  Scenario: 히어로 배너가 자동으로 전환된다
    Given 사용자가 메인 페이지를 보고 있다
    When 5초가 경과한다
    Then 히어로 배너가 다음 "오늘의 추천" 숙소로 전환된다
    And 슬라이드 인디케이터가 업데이트된다
```

### Scenario 3: 테마 컬렉션 가로 스크롤
```gherkin
  Scenario: 사용자가 테마 컬렉션을 가로로 스크롤한다
    Given "논뷰맛집" 컬렉션이 4개의 숙소를 표시하고 있다
    When 사용자가 컬렉션을 왼쪽으로 스와이프한다
    Then 다음 4개의 "논뷰맛집" 숙소가 표시된다
```

### Scenario 4: 숙소 카드 클릭
```gherkin
  Scenario: 사용자가 컬렉션의 숙소 카드를 클릭한다
    Given "바다뷰" 컬렉션이 표시되어 있다
    When 사용자가 첫 번째 숙소 카드를 클릭한다
    Then 해당 숙소의 상세 페이지로 이동한다
```

### Scenario 5: 전체 보기 버튼 클릭
```gherkin
  Scenario: 사용자가 "전체 보기" 버튼을 클릭한다
    Given "불멍과별멍" 컬렉션이 표시되어 있다
    When 사용자가 "전체 보기" 버튼을 클릭한다
    Then "/explore?theme=fire-star-gazing" 리스팅 페이지로 이동한다
```

### Scenario 6: 인기 태그 클릭
```gherkin
  Scenario: 사용자가 인기 태그를 클릭한다
    Given 인기 태그 섹션이 표시되어 있다
    When 사용자가 "#반려동물동반" 태그를 클릭한다
    Then "/explore?tags=pet-friendly" 리스팅 페이지로 이동한다
```

---

## 🔧 API Specifications

### 1. GET /api/v1/curations/hero
**Description**: 히어로 섹션용 "오늘의 추천" 숙소 목록

**Request**:
```http
GET /api/v1/curations/hero
```

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "title": "고즈넉한 한옥에서의 하루",
      "description": "전통 한옥의 정취를 느끼며 느리게 살아보세요.",
      "image_url": "https://example.com/images/hanok.jpg",
      "order": 1,
      "created_at": "2025-01-15T10:00:00Z",
      "property": {
        "id": "uuid",
        "name": "청송 한옥스테이",
        "location": "경북 청송군",
        "price_per_night": 120000,
        "main_image_url": "https://...",
        "tags": [
          {"id": "uuid", "name": "한옥체험", "emoji": "🏠", "color": "#8B7355"}
        ]
      }
    },
    {
      "id": "uuid",
      "property_id": "uuid",
      "title": "논뷰와 함께하는 힐링",
      "description": "창밖으로 펼쳐진 논밭을 보며 마음의 여유를 찾으세요.",
      "image_url": "https://example.com/images/rice-field.jpg",
      "order": 2,
      "created_at": "2025-01-15T10:00:00Z",
      "property": {
        "id": "uuid",
        "name": "담양 논뷰하우스",
        "location": "전남 담양군",
        "price_per_night": 90000,
        "main_image_url": "https://...",
        "tags": [
          {"id": "uuid", "name": "논뷰맛집", "emoji": "🌾", "color": "#F4C430"}
        ]
      }
    }
  ]
}
```

---

### 2. GET /api/v1/curations/collections
**Description**: 테마 컬렉션 목록 (각 컬렉션당 숙소 포함)

**Request**:
```http
GET /api/v1/curations/collections?limit=3
```

**Query Parameters**:
- `limit` (optional, default=3): 반환할 컬렉션 개수

**Response** (200 OK):
```json
{
  "collections": [
    {
      "id": "uuid",
      "title": "논뷰맛집",
      "slug": "rice-field-view",
      "description": "창밖으로 펼쳐진 푸른 논밭과 함께하는 힐링",
      "emoji": "🌾",
      "color": "#F4C430",
      "order": 1,
      "properties": [
        {
          "id": "uuid",
          "name": "담양 논뷰하우스",
          "location": "전남 담양군",
          "price_per_night": 90000,
          "main_image_url": "https://...",
          "rating": 4.8,
          "review_count": 24,
          "tags": [
            {"id": "uuid", "name": "논뷰맛집", "emoji": "🌾", "color": "#F4C430"}
          ]
        },
        {
          "id": "uuid",
          "name": "서산 황금들판펜션",
          "location": "충남 서산시",
          "price_per_night": 85000,
          "main_image_url": "https://...",
          "rating": 4.6,
          "review_count": 18,
          "tags": [
            {"id": "uuid", "name": "논뷰맛집", "emoji": "🌾", "color": "#F4C430"}
          ]
        }
      ]
    },
    {
      "id": "uuid",
      "title": "바다뷰",
      "slug": "ocean-view",
      "description": "푸른 바다가 한눈에 들어오는 오션뷰 숙소",
      "emoji": "🌊",
      "color": "#4A90E2",
      "order": 2,
      "properties": [...]
    },
    {
      "id": "uuid",
      "title": "불멍과별멍",
      "slug": "fire-star-gazing",
      "description": "모닥불과 별빛 아래에서의 낭만적인 밤",
      "emoji": "🔥",
      "color": "#FF6B6B",
      "order": 3,
      "properties": [...]
    }
  ]
}
```

---

### 3. GET /api/v1/tags/popular
**Description**: 인기 태그 목록 (클릭 수 또는 사용 빈도 기준)

**Request**:
```http
GET /api/v1/tags/popular?limit=8
```

**Query Parameters**:
- `limit` (optional, default=8): 반환할 태그 개수

**Response** (200 OK):
```json
{
  "tags": [
    {
      "id": "uuid",
      "name": "논뷰맛집",
      "slug": "rice-field-view",
      "emoji": "🌾",
      "color": "#F4C430",
      "category": "VIEW",
      "usage_count": 156
    },
    {
      "id": "uuid",
      "name": "반려동물동반",
      "slug": "pet-friendly",
      "emoji": "🐕",
      "color": "#A0522D",
      "category": "FACILITY",
      "usage_count": 142
    },
    {
      "id": "uuid",
      "name": "바다뷰",
      "slug": "ocean-view",
      "emoji": "🌊",
      "color": "#4A90E2",
      "category": "VIEW",
      "usage_count": 128
    }
  ]
}
```

---

## 🗄️ Database Schema

### Table: `hero_curations`
큐레이션된 히어로 배너 아이템 관리

```sql
CREATE TABLE hero_curations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hero_curations_order ON hero_curations(order) WHERE is_active = true;
```

### Table: `collections`
테마 컬렉션 정의

```sql
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    emoji VARCHAR(10),
    color VARCHAR(20),
    order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_order ON collections(order) WHERE is_active = true;
```

### Table: `collection_properties`
컬렉션과 숙소의 다대다 관계

```sql
CREATE TABLE collection_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, property_id)
);

CREATE INDEX idx_collection_properties_collection ON collection_properties(collection_id);
CREATE INDEX idx_collection_properties_property ON collection_properties(property_id);
```

### Table: `tag_clicks`
태그 클릭 추적 (인기 태그 분석용)

```sql
CREATE TABLE tag_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    clicked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tag_clicks_tag ON tag_clicks(tag_id);
CREATE INDEX idx_tag_clicks_clicked_at ON tag_clicks(clicked_at);
```

---

## 🛠️ Implementation Tasks

### Backend Tasks

#### 1. 데이터베이스 마이그레이션 (1시간)
- [ ] `hero_curations`, `collections`, `collection_properties`, `tag_clicks` 테이블 생성
- [ ] Alembic 마이그레이션 스크립트 작성
- [ ] 마이그레이션 실행 및 확인

#### 2. 모델 생성 (30분)
- [ ] `backend/app/models/curation.py` 생성
  - HeroCuration, Collection, CollectionProperty 모델 정의
- [ ] `backend/app/models/tag.py` 수정
  - TagClick 모델 추가

#### 3. 스키마 생성 (30분)
- [ ] `backend/app/schemas/curation.py` 생성
  - HeroCurationResponse, CollectionResponse, CollectionPropertyResponse

#### 4. API 엔드포인트 구현 (2시간)
- [ ] `backend/app/routers/curation.py` 생성
  - GET /api/v1/curations/hero
  - GET /api/v1/curations/collections
- [ ] `backend/app/routers/tag.py` 수정
  - GET /api/v1/tags/popular (usage_count 기준 정렬)
  - POST /api/v1/tags/{tag_id}/click (클릭 추적)
- [ ] main.py에 라우터 등록

#### 5. 시드 데이터 작성 (1시간)
- [ ] `backend/scripts/seed_curations.py` 생성
  - 히어로 큐레이션 샘플 데이터 (3개)
  - 컬렉션 샘플 데이터 (논뷰맛집, 바다뷰, 불멍과별멍)
  - collection_properties 매핑

---

### Frontend Tasks

#### 1. 타입 정의 (30분)
- [ ] `src/types/curation.ts` 생성
  - HeroCuration, Collection, CollectionProperty 인터페이스

#### 2. API 클라이언트 (30분)
- [ ] `src/lib/api/curation.ts` 생성
  - getHeroCurations(), getCollections()
- [ ] `src/lib/api/tag.ts` 수정
  - getPopularTags(), trackTagClick()

#### 3. 컴포넌트 생성 (2.5시간)
- [ ] `src/components/home/HeroSection.tsx`
  - Swiper 또는 Embla Carousel 사용
  - 자동 슬라이드 + 수동 네비게이션
  - 이미지, 타이틀, 설명, CTA 버튼
- [ ] `src/components/home/CollectionSection.tsx`
  - 컬렉션 타이틀, 설명, "전체 보기" 버튼
  - 가로 스크롤 가능한 숙소 카드 리스트
- [ ] `src/components/home/PropertyCard.tsx`
  - 이미지, 제목, 위치, 가격, 태그, 평점
  - Hover 효과 및 애니메이션
- [ ] `src/components/home/PopularTags.tsx`
  - 태그 버튼 그리드
  - 이모지 + 색상 표시
  - 클릭 시 태그 클릭 추적 + 리스팅 페이지 이동

#### 4. 메인 페이지 통합 (1시간)
- [ ] `src/app/page.tsx` 수정
  - HeroSection, CollectionSection (3개), PopularTags 순서대로 배치
  - 서버 컴포넌트로 데이터 페칭 (SSR)
  - 로딩 및 에러 상태 처리

#### 5. 반응형 스타일링 (1시간)
- [ ] 모바일: 세로 스크롤, 카드 너비 조정
- [ ] 태블릿: 2열 그리드
- [ ] 데스크탑: 3-4열 그리드
- [ ] Tailwind CSS 및 CSS Grid/Flexbox 활용

---

## 📚 Technical Notes

### 1. 이미지 최적화
- Next.js Image 컴포넌트 사용
- Lazy loading 적용
- WebP 포맷 우선 사용

### 2. 캐러셀 라이브러리
- **Swiper.js** 또는 **Embla Carousel** 추천
- 가벼운 용량, 터치 제스처 지원, 반응형

### 3. 성능 고려사항
- SSR로 초기 로딩 속도 향상
- 컬렉션별 숙소는 4-6개로 제한 (무한 스크롤 X)
- 인기 태그는 캐싱 (Redis 또는 Next.js Incremental Static Regeneration)

### 4. SEO 최적화
- 메인 페이지 meta 태그 최적화
- 구조화된 데이터 (JSON-LD) 추가
- Open Graph 이미지 설정

---

## 🔗 Dependencies

- **story-007**: 테마 태그 시스템이 먼저 구현되어야 함
- **story-009**: 리스팅 페이지 구현 후 "전체 보기" 링크 연결 가능

---

## ✅ Definition of Done

- [ ] 히어로 섹션이 자동 슬라이드되며 "오늘의 추천" 숙소를 보여줌
- [ ] 3개의 테마 컬렉션이 각각 4-6개의 숙소와 함께 표시됨
- [ ] 숙소 카드 클릭 시 상세 페이지로 이동 (구현 예정)
- [ ] "전체 보기" 버튼 클릭 시 리스팅 페이지로 이동 (구현 예정)
- [ ] 인기 태그 클릭 시 해당 태그의 리스팅 페이지로 이동 (구현 예정)
- [ ] 모바일/태블릿/데스크탑 모두 반응형으로 작동
- [ ] API 응답 시간 < 500ms (로컬 환경 기준)
- [ ] 코드 리뷰 완료 및 main 브랜치 머지
- [ ] STORY-TRACKER.md 업데이트

---

## 📝 Notes

- 히어로 큐레이션과 컬렉션은 관리자 페이지에서 직접 관리할 수 있도록 추후 확장 가능
- 태그 클릭 추적 데이터는 향후 추천 알고리즘에 활용 가능
- 컬렉션 순서는 `order` 필드로 관리하여 유연하게 조정 가능
