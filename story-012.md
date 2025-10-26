# Story 012: 숙소 상세 페이지

**Epic**: Epic 2 - 테마 기반 숙소 발견
**Story ID**: 012
**Story**: 숙소 상세 페이지 구현
**Priority**: High
**Estimate**: 12시간
**Status**: Not Started
**Dependencies**: story-007 (태그 시스템), story-009 (리스팅 페이지)

---

## 📋 Story Description

사용자가 선택한 숙소의 상세 정보를 풍부하게 보여주는 페이지를 구현합니다. 호스트의 스토리, 고화질 이미지 갤러리, 편의시설, 후기, 예약 패널 등을 제공하여 사용자가 충분한 정보를 바탕으로 예약 결정을 내릴 수 있도록 돕습니다.

### User Story
```
AS A 촌캉스를 계획하는 사용자
I WANT 숙소의 상세 정보, 호스트 스토리, 이미지, 후기를 보고
SO THAT 충분한 정보를 바탕으로 예약 여부를 결정할 수 있다
```

### Business Value
- 호스트의 스토리와 감성적인 콘텐츠로 브랜드 차별화
- 고화질 이미지와 상세 정보로 예약 전환율 향상
- 후기 시스템으로 신뢰도 증가
- 명확한 CTA (예약하기)로 사용자 여정 완성

---

## 🎯 Acceptance Criteria

### AC 1: 이미지 갤러리
- [ ] 대표 이미지를 큰 사이즈로 표시
- [ ] 이미지 그리드 (5-8개 썸네일)
- [ ] 이미지 클릭 시 라이트박스 모달 (전체화면, 좌우 네비게이션)
- [ ] "사진 모두 보기" 버튼

### AC 2: 숙소 기본 정보
- [ ] 숙소명, 위치, 평점, 후기 수
- [ ] 태그 (감성적인 색상과 이모지)
- [ ] 호스트 프로필 (이름, 사진, "호스트 정보 보기" 링크)
- [ ] 공유 버튼, 위시리스트 버튼

### AC 3: 호스트 스토리 섹션
- [ ] "호스트의 이야기" 제목
- [ ] 감성적인 긴 텍스트 (300-500자)
- [ ] 호스트가 직접 작성한 스토리 강조
- [ ] 가독성 높은 타이포그래피 (큰 행간, 세리프 폰트 옵션)

### AC 4: 편의시설 및 숙소 정보
- [ ] 최대 인원, 침실 수, 침대 수, 욕실 수
- [ ] 편의시설 아이콘 목록 (Wi-Fi, 주차, 에어컨, 난방 등)
- [ ] 체크인/체크아웃 시간
- [ ] 취소 정책

### AC 5: 후기 섹션
- [ ] 평균 평점 및 총 후기 수 표시
- [ ] 최신 후기 3-5개 표시 (이름, 날짜, 평점, 내용, 사진)
- [ ] "후기 모두 보기" 버튼
- [ ] 후기 없을 때 "아직 후기가 없습니다" 메시지

### AC 6: 위치 정보
- [ ] 지도 임베드 (Kakao Map 또는 Naver Map)
- [ ] 정확한 주소는 예약 후 공개 (일반적인 위치만 표시)
- [ ] 주변 관광지 정보 (선택 사항)

### AC 7: 예약 패널
- [ ] 1박 가격 표시
- [ ] 체크인/체크아웃 날짜 선택
- [ ] 인원 선택
- [ ] 총 가격 계산 (숙박 일수 × 1박 가격)
- [ ] "예약하기" 버튼 (로그인 필요)
- [ ] 데스크탑에서는 스크롤 시 sticky

### AC 8: 유사 숙소 추천
- [ ] 하단에 "이런 숙소는 어때요?" 섹션
- [ ] 동일 태그 또는 동일 지역의 숙소 4개 추천
- [ ] 카드 형태로 표시

---

## 🧪 Gherkin Scenarios

### Scenario 1: 숙소 상세 페이지 로드
```gherkin
Feature: 숙소 상세 페이지

  Scenario: 사용자가 숙소 상세 페이지를 방문한다
    Given 사용자가 리스팅 페이지에서 "담양 논뷰하우스" 카드를 클릭했다
    When "/property/uuid" 페이지가 로드된다
    Then 대표 이미지와 이미지 그리드가 표시된다
    And 숙소명 "담양 논뷰하우스"가 표시된다
    And 위치 "전남 담양군"이 표시된다
    And 평점 "4.8 (24개 후기)"가 표시된다
    And 태그 "논뷰맛집 🌾", "반려동물동반 🐕"가 표시된다
    And 호스트 스토리가 표시된다
    And 예약 패널이 표시된다
```

