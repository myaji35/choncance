# Story-007: 테마 태그 시스템 구축

**Epic**: Epic 2 - 테마 기반 숙소 발견
**User Story ID**: US-2.1
**Story Points**: 5
**Priority**: P0 (Critical)
**Dependencies**: None

---

## [What] 요구사항

### User Story

```
As a 서비스 관리자
I want to 테마 태그와 카테고리를 관리할 수 있다
So that 사용자들이 감성적이고 직관적으로 숙소를 발견할 수 있다
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: 테마 태그 목록 조회

```gherkin
Given: API가 실행 중일 때
When: GET /api/v1/tags 요청을 보내면
Then:
  * HTTP 200 OK 응답이 반환되고
  * 모든 테마 태그 목록이 반환된다
  * 각 태그는 id, name, category, icon, color 정보를 포함한다
```

**예상 Response (200 OK):**
```json
{
  "tags": [
    {
      "id": "uuid-1",
      "name": "논뷰맛집",
      "category": "VIEW",
      "icon": "🌾",
      "color": "#8BC34A",
      "created_at": "2025-10-26T12:00:00Z"
    },
    {
      "id": "uuid-2",
      "name": "불멍과별멍",
      "category": "ACTIVITY",
      "icon": "🔥",
      "color": "#FF5722",
      "created_at": "2025-10-26T12:00:00Z"
    }
  ]
}
```

---

#### Scenario 2: 카테고리별 태그 조회

```gherkin
Given: API가 실행 중일 때
When: GET /api/v1/tags?category=VIEW 요청을 보내면
Then:
  * HTTP 200 OK 응답이 반환되고
  * VIEW 카테고리에 속한 태그들만 반환된다
```

---

#### Scenario 3: 숙소에 태그 연결

```gherkin
Given: 호스트가 숙소를 등록할 때
When: 숙소에 태그 ID 목록을 지정하면
Then:
  * 숙소와 태그가 다대다 관계로 연결된다
  * 최대 5개까지 태그를 연결할 수 있다
