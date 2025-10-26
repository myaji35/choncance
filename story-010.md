# Story 010: 검색 기능

**Epic**: Epic 2 - 테마 기반 숙소 발견
**Story ID**: 010
**Story**: 통합 검색 기능 구현
**Priority**: High
**Estimate**: 8시간
**Status**: Not Started
**Dependencies**: story-009 (숙소 리스팅 페이지)

---

## 📋 Story Description

헤더에 검색창을 추가하여 사용자가 키워드(숙소명, 지역, 태그, 테마)로 숙소를 검색할 수 있도록 합니다. 자동완성 기능과 최근 검색어 기능을 제공하여 빠르고 편리한 검색 경험을 제공합니다.

### User Story
```
AS A 촌캉스를 계획하는 사용자
I WANT 헤더의 검색창에 키워드를 입력하여 숙소를 검색하고
SO THAT 원하는 숙소를 빠르게 찾을 수 있다
```

### Business Value
- 사용자가 원하는 숙소를 직접적으로 검색 가능
- 자동완성으로 검색 편의성 향상
- 검색 데이터 수집을 통한 인사이트 확보
- 전환율 향상 (검색 → 상세 → 예약)

---

## 🎯 Acceptance Criteria

### AC 1: 헤더 검색창
- [ ] 모든 페이지 헤더에 검색 input 표시
- [ ] 검색창 클릭 시 포커스 및 최근 검색어 표시
- [ ] 모바일에서는 검색 아이콘 클릭 시 전체화면 검색 모달

### AC 2: 자동완성
- [ ] 2글자 이상 입력 시 자동완성 드롭다운 표시
- [ ] 숙소명, 지역, 태그명에서 매칭
- [ ] 각 결과에 타입 표시 (숙소, 지역, 태그)
- [ ] 키보드 방향키로 선택 가능, Enter로 검색
- [ ] 최대 8개 결과 표시

### AC 3: 검색 실행
- [ ] Enter 또는 자동완성 항목 클릭 시 `/explore?search=keyword`로 이동
- [ ] 검색어는 URL 쿼리 파라미터로 유지
- [ ] 검색 결과 페이지에서 검색창에 검색어 유지

### AC 4: 최근 검색어
- [ ] 검색창 포커스 시 최근 검색어 5개 표시
- [ ] localStorage에 저장 (로그인 불필요)
- [ ] 각 검색어 옆에 삭제 버튼 (X)
- [ ] "전체 삭제" 버튼 제공

### AC 5: 검색 기록 저장 (로그인 사용자)
- [ ] 로그인된 사용자의 검색 기록을 서버에 저장
- [ ] 검색 분석 및 추천에 활용 (향후)

---

## 🧪 Gherkin Scenarios

### Scenario 1: 검색창 자동완성
```gherkin
Feature: 통합 검색

  Scenario: 사용자가 검색창에 키워드를 입력하면 자동완성이 표시된다
    Given 사용자가 헤더의 검색창을 클릭한다
    When "강릉"을 입력한다
    Then 자동완성 드롭다운이 나타난다
    And "강릉 바다뷰펜션" (숙소) 결과가 표시된다
    And "강원 강릉시" (지역) 결과가 표시된다
    And 최대 8개의 결과가 표시된다
```

### Scenario 2: 자동완성 항목 선택
```gherkin
  Scenario: 사용자가 자동완성 항목을 선택한다
    Given 검색창에 "강릉"을 입력하여 자동완성이 표시되어 있다
    When "강릉 바다뷰펜션" 항목을 클릭한다
    Then "/explore?search=강릉 바다뷰펜션" 페이지로 이동한다
    And 검색 결과가 표시된다
```

### Scenario 3: Enter 키로 검색
```gherkin
  Scenario: 사용자가 Enter 키를 눌러 검색한다
    Given 검색창에 "논뷰"를 입력한다
    When Enter 키를 누른다
    Then "/explore?search=논뷰" 페이지로 이동한다
    And "논뷰" 키워드가 포함된 숙소 목록이 표시된다
```

### Scenario 4: 최근 검색어 표시
```gherkin
  Scenario: 사용자가 검색창을 클릭하면 최근 검색어가 표시된다
    Given 사용자가 이전에 "강릉", "담양", "펜션"을 검색했다
    When 검색창을 클릭한다
    Then 최근 검색어 섹션이 표시된다
    And "강릉", "담양", "펜션"이 최근 순서대로 표시된다
```

### Scenario 5: 최근 검색어 삭제
```gherkin
  Scenario: 사용자가 최근 검색어를 삭제한다
    Given 최근 검색어로 "강릉", "담양", "펜션"이 표시되어 있다
    When "담양" 옆의 X 버튼을 클릭한다
    Then "담양"이 최근 검색어 목록에서 제거된다
    And "강릉", "펜션"만 표시된다
```

### Scenario 6: 모바일 검색
```gherkin
  Scenario: 모바일에서 검색 아이콘을 클릭한다
    Given 사용자가 모바일 환경에서 헤더를 보고 있다
    When 검색 아이콘(돋보기)을 클릭한다
    Then 전체화면 검색 모달이 나타난다
    And 검색창에 자동 포커스된다
```

