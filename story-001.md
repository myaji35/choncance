# Story #001: 사용자 회원가입 (이메일/비밀번호)

**Story ID**: STORY-001
**Feature**: 사용자 인증 및 회원 관리
**Priority**: P0 (Critical)
**Story Points**: 5
**Sprint**: Week 1-2
**Status**: Not Started

---

## [What] 요구사항 정의

### User Story

```
As a 여행객 (게스트)
I want to 이메일과 비밀번호로 회원가입하다
So that 촌캉스 숙소를 예약할 수 있다
```

### Acceptance Criteria (Gherkin Format)

#### Scenario 1: 성공적인 회원가입

```gherkin
Given 회원가입 페이지에 접속했을 때
When 다음 정보를 모두 입력하고 "가입하기" 버튼을 클릭하면
  | 필드 | 값 | 검증 규칙 |
  | 이메일 | user@example.com | 이메일 형식 |
  | 비밀번호 | SecurePass123! | 8자 이상, 영문+숫자 조합 |
  | 비밀번호 확인 | SecurePass123! | 비밀번호와 일치 |
  | 이름 | 홍길동 | 2자 이상 |
  | 전화번호 | 010-1234-5678 | 형식: XXX-XXXX-XXXX |
  | 이용약관 동의 | ✓ | 필수 체크 |
  | 개인정보 처리방침 동의 | ✓ | 필수 체크 |
Then
  * 계정이 생성되고
  * JWT 토큰이 발급되어 자동 로그인 상태가 되며
  * "가입이 완료되었습니다!" 메시지가 표시되고
  * 메인 페이지(/)로 리다이렉트된다
```

#### Scenario 2: 이메일 중복 오류

```gherkin
Given 이미 "user@example.com"으로 가입된 사용자가 존재할 때
When 동일한 이메일로 회원가입을 시도하면
Then
  * HTTP 409 Conflict 응답이 반환되고
  * "이미 가입된 이메일입니다" 에러 메시지가 표시된다
```

#### Scenario 3: 비밀번호 강도 부족 오류

```gherkin
Given 회원가입 페이지에 접속했을 때
When 비밀번호로 "1234567" (숫자만 7자)를 입력하면
Then
  * HTTP 422 Unprocessable Entity 응답이 반환되고
  * "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다" 에러 메시지가 표시된다
```

#### Scenario 4: 약관 미동의 오류

```gherkin
Given 회원가입 페이지에 접속했을 때
When 이용약관 또는 개인정보 처리방침에 동의하지 않고 가입하기를 클릭하면
Then
  * HTTP 422 Unprocessable Entity 응답이 반환되고
  * "이용약관과 개인정보 처리방침에 동의해주세요" 에러 메시지가 표시된다
```

---

## [How] 아키텍처 및 기술 제약사항

### 기술 스택

**백엔드**:
- 프레임워크: Python FastAPI 0.100+
- ORM: SQLAlchemy 2.0 (async)
- 데이터베이스: PostgreSQL 15+
- 비밀번호 해싱: bcrypt (passlib 라이브러리)
- JWT 토큰: python-jose[cryptography]

**프론트엔드**:
- 프레임워크: Next.js 14 (App Router)
- 언어: TypeScript 5.x (strict mode)
- 폼 처리: react-hook-form 7.x
- 검증: Zod 4.x
- HTTP 클라이언트: Fetch API

---

### API 엔드포인트 설계

#### Endpoint

```
POST /api/v1/auth/register
Content-Type: application/json
```

#### Request Body (JSON)

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

#### Response - 성공 (201 Created)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "role": "GUEST",
    "created_at": "2025-10-26T12:00:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJleHAiOjE3MzAwNDQ4MDB9.abc123...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

#### Response - 에러 (409 Conflict)

```json
{
  "detail": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "이미 가입된 이메일입니다"
  }
}
```

#### Response - 에러 (422 Validation Error)

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

### 데이터베이스 스키마

#### User 테이블

**테이블명**: `users`

| 컬럼명 | 타입 | 제약 조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 사용자 고유 ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| `password` | VARCHAR(255) | NOT NULL | bcrypt 해시된 비밀번호 |
| `name` | VARCHAR(100) | NOT NULL | 사용자 이름 |
| `phone` | VARCHAR(20) | NOT NULL | 전화번호 (010-1234-5678) |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'GUEST' | 역할 (GUEST, HOST, ADMIN) |
| `profile_image` | TEXT | NULL | 프로필 이미지 URL |
| `business_info` | TEXT | NULL | 호스트 사업자 정보 (회원가입 시 NULL) |
| `is_host_approved` | BOOLEAN | DEFAULT FALSE | 호스트 승인 여부 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정 일시 |

