# Story-005: 프로필 관리

**Epic**: Epic 1 - 사용자 인증 및 회원 관리
**User Story ID**: US-1.5
**Story Points**: 3
**Priority**: P1 (High)
**Dependencies**: US-1.1 (회원가입), US-1.2 (로그인)

---

## [What] 요구사항

### User Story

```
As a 로그인한 사용자
I want to 내 프로필 정보를 조회하고 수정하다
So that 최신 정보를 유지하고 계정을 관리할 수 있다
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: 프로필 정보 조회

```gherkin
Given: 로그인한 사용자가 프로필 페이지(/profile)에 접속했을 때
When: 페이지가 로드되면
Then:
  * 현재 사용자의 이메일이 표시된다 (읽기 전용)
  * 현재 사용자의 이름이 표시된다
  * 현재 사용자의 전화번호가 표시된다
  * 현재 사용자의 프로필 사진이 표시된다 (없으면 기본 아바타)
  * 가입 일자가 표시된다
```

---

#### Scenario 2: 프로필 정보 수정 성공

```gherkin
Given: 로그인한 사용자가 프로필 페이지에서
When: 이름을 "홍길동"에서 "김철수"로 변경하고 "저장" 버튼을 클릭하면
Then:
  * HTTP 200 OK 응답이 반환되고
  * "프로필이 성공적으로 업데이트되었습니다" 메시지가 표시된다
  * 화면에 변경된 이름 "김철수"가 표시된다
```

**예상 Request:**
```json
{
  "name": "김철수",
  "phone": "010-9876-5432"
}
```

**예상 Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "김철수",
    "phone": "010-9876-5432",
    "role": "GUEST",
    "profile_image": null,
    "created_at": "2025-10-26T12:00:00Z",
    "updated_at": "2025-10-27T10:30:00Z"
  }
}
```

---

#### Scenario 3: 프로필 사진 업로드

```gherkin
Given: 로그인한 사용자가 프로필 페이지에서
When: 프로필 사진을 선택하고 업로드하면
Then:
  * 이미지가 서버에 업로드되고
  * 프로필 사진 URL이 사용자 레코드에 저장된다
  * 업로드된 사진이 화면에 표시된다
```

**예상 Request:**
```
POST /api/v1/user/profile/upload-photo
Content-Type: multipart/form-data

file: [image file]
```

**예상 Response (200 OK):**
```json
{
  "profile_image": "https://storage.example.com/profiles/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

---

#### Scenario 4: 유효하지 않은 전화번호 형식

```gherkin
Given: 로그인한 사용자가 프로필 페이지에서
When: 전화번호를 "01012345678" (하이픈 없음)로 입력하고 저장하면
Then:
  * HTTP 422 Unprocessable Entity 응답이 반환되고
  * "전화번호 형식: 010-1234-5678" 에러 메시지가 표시된다
```

**예상 Response (422 Validation Error):**
```json
{
  "detail": [
    {
      "loc": ["body", "phone"],
      "msg": "전화번호 형식: 010-1234-5678",
      "type": "value_error.regex"
    }
  ]
}
```

---

#### Scenario 5: 비로그인 사용자 접근 차단

```gherkin
Given: 로그인하지 않은 사용자가
When: /profile 페이지에 접근하려고 하면
Then:
  * 로그인 페이지(/login)로 리다이렉트된다
  * "로그인이 필요한 서비스입니다" 메시지가 표시된다
```

---

## [How] 기술 구현

### API Endpoint 설계

#### GET /api/v1/user/profile

**설명**: 현재 로그인한 사용자의 프로필 정보 조회

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "role": "GUEST",
  "profile_image": "https://storage.example.com/profiles/user.jpg",
  "created_at": "2025-10-26T12:00:00Z",
  "updated_at": "2025-10-26T12:00:00Z"
}
```

---

#### PUT /api/v1/user/profile

**설명**: 프로필 정보 수정

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (Pydantic Schema):**
```python
class UserProfileUpdateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    phone: str = Field(..., pattern=r'^\d{3}-\d{4}-\d{4}$')
```

**Request Example:**
```json
{
  "name": "김철수",
  "phone": "010-9876-5432"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "김철수",
    "phone": "010-9876-5432",
    "role": "GUEST",
    "profile_image": null,
    "created_at": "2025-10-26T12:00:00Z",
    "updated_at": "2025-10-27T10:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: 토큰 없음 또는 유효하지 않은 토큰
- `422 Unprocessable Entity`: 검증 실패 (이름, 전화번호 형식 오류)

---

#### POST /api/v1/user/profile/upload-photo

**설명**: 프로필 사진 업로드

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: [image file] (최대 5MB, jpg/png/webp)
```