### Scenario 2: 이미지 라이트박스
```gherkin
  Scenario: 사용자가 이미지를 클릭하여 라이트박스를 연다
    Given 사용자가 숙소 상세 페이지를 보고 있다
    When 이미지 그리드에서 두 번째 이미지를 클릭한다
    Then 전체화면 라이트박스 모달이 나타난다
    And 클릭한 이미지가 중앙에 크게 표시된다
    And 좌우 화살표로 이미지를 전환할 수 있다
    And ESC 키 또는 닫기 버튼으로 라이트박스를 닫을 수 있다
```

### Scenario 3: 예약 패널에서 날짜 선택
```gherkin
  Scenario: 사용자가 예약 패널에서 체크인/체크아웃 날짜를 선택한다
    Given 사용자가 숙소 상세 페이지를 보고 있다
    When 예약 패널의 체크인 날짜를 "2025-02-01"로 선택한다
    And 체크아웃 날짜를 "2025-02-03"로 선택한다
    Then 총 가격이 "2박 × 90,000원 = 180,000원"으로 계산된다
    And "예약하기" 버튼이 활성화된다
```

### Scenario 4: 비로그인 상태에서 예약 시도
```gherkin
  Scenario: 비로그인 사용자가 예약하기 버튼을 클릭한다
    Given 사용자가 로그인되어 있지 않다
    And 숙소 상세 페이지에서 날짜와 인원을 선택했다
    When "예약하기" 버튼을 클릭한다
    Then 로그인 페이지로 리다이렉트된다
    And 로그인 후 원래 페이지 (숙소 상세)로 돌아온다
```

### Scenario 5: 위시리스트 추가
```gherkin
  Scenario: 사용자가 숙소를 위시리스트에 추가한다
    Given 사용자가 로그인되어 있다
    And 숙소 상세 페이지를 보고 있다
    When 하트 아이콘을 클릭한다
    Then 하트 아이콘이 채워진 상태로 변경된다
    And "위시리스트에 추가되었습니다" 토스트 메시지가 표시된다
```

### Scenario 6: 후기 모두 보기
```gherkin
  Scenario: 사용자가 "후기 모두 보기" 버튼을 클릭한다
    Given 숙소 상세 페이지에 후기 3개가 표시되어 있다
    When "후기 모두 보기 (24개)" 버튼을 클릭한다
    Then 후기 모달 또는 별도 섹션이 열린다
    And 모든 후기 24개가 페이지네이션과 함께 표시된다
```

### Scenario 7: 공유 버튼
```gherkin
  Scenario: 사용자가 공유 버튼을 클릭한다
    Given 사용자가 숙소 상세 페이지를 보고 있다
    When 공유 버튼을 클릭한다
    Then 공유 모달이 나타난다
    And "링크 복사", "카카오톡", "페이스북" 옵션이 표시된다
```

### Scenario 8: 유사 숙소 추천
```gherkin
  Scenario: 사용자가 페이지 하단으로 스크롤한다
    Given 사용자가 숙소 상세 페이지를 보고 있다
    When 페이지 하단으로 스크롤한다
    Then "이런 숙소는 어때요?" 섹션이 표시된다
    And 4개의 유사 숙소 카드가 표시된다
```

---

## 🔧 API Specifications

### 1. GET /api/v1/properties/{property_id}
**Description**: 숙소 상세 정보 조회

**Request**:
```http
GET /api/v1/properties/{property_id}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "담양 논뷰하우스",
  "location": "전남 담양군",
  "address": "전남 담양군 담양읍 (정확한 주소는 예약 후 제공)",
  "latitude": 35.3205,
  "longitude": 126.9881,
  "price_per_night": 90000,
  "main_image_url": "https://example.com/images/property1.jpg",
  "images": [
    {
      "id": "uuid",
      "url": "https://example.com/images/property1.jpg",
      "alt": "거실 전경",
      "order": 1
    },
    {
      "id": "uuid",
      "url": "https://example.com/images/property1-2.jpg",
      "alt": "침실",
      "order": 2
    }
  ],
  "rating": 4.8,
  "review_count": 24,
  "host": {
    "id": "uuid",
    "name": "김호스트",
    "profile_image": "https://...",
    "joined_at": "2024-01-15"
  },
  "story": "논밭이 펼쳐진 담양의 작은 마을에 자리한 이곳은...(긴 스토리 텍스트)",
  "description": "자연 속에서 힐링할 수 있는 공간입니다.",
  "tags": [
    { "id": "uuid", "name": "논뷰맛집", "emoji": "🌾", "color": "#F4C430" },
    { "id": "uuid", "name": "반려동물동반", "emoji": "🐕", "color": "#A0522D" }
  ],
  "max_guests": 4,
  "bedrooms": 2,
  "beds": 2,
  "bathrooms": 1,
  "allows_pets": true,
  "check_in_time": "15:00",
  "check_out_time": "11:00",
  "amenities": [
    { "id": "uuid", "name": "Wi-Fi", "icon": "wifi" },
    { "id": "uuid", "name": "주차 가능", "icon": "parking" },
    { "id": "uuid", "name": "에어컨", "icon": "air-conditioning" },
    { "id": "uuid", "name": "난방", "icon": "heating" },
    { "id": "uuid", "name": "주방", "icon": "kitchen" }
  ],
  "cancellation_policy": "체크인 7일 전까지 무료 취소 가능",
  "is_wishlisted": false,
  "created_at": "2024-06-15T10:00:00Z"
}
```