**인덱스**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 코딩 표준 및 보안 요구사항

#### 비밀번호 보안

1. **해싱 알고리즘**: bcrypt (passlib 사용)
   ```python
   from passlib.context import CryptContext

   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
   hashed_password = pwd_context.hash(plain_password)
   ```

2. **비밀번호 검증 규칙**:
   - 최소 8자 이상
   - 영문자(대/소문자) 포함 필수
   - 숫자 포함 필수
   - 정규식: `^(?=.*[A-Za-z])(?=.*\d).{8,}$`

#### JWT 토큰 설정

```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY")  # 환경 변수에서 로드
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24시간

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

#### Pydantic 검증 스키마

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

#### 에러 응답 형식

```python
from fastapi import HTTPException, status

# 이메일 중복
raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail={
        "code": "EMAIL_ALREADY_EXISTS",
        "message": "이미 가입된 이메일입니다"
    }
)

# 검증 실패는 Pydantic이 자동으로 422 반환
```

---

## [Tasks] 개발 작업 체크리스트

### Phase 1: 백엔드 구현 (FastAPI)

#### Task 1.1: 프로젝트 구조 설정

**파일 경로**: `backend/`

- [ ] **1.1.1** 프로젝트 루트 디렉토리 생성
  ```bash
  mkdir -p backend
  cd backend
  ```

- [ ] **1.1.2** 가상환경 생성 및 활성화
  ```bash
  python -m venv venv
  source venv/bin/activate  # Windows: venv\Scripts\activate
  ```

- [ ] **1.1.3** `requirements.txt` 작성
  ```txt
  fastapi==0.100.0
  sqlalchemy==2.0.0
  alembic==1.11.0
  psycopg2-binary==2.9.0
  pydantic==2.0.0
  python-jose[cryptography]==3.3.0
  passlib[bcrypt]==1.7.4
  python-multipart==0.0.6
  uvicorn==0.23.0
  ```

- [ ] **1.1.4** 의존성 설치
  ```bash
  pip install -r requirements.txt
  ```

- [ ] **1.1.5** 프로젝트 디렉토리 구조 생성
  ```bash
  mkdir -p app/{models,schemas,routers,utils}
  touch app/__init__.py
  touch app/models/__init__.py
  touch app/schemas/__init__.py
  touch app/routers/__init__.py
  touch app/utils/__init__.py
  ```

  **최종 구조**:
  ```
  backend/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── database.py
  │   ├── models/
  │   │   ├── __init__.py
  │   │   └── user.py
  │   ├── schemas/
  │   │   ├── __init__.py
  │   │   └── user.py
  │   ├── routers/
  │   │   ├── __init__.py
  │   │   └── auth.py
  │   └── utils/
  │       ├── __init__.py
  │       ├── security.py
  │       └── deps.py
  ├── alembic/
  ├── requirements.txt
  └── .env
  ```

---

#### Task 1.2: 데이터베이스 설정

- [ ] **1.2.1** `.env` 파일 생성 (환경 변수)
  ```env
  # Database
  DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/choncance

  # JWT
  SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
  ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=1440
  ```

- [ ] **1.2.2** `app/database.py` 작성 (데이터베이스 연결)
  ```python
  from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
  from sqlalchemy.orm import sessionmaker, declarative_base
  import os
  from dotenv import load_dotenv

  load_dotenv()

  DATABASE_URL = os.getenv("DATABASE_URL")

  engine = create_async_engine(DATABASE_URL, echo=True)
  SessionLocal = sessionmaker(
      engine, class_=AsyncSession, expire_on_commit=False
  )
  Base = declarative_base()

  async def get_db():
      async with SessionLocal() as session:
          yield session
  ```

- [ ] **1.2.3** Alembic 초기화
  ```bash
  alembic init alembic
  ```

- [ ] **1.2.4** `alembic.ini` 수정 (데이터베이스 URL 설정)
  ```ini
  # 기존 sqlalchemy.url 주석 처리하고 아래 추가
  # sqlalchemy.url = driver://user:pass@localhost/dbname
  ```

- [ ] **1.2.5** `alembic/env.py` 수정 (Base 메타데이터 import)
  ```python
  from app.database import Base
  from app.models import user  # User 모델 import

  target_metadata = Base.metadata

  # sqlalchemy.url을 .env에서 읽도록 수정
  from dotenv import load_dotenv
  import os
  load_dotenv()

  config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL").replace("+asyncpg", ""))
  ```

---

#### Task 1.3: User 모델 정의

- [ ] **1.3.1** `app/models/user.py` 작성
  ```python
  from sqlalchemy import Column, String, Boolean, DateTime, Enum
  from sqlalchemy.dialects.postgresql import UUID
  from sqlalchemy.sql import func
  import uuid
  import enum
  from app.database import Base

  class UserRole(enum.Enum):
      GUEST = "GUEST"
      HOST = "HOST"
      ADMIN = "ADMIN"

  class User(Base):
      __tablename__ = "users"

      id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
      email = Column(String(255), unique=True, nullable=False, index=True)
      password = Column(String(255), nullable=False)
      name = Column(String(100), nullable=False)
      phone = Column(String(20), nullable=False)
      role = Column(
          Enum(UserRole),
          nullable=False,
          default=UserRole.GUEST,
          index=True
      )
      profile_image = Column(String, nullable=True)
      business_info = Column(String, nullable=True)
      is_host_approved = Column(Boolean, default=False)
      created_at = Column(
          DateTime(timezone=True),
          server_default=func.now()
      )
      updated_at = Column(
          DateTime(timezone=True),
          server_default=func.now(),
          onupdate=func.now()
      )
  ```

- [ ] **1.3.2** `app/models/__init__.py` 업데이트
  ```python
  from app.models.user import User, UserRole

  __all__ = ["User", "UserRole"]
  ```

---

#### Task 1.4: Pydantic 스키마 정의

- [ ] **1.4.1** `app/schemas/user.py` 작성
  ```python
  from pydantic import BaseModel, EmailStr, Field, validator
  from datetime import datetime
  from typing import Optional
  import re
  import uuid

  # 회원가입 요청 스키마
  class UserRegisterRequest(BaseModel):
      email: EmailStr
      password: str = Field(..., min_length=8, max_length=100)
      name: str = Field(..., min_length=2, max_length=50)
      phone: str = Field(..., pattern=r'^\d{3}-\d{4}-\d{4}$')
      agreed_to_terms: bool
      agreed_to_privacy: bool

      @validator('password')
      def validate_password(cls, v):
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

  # 사용자 응답 스키마 (비밀번호 제외)
  class UserResponse(BaseModel):
      id: uuid.UUID
      email: str
      name: str
      phone: str
      role: str
      profile_image: Optional[str] = None
      created_at: datetime

      class Config:
          from_attributes = True  # SQLAlchemy 모델 → Pydantic 변환

  # 회원가입 응답 스키마 (토큰 포함)
  class UserRegisterResponse(BaseModel):
      user: UserResponse
      access_token: str
      token_type: str = "bearer"
      expires_in: int = 86400
  ```

- [ ] **1.4.2** `app/schemas/__init__.py` 업데이트
  ```python
  from app.schemas.user import (
      UserRegisterRequest,
      UserResponse,
      UserRegisterResponse
  )

  __all__ = [
      "UserRegisterRequest",
      "UserResponse",
      "UserRegisterResponse"
  ]
  ```

---

#### Task 1.5: 보안 유틸리티 함수 작성

- [ ] **1.5.1** `app/utils/security.py` 작성
  ```python
  from passlib.context import CryptContext
  from jose import JWTError, jwt
  from datetime import datetime, timedelta
  import os

  # 비밀번호 해싱
  pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

  def hash_password(password: str) -> str:
      """비밀번호를 bcrypt로 해싱"""
      return pwd_context.hash(password)

  def verify_password(plain_password: str, hashed_password: str) -> bool:
      """비밀번호 검증"""
      return pwd_context.verify(plain_password, hashed_password)

  # JWT 토큰 생성
  SECRET_KEY = os.getenv("SECRET_KEY")
  ALGORITHM = os.getenv("ALGORITHM", "HS256")
  ACCESS_TOKEN_EXPIRE_MINUTES = int(
      os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440)
  )

  def create_access_token(data: dict) -> str:
      """JWT 액세스 토큰 생성"""
      to_encode = data.copy()
      expire = datetime.utcnow() + timedelta(
          minutes=ACCESS_TOKEN_EXPIRE_MINUTES
      )
      to_encode.update({"exp": expire})
      encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
      return encoded_jwt
  ```

- [ ] **1.5.2** `app/utils/__init__.py` 업데이트
  ```python
  from app.utils.security import (
      hash_password,
      verify_password,
      create_access_token
  )

  __all__ = ["hash_password", "verify_password", "create_access_token"]
  ```

---

#### Task 1.6: 회원가입 API 라우터 작성

- [ ] **1.6.1** `app/routers/auth.py` 작성
  ```python
  from fastapi import APIRouter, Depends, HTTPException, status
  from sqlalchemy.ext.asyncio import AsyncSession
  from sqlalchemy import select
  from app.database import get_db
  from app.models.user import User, UserRole
  from app.schemas.user import (
      UserRegisterRequest,
      UserRegisterResponse,
      UserResponse
  )
  from app.utils.security import hash_password, create_access_token

  router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

  @router.post(
      "/register",
      response_model=UserRegisterResponse,
      status_code=status.HTTP_201_CREATED
  )
  async def register_user(
      user_data: UserRegisterRequest,
      db: AsyncSession = Depends(get_db)
  ):
      """
      사용자 회원가입 API

      - 이메일 중복 확인
      - 비밀번호 해싱 (bcrypt)
      - 사용자 생성
      - JWT 토큰 발급
      """

      # 1. 이메일 중복 확인
      result = await db.execute(
          select(User).where(User.email == user_data.email)
      )
      existing_user = result.scalar_one_or_none()

      if existing_user:
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
          role=UserRole.GUEST
      )

      db.add(new_user)
      await db.commit()
      await db.refresh(new_user)

      # 4. JWT 토큰 생성
      access_token = create_access_token(
          data={
              "sub": str(new_user.id),
              "email": new_user.email
          }
      )

      # 5. 응답 반환
      return UserRegisterResponse(
          user=UserResponse.from_orm(new_user),
          access_token=access_token,
          token_type="bearer",
          expires_in=86400
      )
  ```

- [ ] **1.6.2** `app/routers/__init__.py` 업데이트
  ```python
  from app.routers import auth

  __all__ = ["auth"]
  ```

---

#### Task 1.7: FastAPI 메인 앱 설정

- [ ] **1.7.1** `app/main.py` 작성
  ```python
  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware
  from app.routers import auth

  app = FastAPI(
      title="ChonCance API",
      description="촌캉스 플랫폼 API",
      version="1.0.0"
  )

  # CORS 설정
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000"],  # Next.js 개발 서버
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )

  # 라우터 등록
  app.include_router(auth.router)

  @app.get("/")
  async def root():
      return {"message": "ChonCance API v1.0.0"}
  ```

---

#### Task 1.8: 데이터베이스 마이그레이션

- [ ] **1.8.1** PostgreSQL 데이터베이스 생성
  ```bash
  # PostgreSQL에 접속 (로컬)
  psql -U postgres

  # 데이터베이스 생성
  CREATE DATABASE choncance;

  # 종료
  \q
  ```

- [ ] **1.8.2** Alembic 마이그레이션 파일 생성
  ```bash
  alembic revision --autogenerate -m "Create users table"
  ```

- [ ] **1.8.3** 마이그레이션 실행
  ```bash
  alembic upgrade head
  ```

- [ ] **1.8.4** 마이그레이션 확인
  ```bash
  # PostgreSQL에서 테이블 확인
  psql -U postgres -d choncance -c "\dt"

  # users 테이블 스키마 확인
  psql -U postgres -d choncance -c "\d users"
  ```

---

#### Task 1.9: 백엔드 서버 실행 및 테스트

- [ ] **1.9.1** 개발 서버 실행
  ```bash
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```

- [ ] **1.9.2** Swagger 문서 확인
  - 브라우저에서 `http://localhost:8000/docs` 접속
  - `/api/v1/auth/register` 엔드포인트 확인