**Response (200 OK):**
```json
{
  "profile_image": "https://storage.example.com/profiles/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

**Error Responses:**
- `400 Bad Request`: 파일 크기 초과 또는 지원하지 않는 형식
- `401 Unauthorized`: 인증 실패

---

### Database Schema

기존 `users` 테이블 사용 (story-001.md에서 정의):

| 컬럼명 | 타입 | 제약 조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 사용자 고유 ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (수정 불가) |
| `name` | VARCHAR(100) | NOT NULL | 사용자 이름 (수정 가능) |
| `phone` | VARCHAR(20) | NOT NULL | 전화번호 (수정 가능) |
| `profile_image` | TEXT | NULL | 프로필 이미지 URL |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW() | 수정 일시 |

**변경 사항**: 없음 (기존 테이블 그대로 사용)

---

### Coding Standards

#### Backend (FastAPI)

1. **JWT 인증 미들웨어**
   ```python
   from app.utils.deps import get_current_user

   @router.get("/profile")
   async def get_profile(
       current_user: User = Depends(get_current_user),
       db: AsyncSession = Depends(get_db)
   ):
       # current_user는 JWT에서 추출된 사용자 객체
       return UserResponse.from_orm(current_user)
   ```

2. **Pydantic 검증 스키마**
   ```python
   class UserProfileUpdateRequest(BaseModel):
       name: str = Field(..., min_length=2, max_length=50)
       phone: str = Field(..., pattern=r'^\d{3}-\d{4}-\d{4}$')
   ```

3. **파일 업로드 처리**
   - `UploadFile` 사용
   - 파일 크기 제한: 5MB
   - 허용 형식: `.jpg`, `.jpeg`, `.png`, `.webp`
   - 파일명: `{user_id}.{extension}` (UUID 기반)
   - 저장 위치: `public/uploads/profiles/` 또는 클라우드 스토리지 (S3, GCS)

#### Frontend (Next.js)

1. **인증 가드 (Middleware)**
   ```typescript
   // src/middleware.ts 또는 page.tsx에서 체크
   if (!session) {
     redirect('/login');
   }
   ```

2. **Form Validation (Zod)**
   ```typescript
   const profileSchema = z.object({
     name: z.string().min(2, "이름은 2자 이상이어야 합니다").max(50),
     phone: z.string().regex(/^\d{3}-\d{4}-\d{4}$/, "전화번호 형식: 010-1234-5678"),
   });
   ```

3. **파일 업로드 UI**
   - `<input type="file" accept="image/jpeg,image/png,image/webp" />`
   - 이미지 미리보기 (Preview)
   - 드래그 앤 드롭 지원 (선택 사항)

---

## [Tasks] 구현 작업

### Phase 1: Backend (FastAPI) - 2시간

#### Task 1.1: JWT 인증 의존성 추가

**파일**: `backend/app/utils/deps.py` (새로 생성)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError

from app.core.database import get_db
from app.models.user import User
from app.utils.security import decode_access_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    JWT 토큰에서 현재 사용자 추출

    Args:
        credentials: Bearer Token
        db: DB 세션

    Returns:
        User: 현재 로그인한 사용자

    Raises:
        HTTPException: 토큰이 유효하지 않거나 사용자를 찾을 수 없는 경우
    """
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="유효하지 않은 토큰입니다"
            )

        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="토큰에 사용자 정보가 없습니다"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰 검증 실패"
        )

    # DB에서 사용자 조회
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다"
        )

    return user
```

---

#### Task 1.2: Pydantic 스키마 추가

**파일**: `backend/app/schemas/user.py` (기존 파일에 추가)

```python
class UserProfileUpdateRequest(BaseModel):
    """프로필 수정 요청 스키마"""
    name: str = Field(..., min_length=2, max_length=50)
    phone: str = Field(..., pattern=r'^\d{3}-\d{4}-\d{4}$')

    class Config:
        json_schema_extra = {
            "example": {
                "name": "김철수",
                "phone": "010-9876-5432"
            }
        }


class UserProfilePhotoUploadResponse(BaseModel):
    """프로필 사진 업로드 응답 스키마"""
    profile_image: str

    class Config:
        json_schema_extra = {
            "example": {
                "profile_image": "https://storage.example.com/profiles/user.jpg"
            }
        }
```

