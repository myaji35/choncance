# Architecture Specification
# ChonCance (촌캉스) - 농촌 휴가 체험 큐레이션 플랫폼

**문서 버전**: 1.0 (초안)
**작성일**: 2025-10-26
**타겟 런칭**: 2025년 11월 말 (1개월)
**작성자**: Business Analyst (Mary)
**상태**: Draft

---

## 목차

1. [개요](#1-개요)
2. [기술 스택](#2-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [API 설계](#4-api-설계)
5. [데이터 모델](#5-데이터-모델)
6. [보안 고려사항](#6-보안-고려사항)
7. [배포 전략](#7-배포-전략)
8. [성능 최적화](#8-성능-최적화)

---

## 1. 개요

### 1.1 목적
본 문서는 ChonCance 플랫폼의 기술 아키텍처를 정의합니다. PRD.md에 명시된 기능 요구사항을 구현하기 위한 기술적 설계와 구현 방안을 제시합니다.

### 1.2 아키텍처 원칙
- **관심사의 분리**: 백엔드(FastAPI)와 프론트엔드(Next.js) 명확한 분리
- **확장성**: 수평적 확장 가능한 구조
- **보안**: PIPA 준수 및 HTTPS, JWT 기반 인증
- **성능**: 2초 이내 페이지 로딩, 500ms 이내 API 응답
- **유지보수성**: 모듈화된 코드베이스, 명확한 API 계약

### 1.3 기술적 제약 조건
- **백엔드**: Python FastAPI
- **프론트엔드**: Next.js 14+ (App Router)
- **데이터베이스**: PostgreSQL
- **배포**: Vercel (프론트엔드), AWS/GCP/Heroku (백엔드)
- **결제**: 토스페이먼츠 PG 연동

---

## 2. 기술 스택

### 2.1 백엔드 (API Server)

**프레임워크**: Python FastAPI 0.100+
- 비동기 지원 (async/await)
- 자동 API 문서 생성 (OpenAPI/Swagger)
- Pydantic을 통한 데이터 검증
- 빠른 성능 (Starlette + Uvicorn)

**ORM**: SQLAlchemy 2.0+ (async)
- PostgreSQL 연동
- 마이그레이션: Alembic

**인증**:
- JWT (JSON Web Token)
- bcrypt (비밀번호 해싱)
- OAuth 2.0 (카카오 소셜 로그인)

**주요 라이브러리**:
```python
fastapi==0.100.0
sqlalchemy==2.0.0
alembic==1.11.0
psycopg2-binary==2.9.0  # PostgreSQL 드라이버
pydantic==2.0.0
python-jose[cryptography]==3.3.0  # JWT
passlib[bcrypt]==1.7.4  # 비밀번호 해싱
python-multipart==0.0.6  # 파일 업로드
httpx==0.24.0  # 외부 API 호출 (토스페이먼츠, 카카오)
uvicorn==0.23.0  # ASGI 서버
```

---

### 2.2 프론트엔드

**프레임워크**: Next.js 14+ (App Router)
- React Server Components
- 서버 사이드 렌더링 (SSR)
- 정적 사이트 생성 (SSG)

**언어**: TypeScript 5.x (strict mode)

**스타일링**:
- Tailwind CSS 3.4+
- shadcn/ui (Radix UI primitives)
- lucide-react (아이콘)

**폼 처리**:
- react-hook-form 7.x
- Zod 4.x (클라이언트 측 검증)

**HTTP 클라이언트**:
- Fetch API (Next.js 내장)
- axios (복잡한 요청 시)

**상태 관리**:
- React Context (전역 상태)
- URL 상태 (Next.js router)

---

### 2.3 데이터베이스

**DBMS**: PostgreSQL 15+

**호스팅 옵션**:
- Vercel Postgres (권장 - 프론트엔드와 동일 플랫폼)
- AWS RDS PostgreSQL
- Supabase (PostgreSQL + 추가 기능)

**확장 기능**:
- pgvector (향후 AI 추천 시)
- PostGIS (지도 기능 고도화 시)

---

### 2.4 인프라 및 배포

**프론트엔드 호스팅**: Vercel
- 자동 배포 (GitHub 연동)
- Edge Network CDN
- HTTPS 자동 인증서
- 환경 변수 관리

**백엔드 호스팅 옵션**:
1. **Railway** (권장 - 간편한 FastAPI 배포)
2. **Render** (무료 티어 제공)
3. **AWS EC2** + Nginx (더 많은 제어 필요 시)
4. **Google Cloud Run** (서버리스 컨테이너)

**이미지 스토리지**:
- Vercel Blob 또는 AWS S3
- CDN: CloudFront 또는 Vercel Edge

**모니터링**:
- Sentry (에러 추적)
- Vercel Analytics (프론트엔드)
- FastAPI 내장 로깅 + CloudWatch/DataDog (백엔드)

---

## 3. 시스템 아키텍처

### 3.1 전체 시스템 구성도

```mermaid
graph TB
    subgraph "클라이언트"
        Browser[웹 브라우저]
        Mobile[모바일 브라우저]
    end

    subgraph "프론트엔드 (Vercel)"
        NextJS[Next.js 14 App<br/>React Server Components<br/>Tailwind CSS]
        StaticAssets[정적 자산<br/>이미지, CSS, JS]
    end

    subgraph "백엔드 API (Railway/Render)"
        FastAPI[FastAPI Server<br/>Uvicorn ASGI]
        Auth[인증 모듈<br/>JWT, OAuth]
        Business[비즈니스 로직<br/>예약, 결제, 리뷰]
    end

    subgraph "데이터 레이어"
        PostgreSQL[(PostgreSQL<br/>사용자, 숙소<br/>예약, 리뷰)]
        Redis[(Redis<br/>세션, 캐시)]
    end

    subgraph "외부 서비스"
        Kakao[카카오 로그인<br/>OAuth 2.0]
        Toss[토스페이먼츠<br/>PG API]
        Email[이메일 서비스<br/>SendGrid/SES]
        Storage[이미지 스토리지<br/>S3/Vercel Blob]
    end

    Browser --> NextJS
    Mobile --> NextJS
    NextJS --> FastAPI
    NextJS --> StaticAssets

    FastAPI --> Auth
    FastAPI --> Business

    Auth --> PostgreSQL
    Auth --> Redis
    Auth --> Kakao

    Business --> PostgreSQL
    Business --> Toss
    Business --> Email
    Business --> Storage

    StaticAssets --> Storage

    style NextJS fill:#0070f3,color:#fff
    style FastAPI fill:#009688,color:#fff
    style PostgreSQL fill:#336791,color:#fff
    style Redis fill:#dc382d,color:#fff
```

### 3.2 요청 흐름 (Request Flow)

#### 3.2.1 사용자 회원가입 플로우

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Next as Next.js Frontend
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant Email as Email Service

    User->>Next: 회원가입 폼 작성
    Note over User,Next: 이메일, 비밀번호, 이름, 전화번호, 약관 동의

    Next->>Next: 클라이언트 측 검증 (Zod)
    Note over Next: 이메일 형식, 비밀번호 강도

    Next->>API: POST /api/v1/auth/register
    Note over Next,API: JSON Body

    API->>API: 서버 측 검증 (Pydantic)

    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: 결과 반환

    alt 이메일 중복
        API-->>Next: 409 Conflict (이미 가입된 이메일)
        Next-->>User: 에러 메시지 표시
    else 이메일 사용 가능
        API->>API: 비밀번호 해싱 (bcrypt)
        API->>DB: INSERT INTO users (...)
        DB-->>API: User ID 반환

        API->>API: JWT 토큰 생성
        API->>Email: 가입 환영 이메일 발송

        API-->>Next: 201 Created + JWT Token
        Next->>Next: 토큰 저장 (Cookie/LocalStorage)
        Next-->>User: 메인 페이지로 리다이렉트
    end
```

---

## 4. API 설계

### 4.1 API 기본 정보

**Base URL**: `https://api.choncance.com/api/v1`

**인증 방식**:
- JWT Bearer Token
- Header: `Authorization: Bearer <token>`

**응답 형식**: JSON

**HTTP 상태 코드**:
- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `409 Conflict`: 중복 (예: 이메일)
- `422 Unprocessable Entity`: 검증 실패
- `500 Internal Server Error`: 서버 오류

---

### 4.2 US-1.1: 회원가입 API 설계

#### 4.2.1 회원가입 (이메일/비밀번호)

**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "agreed_to_terms": true,
  "agreed_to_privacy": true
}
```

**Request Schema (Pydantic)**:
```python
from pydantic import BaseModel, EmailStr, Field, validator
import re

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=2, max_length=50)
    phone: str = Field(..., pattern=r'^\d{3}-\d{4}-\d{4}$')
    agreed_to_terms: bool
    agreed_to_privacy: bool

    @validator('password')
    def validate_password(cls, v):
        # 영문 + 숫자 조합 검증
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('비밀번호는 영문을 포함해야 합니다')
        if not re.search(r'\d', v):
            raise ValueError('비밀번호는 숫자를 포함해야 합니다')
        return v

    @validator('agreed_to_terms', 'agreed_to_privacy')
    def validate_agreement(cls, v):
        if not v:
            raise ValueError('이용약관과 개인정보 처리방침에 동의해주세요')
        return v
```

**Response (Success - 201 Created)**:
```json
{
  "user": {
    "id": "cuid_abc123",
    "email": "user@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "role": "GUEST",
    "created_at": "2025-10-26T12:00:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

**Response (Error - 409 Conflict)**:
```json
{
  "detail": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "이미 가입된 이메일입니다"
  }
}
```

**Response (Error - 422 Validation Error)**:
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "비밀번호는 8자 이상이어야 합니다",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

---

#### 4.2.2 FastAPI 구현 예시

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 비밀번호 해싱
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# JWT 토큰 생성
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    # 1. 이메일 중복 확인
    existing_user = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "EMAIL_ALREADY_EXISTS",
                "message": "이미 가입된 이메일입니다"
            }
        )

    # 2. 비밀번호 해싱
    hashed_password = hash_password(user_data.password)

    # 3. 사용자 생성
    new_user = User(
        email=user_data.email,
        password=hashed_password,
        name=user_data.name,
        phone=user_data.phone,
        role=UserRole.GUEST,
        created_at=datetime.utcnow()
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # 4. JWT 토큰 생성
    access_token = create_access_token(
        data={"sub": new_user.id, "email": new_user.email}
    )

    # 5. 환영 이메일 발송 (비동기 작업)
    # await send_welcome_email(new_user.email, new_user.name)

    return {
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "phone": new_user.phone,
            "role": new_user.role,
            "created_at": new_user.created_at
        },
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 86400
    }
```

---

### 4.3 기타 인증 관련 API

#### 4.3.1 로그인

**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**:
```json
{
  "user": { ... },
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

---

#### 4.3.2 카카오 로그인 (OAuth)

**Endpoint**: `GET /api/v1/auth/kakao/authorize`

→ 카카오 OAuth URL로 리다이렉트

**Callback Endpoint**: `GET /api/v1/auth/kakao/callback`

**Query Parameters**: `code`, `state`

**Response**: 자동 생성된 JWT 토큰 + 프론트엔드로 리다이렉트

---

#### 4.3.3 현재 사용자 정보 조회

**Endpoint**: `GET /api/v1/auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:
```json
{
  "id": "cuid_abc123",
  "email": "user@example.com",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "role": "GUEST",
  "profile_image": "https://...",
  "created_at": "2025-10-26T12:00:00Z"
}
```

---

#### 4.3.4 로그아웃

**Endpoint**: `POST /api/v1/auth/logout`

**Headers**: `Authorization: Bearer <token>`

**Response (204 No Content)**: 빈 응답

※ JWT는 stateless이므로 서버 측에서는 토큰을 무효화하지 않고, 클라이언트에서 토큰 삭제

---

## 5. 데이터 모델

### 5.1 ER Diagram

```mermaid
erDiagram
    USER ||--o{ PROPERTY : hosts
    USER ||--o{ BOOKING : makes
    USER ||--o{ REVIEW : writes
    USER ||--o{ REPORT : creates

    PROPERTY ||--o{ BOOKING : has
    PROPERTY ||--o{ REVIEW : receives
    PROPERTY ||--o{ EXPERIENCE : offers
    PROPERTY }o--o{ TAG : tagged_with

    BOOKING ||--|| PAYMENT : has
    BOOKING }o--o{ EXPERIENCE : includes

    USER {
        uuid id PK
        string email UK
        string password
        string name
        string phone
        enum role
        string profile_image
        string business_info
        boolean is_host_approved
        timestamp created_at
        timestamp updated_at
    }

    PROPERTY {
        uuid id PK
        uuid host_id FK
        string name
        text description
        string location
        string address
        enum property_type
        integer price_per_night
        jsonb amenities
        jsonb inconveniences
        text host_story
        string[] images
        string[] videos
        boolean is_approved
        timestamp created_at
        timestamp updated_at
    }

    TAG {
        uuid id PK
        string name UK
        string slug UK
        string icon
        timestamp created_at
    }

    EXPERIENCE {
        uuid id PK
        uuid property_id FK
        string name
        text description
        integer price
        integer duration
        timestamp created_at
        timestamp updated_at
    }

    BOOKING {
        uuid id PK
        uuid user_id FK
        uuid property_id FK
        date check_in
        date check_out
        integer guests
        text special_request
        integer accommodation_price
        integer experience_price
        integer service_fee
        integer total_price
        enum status
        timestamp created_at
        timestamp updated_at
    }

    PAYMENT {
        uuid id PK
        uuid booking_id FK
        integer amount
        string method
        string payment_key UK
        string order_id UK
        enum status
        timestamp created_at
        timestamp updated_at
    }

    REVIEW {
        uuid id PK
        uuid user_id FK
        uuid property_id FK
        integer rating
        text comment
        text host_reply
        timestamp created_at
        timestamp updated_at
    }

    REPORT {
        uuid id PK
        uuid user_id FK
        uuid property_id FK
        enum report_type
        text title
        text content
        jsonb attachments
        enum status
        timestamp created_at
        timestamp updated_at
    }
```

---

### 5.2 User (사용자) 테이블

**테이블명**: `users`

| 컬럼명 | 타입 | 제약 조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 사용자 고유 ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| `password` | VARCHAR(255) | NULL | 비밀번호 해시 (소셜 로그인 시 NULL) |
| `name` | VARCHAR(100) | NOT NULL | 사용자 이름 |
| `phone` | VARCHAR(20) | NOT NULL | 전화번호 (010-1234-5678) |
| `role` | ENUM('GUEST', 'HOST', 'ADMIN') | NOT NULL, DEFAULT 'GUEST' | 사용자 역할 |
| `profile_image` | TEXT | NULL | 프로필 이미지 URL |
| `business_info` | TEXT | NULL | 호스트 사업자 정보 (선택) |
| `is_host_approved` | BOOLEAN | DEFAULT FALSE | 호스트 승인 여부 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정 일시 |

**인덱스**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**SQLAlchemy Model**:
```python
from sqlalchemy import Column, String, Boolean, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

class UserRole(enum.Enum):
    GUEST = "GUEST"
    HOST = "HOST"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=True)  # 소셜 로그인 시 NULL
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.GUEST, index=True)
    profile_image = Column(String, nullable=True)
    business_info = Column(String, nullable=True)
    is_host_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    properties = relationship("Property", back_populates="host")
    bookings = relationship("Booking", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    reports = relationship("Report", back_populates="user")
```

---

### 5.3 Report (작업보고서) 테이블

**테이블명**: `reports`

**용도**: 호스트가 숙소 운영 상태, 예약 이슈, 시설 점검 등을 보고하는 작업보고서

| 컬럼명 | 타입 | 제약 조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 보고서 고유 ID |
| `user_id` | UUID | FOREIGN KEY (users.id), NOT NULL | 작성자 (호스트) ID |
| `property_id` | UUID | FOREIGN KEY (properties.id), NULL | 관련 숙소 ID (선택) |
| `report_type` | ENUM | NOT NULL | 보고서 유형 |
| `title` | VARCHAR(200) | NOT NULL | 보고서 제목 |
| `content` | TEXT | NOT NULL | 보고서 내용 |
| `attachments` | JSONB | NULL | 첨부 파일 정보 (URL, 파일명 등) |
| `status` | ENUM('DRAFT', 'SUBMITTED', 'REVIEWED', 'RESOLVED') | DEFAULT 'DRAFT' | 보고서 상태 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정 일시 |

**Report Type Enum**:
- `OPERATION`: 운영 보고 (예약 현황, 수익 등)
- `MAINTENANCE`: 시설 점검/수리
- `ISSUE`: 문제 발생 (예약 취소, 게스트 불만 등)
- `INQUIRY`: 문의 사항
- `OTHER`: 기타

**인덱스**:
```sql
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_property_id ON reports(property_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```

**SQLAlchemy Model**:
```python
from sqlalchemy import Column, String, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum

class ReportType(enum.Enum):
    OPERATION = "OPERATION"
    MAINTENANCE = "MAINTENANCE"
    ISSUE = "ISSUE"
    INQUIRY = "INQUIRY"
    OTHER = "OTHER"

class ReportStatus(enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    REVIEWED = "REVIEWED"
    RESOLVED = "RESOLVED"

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=True, index=True)
    report_type = Column(Enum(ReportType), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    attachments = Column(JSONB, nullable=True)  # {"files": [{"url": "...", "name": "..."}]}
    status = Column(Enum(ReportStatus), nullable=False, default=ReportStatus.DRAFT, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="reports")
    property = relationship("Property", back_populates="reports")
```

---

### 5.4 기타 주요 테이블 (요약)

#### 5.4.1 Property (숙소)
- PRD.md의 Prisma 스키마 참조
- 주요 필드: name, description, location, price_per_night, amenities (JSONB), images (TEXT[])

#### 5.4.2 Booking (예약)
- 주요 필드: user_id, property_id, check_in, check_out, total_price, status

#### 5.4.3 Payment (결제)
- 주요 필드: booking_id, amount, payment_key (토스페이먼츠), status

#### 5.4.4 Review (리뷰)
- 주요 필드: user_id, property_id, rating, comment, host_reply

#### 5.4.5 Tag (테마 태그)
- 주요 필드: name, slug, icon

#### 5.4.6 Experience (경험)
- 주요 필드: property_id, name, description, price, duration

---

### 5.5 데이터베이스 마이그레이션 (Alembic)

**초기 마이그레이션 생성**:
```bash
# Alembic 초기화
alembic init alembic

# 마이그레이션 파일 생성
alembic revision --autogenerate -m "Initial migration: users and reports tables"

# 마이그레이션 실행
alembic upgrade head
```

**alembic.ini 설정**:
```ini
sqlalchemy.url = postgresql+asyncpg://user:password@localhost/choncance
```

---

## 6. 보안 고려사항

### 6.1 인증 및 권한 관리

#### 6.1.1 JWT 토큰 설정
```python
SECRET_KEY = os.getenv("SECRET_KEY")  # 환경 변수
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24시간
```

#### 6.1.2 비밀번호 정책
- 최소 8자 이상
- 영문 + 숫자 조합 필수
- bcrypt 해싱 (Salt 자동 생성)

#### 6.1.3 역할 기반 접근 제어 (RBAC)
```python
from fastapi import Depends, HTTPException, status

def require_role(required_role: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="권한이 없습니다"
            )
        return current_user
    return role_checker

# 사용 예시
@router.get("/admin/users")
async def get_all_users(admin: User = Depends(require_role(UserRole.ADMIN))):
    # 관리자만 접근 가능
    pass
```

---

### 6.2 데이터 보호

#### 6.2.1 HTTPS 강제
- Vercel: 자동 HTTPS
- FastAPI: Nginx 리버스 프록시 + Let's Encrypt SSL

#### 6.2.2 SQL Injection 방지
- SQLAlchemy ORM 사용 (파라미터화된 쿼리)
- 사용자 입력 검증 (Pydantic)

#### 6.2.3 XSS 방지
- Pydantic 스키마로 입력 검증
- 프론트엔드: React의 기본 XSS 보호 + DOMPurify (필요 시)

#### 6.2.4 CSRF 방지
- SameSite Cookie 설정
- CORS 정책 적용

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://choncance.com"],  # 프론트엔드 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 6.3 개인정보 보호법 (PIPA) 준수

#### 6.3.1 개인정보 수집 동의
- 회원가입 시 명시적 동의 필수
  - `agreed_to_terms`: 이용약관
  - `agreed_to_privacy`: 개인정보 처리방침

#### 6.3.2 개인정보 암호화
- 비밀번호: bcrypt 해싱
- 민감 정보 (카드번호 등): 토스페이먼츠에서 처리 (ChonCance는 저장 안 함)

#### 6.3.3 접근 로그
```python
# 개인정보 접근 로그 기록
@router.get("/users/{user_id}")
async def get_user(user_id: UUID, current_user: User = Depends(get_current_user)):
    # 접근 로그 기록
    await log_personal_data_access(
        accessor_id=current_user.id,
        target_user_id=user_id,
        action="VIEW_USER_PROFILE"
    )
    # ...
```

---

### 6.4 Rate Limiting

**목적**: DDoS, Brute Force 공격 방지

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")  # 1분에 5회 제한
async def login(request: Request, ...):
    pass
```

---

## 7. 배포 전략

### 7.1 배포 환경

| 환경 | 프론트엔드 | 백엔드 | 데이터베이스 |
|------|-----------|--------|-------------|
| **개발** | localhost:3000 | localhost:8000 | PostgreSQL (로컬) |
| **스테이징** | staging.choncance.com (Vercel) | staging-api.choncance.com (Railway) | PostgreSQL (Staging DB) |
| **프로덕션** | choncance.com (Vercel) | api.choncance.com (Railway) | PostgreSQL (Production DB) |

---

### 7.2 CI/CD 파이프라인

```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C{Branch?}

    C -->|main| D[Production Build]
    C -->|staging| E[Staging Build]
    C -->|dev| F[Dev Build]

    D --> G[Run Tests]
    E --> G
    F --> G

    G --> H{Tests Pass?}

    H -->|Yes| I[Deploy to Vercel Frontend]
    H -->|No| J[Notify Failure]

    I --> K[Deploy to Railway Backend]
    K --> L[Run DB Migrations]
    L --> M[Health Check]
    M --> N{Healthy?}

    N -->|Yes| O[Complete Deployment]
    N -->|No| P[Rollback]

    O --> Q[Send Notification]
    P --> Q
```

---

### 7.3 환경 변수 관리

**프론트엔드 (.env.local - Next.js)**:
```bash
NEXT_PUBLIC_API_URL=https://api.choncance.com
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
```

**백엔드 (.env - FastAPI)**:
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/choncance

# JWT
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=https://api.choncance.com/api/v1/auth/kakao/callback

# Payment
TOSS_SECRET_KEY=your_toss_secret_key

# Email
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@choncance.com

# Storage
AWS_S3_BUCKET=choncance-images
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

---

### 7.4 도커 컨테이너화 (옵션)

**Dockerfile (FastAPI)**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml (로컬 개발)**:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:password@db:5432/choncance
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: choncance
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 8. 성능 최적화

### 8.1 백엔드 최적화

#### 8.1.1 비동기 처리
```python
# 비동기 데이터베이스 쿼리
async def get_properties(db: AsyncSession):
    result = await db.execute(select(Property).limit(20))
    return result.scalars().all()

# 비동기 외부 API 호출
async def send_payment_request(payment_data):
    async with httpx.AsyncClient() as client:
        response = await client.post(TOSS_API_URL, json=payment_data)
        return response.json()
```

#### 8.1.2 데이터베이스 쿼리 최적화
- **Eager Loading**: N+1 문제 방지
```python
# Bad: N+1 문제 발생
properties = await db.execute(select(Property))
for property in properties:
    host = await db.execute(select(User).where(User.id == property.host_id))

# Good: Join으로 한 번에 조회
properties = await db.execute(
    select(Property).options(joinedload(Property.host))
)
```

- **인덱싱**: 자주 조회되는 컬럼에 인덱스
```sql
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
```

#### 8.1.3 캐싱 (Redis)
```python
import redis.asyncio as redis

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

@router.get("/properties/{id}")
async def get_property(id: UUID):
    # 캐시 확인
    cached = await redis_client.get(f"property:{id}")
    if cached:
        return json.loads(cached)

    # DB 조회
    property = await db.get(Property, id)

    # 캐시 저장 (1시간)
    await redis_client.setex(
        f"property:{id}",
        3600,
        json.dumps(property.dict())
    )

    return property
```

---

### 8.2 프론트엔드 최적화

#### 8.2.1 Next.js Image 최적화
```tsx
import Image from 'next/image';

<Image
  src="/property.jpg"
  alt="숙소 이미지"
  width={800}
  height={600}
  loading="lazy"
  quality={85}
/>
```

#### 8.2.2 Server Components 활용
```tsx
// Server Component (데이터 페칭 서버에서)
export default async function PropertiesPage() {
  const properties = await fetch('https://api.choncance.com/api/v1/properties');

  return <PropertyList properties={properties} />;
}
```

#### 8.2.3 Dynamic Imports (코드 분할)
```tsx
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/Map'), {
  loading: () => <p>지도 로딩 중...</p>,
  ssr: false  // 클라이언트에서만 렌더링
});
```

---

### 8.3 모니터링 및 로깅

#### 8.3.1 성능 모니터링
- **프론트엔드**: Vercel Analytics, Web Vitals
- **백엔드**: Sentry, DataDog

#### 8.3.2 로깅 전략
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@router.post("/bookings")
async def create_booking(booking_data: BookingRequest):
    logger.info(f"Creating booking for user {booking_data.user_id}")
    try:
        # ...
    except Exception as e:
        logger.error(f"Booking creation failed: {str(e)}", exc_info=True)
        raise
```

---

## 부록 A: API 전체 목록 (요약)

| 분류 | Endpoint | Method | 설명 |
|------|----------|--------|------|
| **인증** | `/api/v1/auth/register` | POST | 회원가입 |
| | `/api/v1/auth/login` | POST | 로그인 |
| | `/api/v1/auth/logout` | POST | 로그아웃 |
| | `/api/v1/auth/me` | GET | 현재 사용자 정보 |
| | `/api/v1/auth/kakao/authorize` | GET | 카카오 로그인 |
| **숙소** | `/api/v1/properties` | GET | 숙소 목록 조회 |
| | `/api/v1/properties/{id}` | GET | 숙소 상세 조회 |
| | `/api/v1/properties` | POST | 숙소 등록 (호스트) |
| | `/api/v1/properties/{id}` | PUT | 숙소 수정 |
| **예약** | `/api/v1/bookings` | POST | 예약 생성 |
| | `/api/v1/bookings/{id}` | GET | 예약 상세 |
| | `/api/v1/bookings/{id}/cancel` | POST | 예약 취소 |
| **결제** | `/api/v1/payments` | POST | 결제 요청 |
| | `/api/v1/payments/{id}` | GET | 결제 상태 조회 |
| **리뷰** | `/api/v1/reviews` | POST | 리뷰 작성 |
| | `/api/v1/properties/{id}/reviews` | GET | 숙소 리뷰 목록 |
| **보고서** | `/api/v1/reports` | POST | 보고서 생성 |
| | `/api/v1/reports` | GET | 보고서 목록 |
| | `/api/v1/reports/{id}` | GET | 보고서 상세 |

---

## 부록 B: 참고 문서

- **PRD.md**: 제품 요구사항 명세
- **Project-Brief.md**: 프로젝트 목표 및 제약
- **CLAUDE.md**: 개발 가이드라인

---

**문서 히스토리**

| 버전 | 날짜 | 변경 사항 | 작성자 |
|------|------|----------|--------|
| 1.0 (Draft) | 2025-10-26 | 초안 작성 (FastAPI + Next.js 14 분리 아키텍처) | Mary (Business Analyst) |

**검토 필요**: Tech Lead, Backend Developer, Frontend Developer