- [ ] **1.9.3** cURL로 API 테스트
  ```bash
  curl -X POST "http://localhost:8000/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "Test1234!",
      "name": "테스트",
      "phone": "010-1234-5678",
      "agreed_to_terms": true,
      "agreed_to_privacy": true
    }'
  ```

  **예상 응답** (201 Created):
  ```json
  {
    "user": {
      "id": "550e8400-...",
      "email": "test@example.com",
      "name": "테스트",
      "phone": "010-1234-5678",
      "role": "GUEST",
      "created_at": "2025-10-26T12:00:00Z"
    },
    "access_token": "eyJhbGci...",
    "token_type": "bearer",
    "expires_in": 86400
  }
  ```

- [ ] **1.9.4** 에러 케이스 테스트

  **이메일 중복 테스트**:
  ```bash
  # 동일한 이메일로 재시도
  curl -X POST "http://localhost:8000/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "Test1234!",
      "name": "테스트2",
      "phone": "010-1234-5679",
      "agreed_to_terms": true,
      "agreed_to_privacy": true
    }'
  ```
  **예상 응답** (409 Conflict):
  ```json
  {
    "detail": {
      "code": "EMAIL_ALREADY_EXISTS",
      "message": "이미 가입된 이메일입니다"
    }
  }
  ```

  **비밀번호 검증 실패 테스트**:
  ```bash
  curl -X POST "http://localhost:8000/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test2@example.com",
      "password": "12345678",
      "name": "테스트",
      "phone": "010-1234-5678",
      "agreed_to_terms": true,
      "agreed_to_privacy": true
    }'
  ```
  **예상 응답** (422 Validation Error):
  ```json
  {
    "detail": [
      {
        "loc": ["body", "password"],
        "msg": "비밀번호는 영문을 포함해야 합니다",
        "type": "value_error"
      }
    ]
  }
  ```