---

#### Task 1.3: Profile API 라우터 작성

**파일**: `backend/app/routers/user.py` (새로 생성)

```python
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from pathlib import Path
import uuid
import os

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserResponse,
    UserProfileUpdateRequest,
    UserProfilePhotoUploadResponse
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/user", tags=["User Profile"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    현재 사용자 프로필 조회
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        phone=current_user.phone,
        role=current_user.role.value,
        profile_image=current_user.profile_image,
        created_at=current_user.created_at
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    프로필 정보 수정
    """
    # 프로필 업데이트
    current_user.name = profile_data.name
    current_user.phone = profile_data.phone

    await db.commit()
    await db.refresh(current_user)

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        phone=current_user.phone,
        role=current_user.role.value,
        profile_image=current_user.profile_image,
        created_at=current_user.created_at
    )


@router.post("/profile/upload-photo", response_model=UserProfilePhotoUploadResponse)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    프로필 사진 업로드
    """
    # 파일 확장자 검증
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="지원하지 않는 파일 형식입니다. (jpg, png, webp만 가능)"
        )

    # 파일 크기 검증 (5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    file_content = await file.read()

    if len(file_content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="파일 크기는 5MB를 초과할 수 없습니다"
        )

    # 파일명 생성 (user_id + extension)
    filename = f"{current_user.id}{file_extension}"

    # 저장 경로
    upload_dir = Path("public/uploads/profiles")
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / filename

    # 파일 저장
    with open(file_path, "wb") as f:
        f.write(file_content)

    # DB 업데이트 (URL 저장)
    profile_image_url = f"/uploads/profiles/{filename}"
    current_user.profile_image = profile_image_url

    await db.commit()

    return UserProfilePhotoUploadResponse(profile_image=profile_image_url)
```

---

#### Task 1.4: FastAPI 메인 앱에 라우터 등록

**파일**: `backend/app/main.py` (기존 파일 수정)

```python
from app.routers import auth, user  # user 추가

# 라우터 등록
app.include_router(auth.router)
app.include_router(user.router, prefix="/api/v1")  # 추가
```

---

#### Task 1.5: Backend 테스트 (cURL)

```bash
# 1. 로그인하여 JWT 토큰 받기
TOKEN=$(curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "remember_me": false
  }' | jq -r '.access_token')

# 2. 프로필 조회
curl -X GET "http://localhost:8000/api/v1/user/profile" \
  -H "Authorization: Bearer $TOKEN"

# 예상 응답: 200 OK + 사용자 프로필 정보

# 3. 프로필 수정
curl -X PUT "http://localhost:8000/api/v1/user/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "김철수",
    "phone": "010-9876-5432"
  }'

# 예상 응답: 200 OK + 업데이트된 프로필

# 4. 프로필 사진 업로드
curl -X POST "http://localhost:8000/api/v1/user/profile/upload-photo" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/photo.jpg"

# 예상 응답: 200 OK + profile_image URL
```

---

### Phase 2: Frontend (Next.js) - 1.5시간

#### Task 2.1: Profile Page 구현

**파일**: `src/app/profile/page.tsx` (새로 생성)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Zod validation schema
const profileSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다').max(50, '이름은 50자 이하여야 합니다'),
  phone: z.string().regex(/^\d{3}-\d{4}-\d{4}$/, '전화번호 형식: 010-1234-5678'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  profile_image: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
          return;
        }
        throw new Error('프로필을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setProfile(data);
      setValue('name', data.name);
      setValue('phone', data.phone);
    } catch (err) {
      setError('프로필을 불러오는데 실패했습니다');
      console.error(err);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.detail?.message || '프로필 업데이트에 실패했습니다');
        return;
      }

      const result = await response.json();
      setProfile(result.user);
      setSuccess('프로필이 성공적으로 업데이트되었습니다');
    } catch (err) {
      setError('서버 연결에 실패했습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/user/profile/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.detail?.message || '사진 업로드에 실패했습니다');
        return;
      }

      const result = await response.json();
      setProfile((prev) => prev ? { ...prev, profile_image: result.profile_image } : null);
      setSuccess('프로필 사진이 업데이트되었습니다');
    } catch (err) {
      setError('서버 연결에 실패했습니다');
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">프로필 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Photo */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.profile_image || undefined} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
                id="photo-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? '업로드 중...' : '사진 변경'}
              </Button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md">
              {success}
            </div>
          )}
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email (Read-only) */}
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                {...register('phone')}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Created At */}
            <div className="grid gap-2">
              <Label>가입 일자</Label>
              <Input
                type="text"
                value={new Date(profile.created_at).toLocaleDateString('ko-KR')}
                disabled
                className="bg-gray-100"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Phase 3: Integration Testing - 30분