**Response** (404 Not Found):
```json
{
  "detail": {
    "code": "PROPERTY_NOT_FOUND",
    "message": "숙소를 찾을 수 없습니다"
  }
}
```

---

### 2. GET /api/v1/properties/{property_id}/reviews
**Description**: 숙소 후기 목록 조회

**Request**:
```http
GET /api/v1/properties/{property_id}/reviews?page=1&limit=10
```

**Query Parameters**:
- `page` (optional, default=1): 페이지 번호
- `limit` (optional, default=10): 페이지당 결과 수

**Response** (200 OK):
```json
{
  "total": 24,
  "page": 1,
  "limit": 10,
  "reviews": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "이**",
        "profile_image": "https://..."
      },
      "rating": 5,
      "content": "너무 좋았어요! 논뷰가 정말 예뻤습니다. 힐링하고 갑니다.",
      "images": [
        { "id": "uuid", "url": "https://...", "alt": "후기 사진" }
      ],
      "created_at": "2025-01-10T14:30:00Z"
    }
  ]
}
```

---

### 3. GET /api/v1/properties/{property_id}/similar
**Description**: 유사 숙소 추천

**Request**:
```http
GET /api/v1/properties/{property_id}/similar?limit=4
```

**Query Parameters**:
- `limit` (optional, default=4): 추천 숙소 개수

**Response** (200 OK):
```json
{
  "properties": [
    {
      "id": "uuid",
      "name": "서산 황금들판펜션",
      "location": "충남 서산시",
      "price_per_night": 85000,
      "main_image_url": "https://...",
      "rating": 4.6,
      "review_count": 18,
      "tags": [
        { "id": "uuid", "name": "논뷰맛집", "emoji": "🌾", "color": "#F4C430" }
      ]
    }
  ]
}
```

---

### 4. POST /api/v1/properties/{property_id}/share
**Description**: 공유 이벤트 추적 (선택 사항)

**Request**:
```http
POST /api/v1/properties/{property_id}/share
Content-Type: application/json

{
  "platform": "kakao"
}
```

**Response** (201 Created):
```json
{
  "message": "공유되었습니다"
}
```

---

## 🗄️ Database Schema

### Table: `properties` (기존 테이블에 필드 추가)
```sql
ALTER TABLE properties
ADD COLUMN story TEXT,
ADD COLUMN bedrooms INTEGER DEFAULT 1,
ADD COLUMN beds INTEGER DEFAULT 1,
ADD COLUMN bathrooms INTEGER DEFAULT 1,
ADD COLUMN check_in_time VARCHAR(10) DEFAULT '15:00',
ADD COLUMN check_out_time VARCHAR(10) DEFAULT '11:00',
ADD COLUMN cancellation_policy TEXT,
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);
```

### Table: `property_images`
숙소 이미지 관리

```sql
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt VARCHAR(255),
    order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_images_property ON property_images(property_id, order);
```

### Table: `amenities`
편의시설 정의

```sql
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    category VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `property_amenities`
숙소와 편의시설의 다대다 관계

```sql
CREATE TABLE property_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, amenity_id)
);