---

### Phase 2: 프론트엔드 구현 (Next.js 14)

#### Task 2.1: 회원가입 페이지 UI 구현

**파일 경로**: `src/app/signup/page.tsx`

- [ ] **2.1.1** 회원가입 페이지 생성
  ```tsx
  'use client';

  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { z } from 'zod';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Checkbox } from '@/components/ui/checkbox';

  // Zod 검증 스키마
  const signupSchema = z.object({
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다')
      .regex(/[A-Za-z]/, '비밀번호는 영문을 포함해야 합니다')
      .regex(/\d/, '비밀번호는 숫자를 포함해야 합니다'),
    passwordConfirm: z.string(),
    name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
    phone: z
      .string()
      .regex(/^\d{3}-\d{4}-\d{4}$/, '전화번호 형식: 010-1234-5678'),
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: '이용약관에 동의해주세요',
    }),
    agreedToPrivacy: z.boolean().refine((val) => val === true, {
      message: '개인정보 처리방침에 동의해주세요',
    }),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  });

  type SignupFormData = z.infer<typeof signupSchema>;

  export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<SignupFormData>({
      resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch('http://localhost:8000/api/v1/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            name: data.name,
            phone: data.phone,
            agreed_to_terms: data.agreedToTerms,
            agreed_to_privacy: data.agreedToPrivacy,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();

          if (response.status === 409) {
            setErrorMessage(errorData.detail.message);
          } else if (response.status === 422) {
            const validationErrors = errorData.detail
              .map((err: any) => err.msg)
              .join(', ');
            setErrorMessage(validationErrors);
          } else {
            setErrorMessage('회원가입에 실패했습니다');
          }
          return;
        }

        const result = await response.json();

        // JWT 토큰 저장 (localStorage 또는 Cookie)
        localStorage.setItem('access_token', result.access_token);

        // 성공 메시지
        alert('가입이 완료되었습니다!');

        // 메인 페이지로 리다이렉트
        router.push('/');
      } catch (error) {
        console.error('회원가입 오류:', error);
        setErrorMessage('서버 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <h1 className="text-2xl font-bold mb-6">회원가입</h1>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 이메일 */}
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="8자 이상, 영문+숫자"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
            <Input
              id="passwordConfirm"
              type="password"
              {...register('passwordConfirm')}
            />
            {errors.passwordConfirm && (
              <p className="text-red-500 text-sm mt-1">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          {/* 이름 */}
          <div>
            <Label htmlFor="name">이름</Label>
            <Input id="name" {...register('name')} placeholder="홍길동" />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* 전화번호 */}
          <div>
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="010-1234-5678"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreedToTerms"
                {...register('agreedToTerms')}
                className="mr-2"
              />
              <Label htmlFor="agreedToTerms">이용약관에 동의합니다</Label>
            </div>
            {errors.agreedToTerms && (
              <p className="text-red-500 text-sm">{errors.agreedToTerms.message}</p>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreedToPrivacy"
                {...register('agreedToPrivacy')}
                className="mr-2"
              />
              <Label htmlFor="agreedToPrivacy">
                개인정보 처리방침에 동의합니다
              </Label>
            </div>
            {errors.agreedToPrivacy && (
              <p className="text-red-500 text-sm">
                {errors.agreedToPrivacy.message}
              </p>
            )}
          </div>

          {/* 가입 버튼 */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '가입 중...' : '가입하기'}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            로그인
          </a>
        </p>
      </div>
    );
  }
  ```