### Scenario 7: 검색 기록 저장 (로그인 사용자)
```gherkin
  Scenario: 로그인한 사용자가 검색하면 기록이 서버에 저장된다
    Given 사용자가 로그인되어 있다
    When 검색창에 "강릉"을 입력하고 Enter를 누른다
    Then "/explore?search=강릉" 페이지로 이동한다
    And 검색 기록이 서버에 저장된다
```

---

## 🔧 API Specifications

### 1. GET /api/v1/search/autocomplete
**Description**: 자동완성 결과 조회

**Request**:
```http
GET /api/v1/search/autocomplete?q=강릉&limit=8
```

**Query Parameters**:
- `q` (required): 검색 키워드 (2글자 이상)
- `limit` (optional, default=8): 최대 결과 수

**Response** (200 OK):
```json
{
  "results": [
    {
      "type": "property",
      "id": "uuid",
      "name": "강릉 바다뷰펜션",
      "subtitle": "강원 강릉시",
      "image_url": "https://example.com/images/property1.jpg"
    },
    {
      "type": "property",
      "id": "uuid",
      "name": "강릉 오션힐링하우스",
      "subtitle": "강원 강릉시",
      "image_url": "https://example.com/images/property2.jpg"
    },
    {
      "type": "location",
      "id": "gangneung",
      "name": "강원 강릉시",
      "subtitle": "15개 숙소",
      "image_url": null
    },
    {
      "type": "tag",
      "id": "uuid",
      "name": "바다뷰",
      "subtitle": "태그",
      "emoji": "🌊",
      "color": "#4A90E2"
    }
  ]
}
```

---

### 2. POST /api/v1/search/history
**Description**: 검색 기록 저장 (로그인 사용자만)

**Request**:
```http
POST /api/v1/search/history
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "강릉",
  "result_count": 12
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "query": "강릉",
  "result_count": 12,
  "searched_at": "2025-01-15T15:30:00Z"
}
```

---

### 3. GET /api/v1/search/history
**Description**: 내 검색 기록 조회 (로그인 사용자만)

**Request**:
```http
GET /api/v1/search/history?limit=20
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit` (optional, default=20): 최대 결과 수

**Response** (200 OK):
```json
{
  "history": [
    {
      "id": "uuid",
      "query": "강릉",
      "result_count": 12,
      "searched_at": "2025-01-15T15:30:00Z"
    },
    {
      "id": "uuid",
      "query": "담양",
      "result_count": 8,
      "searched_at": "2025-01-15T14:20:00Z"
    }
  ]
}
```

---

### 4. DELETE /api/v1/search/history
**Description**: 검색 기록 전체 삭제 (로그인 사용자만)

**Request**:
```http
DELETE /api/v1/search/history
Authorization: Bearer <token>
```

**Response** (204 No Content)

---

## 🗄️ Database Schema

### Table: `search_history`
사용자 검색 기록 (로그인 사용자)

```sql
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(255) NOT NULL,
    result_count INTEGER DEFAULT 0,
    searched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_history_user ON search_history(user_id, searched_at DESC);
CREATE INDEX idx_search_history_query ON search_history(query);
```

---

## 🛠️ Implementation Tasks

### Backend Tasks

#### 1. 데이터베이스 마이그레이션 (30분)
- [ ] search_history 테이블 생성
- [ ] Alembic 마이그레이션 실행

#### 2. 모델 생성 (30분)
- [ ] `backend/app/models/search.py` 생성
  - SearchHistory 모델 정의

#### 3. 스키마 생성 (30분)
- [ ] `backend/app/schemas/search.py` 생성
  - AutocompleteRequest, AutocompleteResponse
  - SearchHistoryCreateRequest, SearchHistoryResponse

#### 4. API 엔드포인트 구현 (2.5시간)
- [ ] `backend/app/routers/search.py` 생성
  - GET /api/v1/search/autocomplete
    - Property, Location, Tag에서 ILIKE 검색
    - 각 타입별 최대 3-4개 결과
    - 전체 최대 8개
  - POST /api/v1/search/history (인증 필요)
  - GET /api/v1/search/history (인증 필요)
  - DELETE /api/v1/search/history (인증 필요)
- [ ] main.py에 라우터 등록

#### 5. 검색 로직 최적화 (1시간)
- [ ] Full-text search 인덱스 추가 (PostgreSQL GIN 인덱스)
- [ ] 검색 성능 테스트 및 튜닝

---

### Frontend Tasks

#### 1. 타입 정의 (30분)
- [ ] `src/types/search.ts` 생성
  - AutocompleteResult, SearchHistory 인터페이스

#### 2. API 클라이언트 (30분)
- [ ] `src/lib/api/search.ts` 생성
  - getAutocomplete(query: string)
  - saveSearchHistory(query: string, resultCount: number)
  - getSearchHistory()
  - deleteSearchHistory()