CREATE INDEX idx_property_amenities_property ON property_amenities(property_id);
```

### Table: `reviews`
숙소 후기

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, booking_id)
);

CREATE INDEX idx_reviews_property ON reviews(property_id, created_at DESC);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

### Table: `review_images`
후기 이미지

```sql
CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_images_review ON review_images(review_id);
```

---

## 🛠️ Implementation Tasks

### Backend Tasks

#### 1. 데이터베이스 마이그레이션 (1.5시간)
- [ ] properties 테이블에 필드 추가 (story, bedrooms, beds, bathrooms, check_in_time, check_out_time, cancellation_policy, latitude, longitude)
- [ ] property_images, amenities, property_amenities, reviews, review_images 테이블 생성
- [ ] Alembic 마이그레이션 실행

#### 2. 모델 생성 (1시간)
- [ ] `backend/app/models/property.py` 수정
  - Property 모델에 필드 추가
- [ ] `backend/app/models/amenity.py` 생성
  - Amenity, PropertyAmenity 모델 정의
- [ ] `backend/app/models/review.py` 생성
  - Review, ReviewImage 모델 정의
- [ ] `backend/app/models/property_image.py` 생성
  - PropertyImage 모델 정의

#### 3. 스키마 생성 (1시간)
- [ ] `backend/app/schemas/property.py` 수정
  - PropertyDetailResponse (모든 상세 정보 포함)
  - PropertyImageResponse, AmenityResponse
- [ ] `backend/app/schemas/review.py` 생성
  - ReviewResponse, ReviewListResponse

#### 4. API 엔드포인트 구현 (3시간)
- [ ] `backend/app/routers/property.py` 수정
  - GET /api/v1/properties/{property_id} (상세 정보)
  - GET /api/v1/properties/{property_id}/reviews
  - GET /api/v1/properties/{property_id}/similar
    - 동일 태그 우선, 동일 지역 차선
- [ ] `backend/app/routers/review.py` 생성 (향후 확장)
  - POST /api/v1/reviews (후기 작성)

#### 5. 시드 데이터 작성 (1.5시간)
- [ ] `backend/scripts/seed_properties.py` 수정
  - story, bedrooms, beds, bathrooms, latitude, longitude 추가
- [ ] `backend/scripts/seed_property_images.py` 생성
  - 각 숙소당 5-8개 이미지
- [ ] `backend/scripts/seed_amenities.py` 생성
  - Wi-Fi, 주차, 에어컨, 난방, 주방 등 20개 편의시설
- [ ] `backend/scripts/seed_reviews.py` 생성
  - 각 숙소당 3-10개 후기

---

### Frontend Tasks

#### 1. 타입 정의 (1시간)
- [ ] `src/types/property.ts` 수정
  - PropertyDetail, PropertyImage, Amenity 인터페이스
- [ ] `src/types/review.ts` 생성
  - Review, ReviewImage 인터페이스

#### 2. API 클라이언트 (30분)
- [ ] `src/lib/api/property.ts` 수정
  - getPropertyDetail(id: string)
  - getSimilarProperties(id: string)
- [ ] `src/lib/api/review.ts` 생성
  - getPropertyReviews(propertyId: string, page: number)

#### 3. 컴포넌트 생성 (4시간)
- [ ] `src/components/property/ImageGallery.tsx`
  - 대표 이미지 + 썸네일 그리드
  - "사진 모두 보기" 버튼
- [ ] `src/components/property/ImageLightbox.tsx`
  - 전체화면 라이트박스 모달
  - 좌우 네비게이션, ESC 키 지원
- [ ] `src/components/property/PropertyHeader.tsx`
  - 숙소명, 위치, 평점, 공유, 위시리스트 버튼
- [ ] `src/components/property/HostStory.tsx`
  - 호스트 스토리 섹션
  - 가독성 높은 타이포그래피
- [ ] `src/components/property/PropertyInfo.tsx`
  - 최대 인원, 침실/침대/욕실 수
  - 편의시설 아이콘 리스트
  - 체크인/체크아웃 시간, 취소 정책
- [ ] `src/components/property/ReviewSection.tsx`
  - 평균 평점, 후기 카드 리스트
  - "후기 모두 보기" 버튼
- [ ] `src/components/property/BookingPanel.tsx`
  - 날짜 선택, 인원 선택
  - 총 가격 계산
  - "예약하기" 버튼
  - Sticky 처리 (데스크탑)
- [ ] `src/components/property/LocationMap.tsx`
  - Kakao Map 또는 Naver Map 임베드
- [ ] `src/components/property/SimilarProperties.tsx`
  - 유사 숙소 카드 4개

#### 4. 상세 페이지 생성 (1.5시간)
- [ ] `src/app/property/[id]/page.tsx` 생성
  - 서버 컴포넌트로 데이터 페칭
  - 모든 섹션 통합
  - 로딩 및 에러 상태 처리
- [ ] `src/app/property/[id]/loading.tsx` 생성
  - 스켈레톤 UI

#### 5. 공유 기능 (1시간)
- [ ] `src/components/property/ShareModal.tsx`
  - 링크 복사, 카카오톡, 페이스북 공유
  - Web Share API 활용 (모바일)

#### 6. 반응형 스타일링 (1시간)
- [ ] 모바일: 세로 스크롤, 예약 패널 하단 고정
- [ ] 데스크탑: 2열 레이아웃 (콘텐츠 | 예약 패널)
- [ ] Tailwind CSS Grid 및 Flexbox 활용

---

## 📚 Technical Notes

### 1. 이미지 라이트박스 라이브러리
**yet-another-react-lightbox** 추천:
```bash
npm install yet-another-react-lightbox
```

```tsx
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