---

#### Task 2.2: 프론트엔드 테스트

- [ ] **2.2.1** Next.js 개발 서버 실행
  ```bash
  npm run dev
  ```

- [ ] **2.2.2** 브라우저에서 회원가입 페이지 접속
  - URL: `http://localhost:3000/signup`

- [ ] **2.2.3** 성공 케이스 테스트
  - 모든 필드를 올바르게 입력
  - "가입하기" 버튼 클릭
  - "가입이 완료되었습니다!" 메시지 확인
  - 메인 페이지로 리다이렉트 확인
  - LocalStorage에 `access_token` 저장 확인 (개발자 도구 → Application → Local Storage)

- [ ] **2.2.4** 에러 케이스 테스트
  - **이메일 중복**: 동일한 이메일로 재가입 시도 → "이미 가입된 이메일입니다" 표시
  - **비밀번호 강도 부족**: "12345678" 입력 → "비밀번호는 영문을 포함해야 합니다" 표시
  - **약관 미동의**: 체크박스 체크하지 않고 가입 시도 → 에러 메시지 표시
  - **전화번호 형식 오류**: "01012345678" 입력 → "전화번호 형식: 010-1234-5678" 표시

---

### Phase 3: 통합 테스트

- [ ] **3.1** E2E 테스트 시나리오 수행
  1. 백엔드 서버 실행 (`http://localhost:8000`)
  2. 프론트엔드 서버 실행 (`http://localhost:3000`)
  3. 회원가입 페이지 접속 (`/signup`)
  4. 새로운 이메일로 회원가입
  5. 가입 완료 확인
  6. PostgreSQL에서 사용자 생성 확인
     ```bash
     psql -U postgres -d choncance -c "SELECT id, email, name, role, created_at FROM users;"
     ```