#### Task 3.1: E2E 테스트 시나리오

**테스트 파일**: `tests/e2e/profile.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');
  });

  test('should display user profile', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');

    // 프로필 정보 표시 확인
    await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
    await expect(page.locator('input[type="text"]').first()).toHaveValue(/.+/);
  });

  test('should update profile successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');

    // 이름 변경
    await page.fill('input[name="name"]', '김철수');
    await page.fill('input[name="phone"]', '010-9876-5432');

    await page.click('button[type="submit"]');

    // 성공 메시지 확인
    await expect(page.locator('text=프로필이 성공적으로 업데이트되었습니다')).toBeVisible();
  });

  test('should show error for invalid phone format', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');

    // 잘못된 전화번호 형식
    await page.fill('input[name="phone"]', '01012345678');
    await page.click('button[type="submit"]');

    // 에러 메시지 확인
    await expect(page.locator('text=전화번호 형식: 010-1234-5678')).toBeVisible();
  });
});
```

---

## Definition of Done

### Backend
- [ ] `get_current_user` 의존성 함수 구현
- [ ] GET `/api/v1/user/profile` 엔드포인트 구현
- [ ] PUT `/api/v1/user/profile` 엔드포인트 구현
- [ ] POST `/api/v1/user/profile/upload-photo` 엔드포인트 구현
- [ ] JWT 인증 미들웨어 적용
- [ ] Pydantic 검증 작동
- [ ] cURL로 API 테스트 통과

### Frontend
- [ ] `/profile` 페이지 구현
- [ ] 프로필 조회 기능 작동
- [ ] 프로필 수정 기능 작동
- [ ] 프로필 사진 업로드 기능 작동
- [ ] 비로그인 시 `/login`으로 리다이렉트
- [ ] Zod 검증 작동
- [ ] 에러 메시지 UI 표시

### Testing
- [ ] 모든 Acceptance Criteria 통과
- [ ] 프로필 조회 테스트
- [ ] 프로필 수정 테스트
- [ ] 사진 업로드 테스트
- [ ] 유효성 검증 테스트
- [ ] 인증 실패 시 리다이렉트 테스트

### Documentation
- [ ] API 엔드포인트 Swagger 문서화
- [ ] STORY-TRACKER.md 업데이트

---

## Time Estimate

| Phase | Estimated Time |
|-------|----------------|
| Phase 1: Backend | 2시간 |
| Phase 2: Frontend | 1.5시간 |
| Phase 3: Testing | 0.5시간 |
| **Total** | **4시간** |

---

## Dependencies

### Prerequisites
- ✅ US-1.1: 회원가입 완료
- ✅ US-1.2: 로그인 완료
- ✅ Backend 서버 실행 중
- ✅ Frontend 서버 실행 중
- ✅ JWT 인증 구현 완료

### Related Stories
- **Next Story**: US-1.6 (비밀번호 재설정) - story-006.md
- **Depends On**: US-1.1, US-1.2

---

## Security Considerations

1. **JWT 토큰 검증**
   - 모든 프로필 API 요청에 유효한 JWT 토큰 필요
   - 만료된 토큰 거부
   - 토큰 없으면 401 Unauthorized

2. **파일 업로드 보안**
   - 파일 크기 제한: 5MB
   - 허용 확장자: `.jpg`, `.jpeg`, `.png`, `.webp`
   - 파일명 무작위화 (user_id 기반)
   - 악성 파일 업로드 방지

3. **개인정보 보호**
   - 이메일은 수정 불가 (변경 시 이메일 인증 필요)
   - 비밀번호 변경은 별도 Story (US-1.6)

---

## Notes

- 프로필 사진은 로컬 파일 시스템에 저장 (MVP)
- 프로덕션에서는 S3, GCS 등 클라우드 스토리지 사용 권장
- 이메일 변경 기능은 US-1.6 (비밀번호 재설정)과 함께 구현 고려
- 소셜 로그인 사용자의 경우 프로필 사진은 OAuth 제공자에서 가져옴