<Lightbox
  open={isOpen}
  close={() => setIsOpen(false)}
  slides={images.map(img => ({ src: img.url }))}
  index={currentIndex}
/>
```

### 2. Sticky 예약 패널
```tsx
<div className="lg:sticky lg:top-24 lg:h-fit">
  <BookingPanel />
</div>
```

### 3. 지도 임베드 (Kakao Map)
```tsx
import { useEffect, useRef } from 'react';

const KakaoMap = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;

    const kakao = window.kakao;
    const mapOption = {
      center: new kakao.maps.LatLng(latitude, longitude),
      level: 5,
    };

    const map = new kakao.maps.Map(mapRef.current, mapOption);
    const markerPosition = new kakao.maps.LatLng(latitude, longitude);
    const marker = new kakao.maps.Marker({
      position: markerPosition,
    });

    marker.setMap(map);
  }, [latitude, longitude]);

  return <div ref={mapRef} className="w-full h-96" />;
};
```

### 4. 공유 기능 (Web Share API)
```tsx
const handleShare = async () => {
  if (navigator.share) {
    await navigator.share({
      title: property.name,
      text: property.description,
      url: window.location.href,
    });
  } else {
    // Fallback: 링크 복사
    await navigator.clipboard.writeText(window.location.href);
    toast.success('링크가 복사되었습니다');
  }
};
```

### 5. 유사 숙소 추천 로직 (Backend)
```python
# 1. 동일 태그를 가진 숙소 우선
same_tag_properties = (
    select(Property)
    .join(PropertyTag)
    .where(
        PropertyTag.tag_id.in_(current_property.tag_ids),
        Property.id != property_id
    )
    .group_by(Property.id)
    .order_by(func.count(PropertyTag.id).desc())
    .limit(4)
)

# 2. 동일 지역 숙소 차선
same_location_properties = (
    select(Property)
    .where(
        Property.province == current_property.province,
        Property.id != property_id
    )
    .order_by(Property.rating.desc())
    .limit(4)
)
```

### 6. SEO 최적화
- meta 태그: title, description, og:image
- 구조화된 데이터 (JSON-LD): Place, Organization
- Canonical URL 설정

---

## 🔗 Dependencies

- **story-007**: 태그 시스템 표시
- **story-009**: 리스팅 페이지에서 상세 페이지로 링크

---

## ✅ Definition of Done

- [ ] 이미지 갤러리가 라이트박스와 함께 작동
- [ ] 숙소 기본 정보 (이름, 위치, 평점, 태그) 표시
- [ ] 호스트 스토리 섹션 표시
- [ ] 편의시설 아이콘 목록 표시
- [ ] 후기 섹션에 최신 후기 3-5개 표시
- [ ] 지도에 숙소 위치 표시
- [ ] 예약 패널에서 날짜/인원 선택 및 가격 계산
- [ ] 데스크탑에서 예약 패널이 sticky
- [ ] 공유 버튼으로 링크 복사 또는 SNS 공유 가능
- [ ] 유사 숙소 4개 추천 표시
- [ ] 모바일/태블릿/데스크탑 반응형 작동
- [ ] API 응답 시간 < 800ms (로컬 환경 기준)
- [ ] 코드 리뷰 완료 및 main 브랜치 머지
- [ ] STORY-TRACKER.md 업데이트

---

## 📝 Notes

- 호스트 스토리는 ChonCance의 핵심 차별점이므로 가독성과 감성에 특히 신경 쓸 것
- 이미지는 고화질로 제공하되, Next.js Image 컴포넌트로 최적화
- 예약 패널의 날짜 선택은 story-011의 날짜 필터와 동일한 로직 사용
- 후기 작성 기능은 별도 스토리로 분리 (Epic 3 또는 4)
- 정확한 주소는 보안상 예약 후에만 공개 (PRD 참고)