- [ ] **3.2** Postman/Insomnia 테스트 컬렉션 생성 (선택 사항)
  - API 엔드포인트 테스트 자동화

---

## 완료 기준 (Definition of Done)

이 스토리는 다음 조건을 **모두** 만족해야 완료로 간주합니다:

- [x] **백엔드**
  - [ ] User 모델이 PostgreSQL에 생성되었다
  - [ ] POST `/api/v1/auth/register` API가 정상 작동한다
  - [ ] Swagger 문서에서 API 테스트 가능하다
  - [ ] 비밀번호가 bcrypt로 해싱되어 저장된다
  - [ ] JWT 토큰이 정상적으로 발급된다
  - [ ] 이메일 중복 시 409 Conflict 반환
  - [ ] 검증 실패 시 422 Validation Error 반환

- [x] **프론트엔드**
  - [ ] `/signup` 페이지가 존재한다
  - [ ] 회원가입 폼이 정상 작동한다
  - [ ] Zod 검증이 클라이언트 측에서 작동한다
  - [ ] 성공 시 JWT 토큰이 저장된다
  - [ ] 에러 메시지가 사용자에게 표시된다
  - [ ] 가입 완료 후 메인 페이지로 리다이렉트된다

- [x] **테스트**
  - [ ] 모든 Acceptance Criteria가 통과한다
  - [ ] cURL 또는 Postman으로 API 테스트 완료
  - [ ] 브라우저에서 회원가입 플로우 테스트 완료

- [x] **문서**
  - [ ] API 엔드포인트가 Swagger에 문서화되었다
  - [ ] 코드에 적절한 주석이 추가되었다

---

## 참고 자료

### 관련 문서
- **PRD.md**: 전체 제품 요구사항
- **Architecture-Spec.md**: 시스템 아키텍처 및 기술 스택
- **CLAUDE.md**: 개발 가이드라인

### 외부 문서
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 문서](https://docs.sqlalchemy.org/en/20/)
- [Pydantic 문서](https://docs.pydantic.dev/)
- [Next.js 14 문서](https://nextjs.org/docs)
- [react-hook-form 문서](https://react-hook-form.com/)

---

## 추정 시간

| Phase | 예상 시간 |
|-------|----------|
| Phase 1: 백엔드 구현 | 4-6 시간 |
| Phase 2: 프론트엔드 구현 | 2-3 시간 |
| Phase 3: 통합 테스트 | 1-2 시간 |
| **총 예상 시간** | **7-11 시간** |

---

**작성일**: 2025-10-26
**작성자**: Business Analyst (Mary)
**검토자**: TBD