```

---

## [How] 기술 구현

### API Endpoint 설계

#### GET /api/v1/tags

**설명**: 모든 테마 태그 목록 조회

**Query Parameters:**
- `category` (optional): 카테고리 필터 (VIEW, ACTIVITY, FACILITY, VIBE)

**Response (200 OK):**
```json
{
  "tags": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "icon": "string",
      "color": "string",
      "created_at": "datetime"
    }
  ]
}
```

---

#### POST /api/v1/properties/{property_id}/tags (관리자/호스트)

**설명**: 숙소에 태그 연결

**Request Body:**
```json
{
  "tag_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response (200 OK):**
```json
{
  "message": "태그가 성공적으로 연결되었습니다",
  "property_id": "uuid",
  "tags": [...]
}
```

---

### Database Schema

#### tags 테이블

| 컬럼명 | 타입 | 제약 조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 태그 고유 ID |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | 태그 이름 (예: "논뷰맛집") |
| `category` | ENUM | NOT NULL | 카테고리 (VIEW, ACTIVITY, FACILITY, VIBE) |
| `icon` | VARCHAR(10) | NULL | 이모지 아이콘 |
| `color` | VARCHAR(7) | NOT NULL | HEX 색상 코드 |
| `description` | TEXT | NULL | 태그 설명 |
| `display_order` | INT | DEFAULT 0 | 표시 순서 |
| `is_active` | BOOLEAN | DEFAULT TRUE | 활성화 여부 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |
| `updated_at` | TIMESTAMP | ON UPDATE NOW() | 수정 일시 |

**인덱스**:
- `idx_tags_category` ON (category)
- `idx_tags_is_active` ON (is_active)

---

#### Tag Category Enum

```python
class TagCategory(str, enum.Enum):
    VIEW = "VIEW"           # 뷰/전망 (논뷰맛집, 바다뷰, 산뷰)
    ACTIVITY = "ACTIVITY"   # 액티비티 (불멍과별멍, 아궁이체험)
    FACILITY = "FACILITY"   # 시설/편의 (반려동물동반, 개별바베큐장)
    VIBE = "VIBE"           # 분위기/감성 (혼자오기좋은, 가족과함께)
```

---

#### property_tags 테이블 (다대다 관계)

| 컬럼명 | 타입 | 제약 조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 관계 고유 ID |
| `property_id` | UUID | FOREIGN KEY (properties.id) | 숙소 ID |
| `tag_id` | UUID | FOREIGN KEY (tags.id) | 태그 ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 연결 일시 |

**제약 조건**:
- UNIQUE (property_id, tag_id) - 중복 연결 방지
- 하나의 property는 최대 5개 태그 제한 (애플리케이션 레벨)

---

### 초기 태그 데이터 (Seed Data)

```python
INITIAL_TAGS = [
    # VIEW 카테고리
    {"name": "논뷰맛집", "category": "VIEW", "icon": "🌾", "color": "#8BC34A"},
    {"name": "바다뷰", "category": "VIEW", "icon": "🌊", "color": "#2196F3"},
    {"name": "산뷰", "category": "VIEW", "icon": "⛰️", "color": "#795548"},
    {"name": "호수뷰", "category": "VIEW", "icon": "🏞️", "color": "#00BCD4"},

    # ACTIVITY 카테고리
    {"name": "불멍과별멍", "category": "ACTIVITY", "icon": "🔥", "color": "#FF5722"},
    {"name": "아궁이체험", "category": "ACTIVITY", "icon": "🪵", "color": "#FF9800"},
    {"name": "텃밭체험", "category": "ACTIVITY", "icon": "🌱", "color": "#4CAF50"},
    {"name": "낚시가능", "category": "ACTIVITY", "icon": "🎣", "color": "#03A9F4"},

    # FACILITY 카테고리
    {"name": "반려동물동반", "category": "FACILITY", "icon": "🐕", "color": "#E91E63"},
    {"name": "개별바베큐장", "category": "FACILITY", "icon": "🍖", "color": "#F44336"},
    {"name": "프라이빗풀", "category": "FACILITY", "icon": "🏊", "color": "#00BCD4"},
    {"name": "주차가능", "category": "FACILITY", "icon": "🚗", "color": "#9E9E9E"},

    # VIBE 카테고리
    {"name": "혼자오기좋은", "category": "VIBE", "icon": "🧘", "color": "#9C27B0"},
    {"name": "가족과함께", "category": "VIBE", "icon": "👨‍👩‍👧‍👦", "color": "#FF9800"},
    {"name": "친구와파티", "category": "VIBE", "icon": "🎉", "color": "#E91E63"},
    {"name": "조용한힐링", "category": "VIBE", "icon": "🕊️", "color": "#607D8B"},
]
```

---

## [Tasks] 구현 작업

### Phase 1: Backend (FastAPI) - 2시간

#### Task 1.1: Tag 모델 생성

**파일**: `backend/app/models/tag.py` (새로 생성)

```python
"""
Tag model for ChonCance
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class TagCategory(str, enum.Enum):
    """Tag categories"""
    VIEW = "VIEW"           # 뷰/전망
    ACTIVITY = "ACTIVITY"   # 액티비티
    FACILITY = "FACILITY"   # 시설/편의
    VIBE = "VIBE"           # 분위기/감성


class Tag(Base):
    """Tag table model"""
    __tablename__ = "tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(50), unique=True, nullable=False)
    category = Column(SQLEnum(TagCategory), nullable=False, index=True)
    icon = Column(String(10), nullable=True)
    color = Column(String(7), nullable=False)  # HEX color code
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Tag {self.name} ({self.category})>"


class PropertyTag(Base):
    """Property-Tag association table"""
    __tablename__ = "property_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("tags.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<PropertyTag property_id={self.property_id} tag_id={self.tag_id}>"
```

---

#### Task 1.2: Pydantic 스키마 생성

**파일**: `backend/app/schemas/tag.py` (새로 생성)

```python
"""
Pydantic schemas for Tag API
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TagResponse(BaseModel):
    """태그 응답 스키마"""
    id: str
    name: str
    category: str
    icon: Optional[str] = None
    color: str
    description: Optional[str] = None
    display_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class TagListResponse(BaseModel):
    """태그 목록 응답 스키마"""
    tags: List[TagResponse]


class PropertyTagsRequest(BaseModel):
    """숙소 태그 연결 요청 스키마"""
    tag_ids: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "tag_ids": ["uuid-1", "uuid-2", "uuid-3"]
            }
        }


class PropertyTagsResponse(BaseModel):
    """숙소 태그 연결 응답 스키마"""
    message: str
    property_id: str
    tags: List[TagResponse]
```

---

#### Task 1.3: Tag Router 생성

**파일**: `backend/app/routers/tag.py` (새로 생성)

```python
"""
Tag management router
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.models.tag import Tag, TagCategory
from app.schemas.tag import TagListResponse, TagResponse

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("", response_model=TagListResponse)
async def get_tags(
    category: Optional[str] = Query(None, description="카테고리 필터"),
    db: AsyncSession = Depends(get_db)
):
    """
    모든 태그 조회

    카테고리별로 필터링 가능
    """
    query = select(Tag).where(Tag.is_active == True).order_by(Tag.display_order, Tag.name)

    if category:
        query = query.where(Tag.category == category)

    result = await db.execute(query)
    tags = result.scalars().all()

    return TagListResponse(
        tags=[
            TagResponse(
                id=str(tag.id),
                name=tag.name,
                category=tag.category.value,
                icon=tag.icon,
                color=tag.color,
                description=tag.description,
                display_order=tag.display_order,
                created_at=tag.created_at
            )
            for tag in tags
        ]
    )
```

---

#### Task 1.4: 초기 태그 데이터 시드

**파일**: `backend/app/scripts/seed_tags.py` (새로 생성)

```python
"""
Seed initial tag data
"""
import asyncio
from app.core.database import async_session
from app.models.tag import Tag, TagCategory


INITIAL_TAGS = [
    # VIEW 카테고리
    {"name": "논뷰맛집", "category": TagCategory.VIEW, "icon": "🌾", "color": "#8BC34A", "display_order": 1},
    {"name": "바다뷰", "category": TagCategory.VIEW, "icon": "🌊", "color": "#2196F3", "display_order": 2},
    {"name": "산뷰", "category": TagCategory.VIEW, "icon": "⛰️", "color": "#795548", "display_order": 3},
    {"name": "호수뷰", "category": TagCategory.VIEW, "icon": "🏞️", "color": "#00BCD4", "display_order": 4},

    # ACTIVITY 카테고리
    {"name": "불멍과별멍", "category": TagCategory.ACTIVITY, "icon": "🔥", "color": "#FF5722", "display_order": 5},
    {"name": "아궁이체험", "category": TagCategory.ACTIVITY, "icon": "🪵", "color": "#FF9800", "display_order": 6},
    {"name": "텃밭체험", "category": TagCategory.ACTIVITY, "icon": "🌱", "color": "#4CAF50", "display_order": 7},
    {"name": "낚시가능", "category": TagCategory.ACTIVITY, "icon": "🎣", "color": "#03A9F4", "display_order": 8},

    # FACILITY 카테고리
    {"name": "반려동물동반", "category": TagCategory.FACILITY, "icon": "🐕", "color": "#E91E63", "display_order": 9},
    {"name": "개별바베큐장", "category": TagCategory.FACILITY, "icon": "🍖", "color": "#F44336", "display_order": 10},
    {"name": "프라이빗풀", "category": TagCategory.FACILITY, "icon": "🏊", "color": "#00BCD4", "display_order": 11},
    {"name": "주차가능", "category": TagCategory.FACILITY, "icon": "🚗", "color": "#9E9E9E", "display_order": 12},

    # VIBE 카테고리
    {"name": "혼자오기좋은", "category": TagCategory.VIBE, "icon": "🧘", "color": "#9C27B0", "display_order": 13},
    {"name": "가족과함께", "category": TagCategory.VIBE, "icon": "👨‍👩‍👧‍👦", "color": "#FF9800", "display_order": 14},
    {"name": "친구와파티", "category": TagCategory.VIBE, "icon": "🎉", "color": "#E91E63", "display_order": 15},
    {"name": "조용한힐링", "category": TagCategory.VIBE, "icon": "🕊️", "color": "#607D8B", "display_order": 16},
]


async def seed_tags():
    """태그 초기 데이터 삽입"""
    async with async_session() as session:
        for tag_data in INITIAL_TAGS:
            # 이미 존재하는지 확인
            result = await session.execute(
                select(Tag).where(Tag.name == tag_data["name"])
            )
            existing_tag = result.scalar_one_or_none()

            if not existing_tag:
                tag = Tag(**tag_data)
                session.add(tag)
                print(f"Added tag: {tag.name}")
            else:
                print(f"Tag already exists: {tag_data['name']}")

        await session.commit()
        print("Tag seeding completed!")


if __name__ == "__main__":
    asyncio.run(seed_tags())
```

---

### Phase 2: Frontend - 1시간

#### Task 2.1: Tag 타입 정의

**파일**: `src/types/tag.ts` (새로 생성)

```typescript
export interface Tag {
  id: string;
  name: string;
  category: 'VIEW' | 'ACTIVITY' | 'FACILITY' | 'VIBE';
  icon?: string;
  color: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface TagListResponse {
  tags: Tag[];
}
```

---

#### Task 2.2: Tag API 클라이언트

**파일**: `src/lib/api/tags.ts` (새로 생성)

```typescript
import { Tag, TagListResponse } from '@/types/tag';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function getTags(category?: string): Promise<Tag[]> {
  const url = new URL(`${API_BASE_URL}/tags`);
  if (category) {
    url.searchParams.append('category', category);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  const data: TagListResponse = await response.json();
  return data.tags;
}
```

---

## Definition of Done

### Backend
- [ ] Tag 모델 생성
- [ ] PropertyTag 관계 테이블 생성
- [ ] GET /api/v1/tags 엔드포인트 구현
- [ ] 카테고리 필터링 기능 작동
- [ ] 초기 태그 데이터 시드 스크립트 실행
- [ ] API 테스트 통과

### Frontend
- [ ] Tag 타입 정의
- [ ] Tag API 클라이언트 구현
- [ ] 태그 목록 조회 가능

### Database
- [ ] tags 테이블 마이그레이션 완료
- [ ] property_tags 테이블 마이그레이션 완료
- [ ] 초기 데이터 16개 태그 삽입 완료

### Documentation
- [ ] API 엔드포인트 Swagger 문서화
- [ ] STORY-TRACKER.md 업데이트

---

## Time Estimate

| Phase | Estimated Time |
|-------|----------------|
| Phase 1: Backend | 2시간 |
| Phase 2: Frontend | 1시간 |
| **Total** | **3시간** |

---

## Dependencies

### Prerequisites
- ✅ Database 설정 완료
- ✅ Backend 서버 실행 중

### Related Stories
- **Next Story**: US-2.2 (메인 페이지 큐레이션) - story-008.md
- **Blocks**: US-2.2, US-2.3, US-2.6 (모든 숙소 관련 기능)

---

## Notes

- 태그 시스템은 모든 숙소 발견 기능의 기반이 됨
- 초기에는 관리자가 수동으로 태그 관리
- 향후 호스트가 직접 태그 선택 가능하도록 확장 가능
- 태그는 최대 5개까지 제한 (UX 고려)