#### 3. 로컬스토리지 유틸리티 (30분)
- [ ] `src/lib/recentSearches.ts` 생성
  - addRecentSearch(query: string)
  - getRecentSearches(): string[]
  - removeRecentSearch(query: string)
  - clearRecentSearches()

#### 4. 컴포넌트 생성 (2시간)
- [ ] `src/components/header/SearchInput.tsx`
  - 검색 input, 아이콘, 클리어 버튼
  - 포커스 상태 관리
- [ ] `src/components/header/AutocompleteDropdown.tsx`
  - 자동완성 결과 표시
  - 타입별 아이콘 및 스타일
  - 키보드 네비게이션 (↑↓ 화살표, Enter)
- [ ] `src/components/header/RecentSearches.tsx`
  - 최근 검색어 목록
  - 개별 삭제 버튼
  - 전체 삭제 버튼
- [ ] `src/components/header/SearchModal.tsx` (모바일용)
  - 전체화면 검색 모달
  - SearchInput, AutocompleteDropdown, RecentSearches 포함

#### 5. 헤더 통합 (1시간)
- [ ] `src/components/Header.tsx` 수정
  - 데스크탑: SearchInput 헤더에 직접 포함
  - 모바일: 돋보기 아이콘, 클릭 시 SearchModal 오픈
- [ ] 검색 상태 관리 (useState, useDebounce)

#### 6. 검색 기능 통합 (1시간)
- [ ] 자동완성 API 호출 (debounce 300ms)
- [ ] 검색 실행 시 `/explore?search=keyword`로 라우팅
- [ ] 검색 기록 저장 (로그인 시 서버, 비로그인 시 로컬스토리지)
- [ ] 최근 검색어 클릭 시 검색 실행

---

## 📚 Technical Notes

### 1. Debounce 적용
```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce(async (query: string) => {
    if (query.length >= 2) {
      const results = await getAutocomplete(query);
      setAutocompleteResults(results);
    }
  }, 300),
  []
);
```

### 2. 키보드 네비게이션
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
  } else if (e.key === 'ArrowUp') {
    setSelectedIndex((prev) => Math.max(prev - 1, 0));
  } else if (e.key === 'Enter') {
    if (selectedIndex >= 0) {
      handleSelectResult(results[selectedIndex]);
    } else {
      handleSearch(query);
    }
  } else if (e.key === 'Escape') {
    setShowDropdown(false);
  }
};
```

### 3. Full-text Search 인덱스 (PostgreSQL)
```sql
-- GIN 인덱스 추가 (PostgreSQL)
CREATE INDEX idx_properties_name_gin ON properties USING GIN (to_tsvector('korean', name));
CREATE INDEX idx_properties_description_gin ON properties USING GIN (to_tsvector('korean', description));
```

### 4. 자동완성 쿼리 (Backend)
```python
from sqlalchemy import func, or_

# Property 검색
properties = await db.execute(
    select(Property)
    .where(
        or_(
            Property.name.ilike(f"%{query}%"),
            Property.location.ilike(f"%{query}%")
        )
    )
    .limit(4)
)

# Tag 검색
tags = await db.execute(
    select(Tag)
    .where(Tag.name.ilike(f"%{query}%"))
    .limit(3)
)

# Location 집계
locations = await db.execute(
    select(
        Property.location,
        func.count(Property.id).label('count')
    )
    .where(Property.location.ilike(f"%{query}%"))
    .group_by(Property.location)
    .limit(3)
)
```

### 5. 검색 분석 (향후)
- 검색 키워드 분석으로 트렌드 파악
- 검색 결과가 없는 키워드 모니터링
- 개인화 추천에 활용

---

## 🔗 Dependencies

- **story-009**: 검색 결과를 리스팅 페이지에서 표시
- **story-007**: 태그 검색 결과 표시

---

## ✅ Definition of Done

- [ ] 헤더에 검색창이 표시됨 (데스크탑/모바일)
- [ ] 2글자 이상 입력 시 자동완성 드롭다운 표시
- [ ] 자동완성 결과에 숙소, 지역, 태그 타입 구분 표시
- [ ] Enter 또는 자동완성 선택 시 검색 실행
- [ ] 검색창 포커스 시 최근 검색어 5개 표시
- [ ] 최근 검색어 개별 삭제 및 전체 삭제 가능
- [ ] 로그인 사용자의 검색 기록이 서버에 저장됨
- [ ] 키보드 네비게이션 (↑↓ 화살표, Enter, Esc) 작동
- [ ] 모바일에서 전체화면 검색 모달 작동
- [ ] API 응답 시간 < 300ms (로컬 환경 기준)
- [ ] 코드 리뷰 완료 및 main 브랜치 머지
- [ ] STORY-TRACKER.md 업데이트

---

## 📝 Notes

- 검색 결과 하이라이팅은 추후 개선 항목
- 검색 분석 대시보드는 관리자 페이지에서 구현 예정
- 음성 검색 기능은 향후 고려 사항
- 한글 초성 검색 지원은 향후 개선 항목 (예: "ㄱㄴ" → "강릉")
