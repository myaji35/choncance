# Story-002: 이메일/비밀번호 로그인

**Epic**: Epic 1 - 사용자 인증 및 회원 관리
**User Story ID**: US-1.2
**Story Points**: 3
**Priority**: P0 (Critical)
**Dependencies**: US-1.1 (회원가입)

---

## [What] 요구사항

### User Story

```
As a 여행객 (게스트)
I want to 이메일과 비밀번호로 로그인하다
So that 내 계정에 접근하여 예약과 프로필을 관리할 수 있다
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: 성공적인 로그인

```gherkin
Given: 이미 회원가입한 사용자가 로그인 페이지에 접속했을 때
When: 올바른 이메일과 비밀번호를 입력하고 "로그인" 버튼을 클릭하면
Then:
  * JWT 토큰이 발급되고
  * 토큰이 localStorage에 저장되며
  * 사용자는 대시보드(/dashboard)로 리다이렉트된다
  * 헤더에 사용자 이름이 표시된다
```

**예상 Request:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**예상 Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "role": "GUEST",
    "profile_image": null,
    "created_at": "2024-01-15T12:00:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

---

#### Scenario 2: 잘못된 비밀번호

```gherkin
Given: 사용자가 로그인 페이지에서
When: 올바른 이메일과 잘못된 비밀번호를 입력하고 "로그인" 버튼을 클릭하면
Then:
  * 401 Unauthorized 응답이 반환되고
  * "이메일 또는 비밀번호가 올바르지 않습니다" 에러 메시지가 표시된다
  * 로그인 폼이 초기화되지 않는다 (이메일 값 유지)
```

**예상 Response (401 Unauthorized):**
```json
{
  "detail": {
    "code": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다"
  }
}
```

---

#### Scenario 3: 존재하지 않는 계정

```gherkin
Given: 사용자가 로그인 페이지에서
When: 등록되지 않은 이메일을 입력하고 "로그인" 버튼을 클릭하면
Then:
  * 401 Unauthorized 응답이 반환되고
  * "이메일 또는 비밀번호가 올바르지 않습니다" 에러 메시지가 표시된다
  * (보안상 계정 존재 여부를 노출하지 않음)
```

---

#### Scenario 4: "로그인 상태 유지" 옵션

```gherkin
Given: 사용자가 로그인 페이지에서
When: "로그인 상태 유지" 체크박스를 선택하고 로그인하면
Then:
  * JWT 토큰의 만료 시간이 30일로 연장된다
  * 브라우저를 닫았다가 다시 열어도 로그인 상태가 유지된다
```

**예상 Response (remember_me=true):**
```json
{
  "user": { ... },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 2592000  // 30일 (30 * 24 * 60 * 60)
}
```

---

#### Scenario 5: 빈 필드 검증

```gherkin
Given: 사용자가 로그인 페이지에서
When: 이메일 또는 비밀번호를 입력하지 않고 "로그인" 버튼을 클릭하면
Then:
  * 클라이언트 측 검증으로 즉시 에러 메시지가 표시된다
  * "이메일을 입력해주세요" 또는 "비밀번호를 입력해주세요"
  * 서버로 요청이 전송되지 않는다
```

---

## [How] 기술 구현

### API Endpoint 설계

#### POST /api/v1/auth/login

**Request Schema (Pydantic):**
```python
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    remember_me: bool = False  # 로그인 상태 유지 옵션
```

**Response Schema (Pydantic):**
```python
class UserLoginResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # 초 단위 (기본 86400 = 24시간)
```

**Error Responses:**
- `401 Unauthorized`: 이메일/비밀번호 불일치
- `422 Unprocessable Entity`: 요청 검증 실패

---

### Database Schema

기존 User 테이블 사용 (story-001.md에서 정의):
- `email` (String, unique, indexed)
- `password` (String, bcrypt hashed)
- `name`, `phone`, `role` 등

**변경 사항**: 없음 (기존 테이블 그대로 사용)

---

### Coding Standards

#### Backend (FastAPI)

1. **비밀번호 검증**
   - `passlib.context.CryptContext.verify()` 사용
   - 이미 `backend/app/utils/security.py`에 `verify_password()` 함수 구현됨
   - 타이밍 공격 방지 (bcrypt는 기본적으로 처리)

2. **JWT 토큰 생성**
   - `python-jose` 라이브러리 사용
   - 이미 `create_access_token()` 함수 구현됨
   - `remember_me=True`일 경우 `expires_delta=30일`로 설정

3. **보안 고려사항**
   - 로그인 실패 시 이메일 존재 여부를 노출하지 않음 (동일한 에러 메시지)
   - Rate limiting 권장 (향후 추가 - 현재 MVP에서는 생략)
   - HTTPS 필수

4. **에러 처리**
   - 일관된 에러 응답 형식 (`detail.code`, `detail.message`)

#### Frontend (Next.js)

1. **Form Validation**
   - `react-hook-form` + `Zod` 사용 (story-001.md와 동일)
   - 클라이언트 측 검증으로 불필요한 API 호출 방지

2. **JWT 토큰 저장**
   - `localStorage.setItem('access_token', token)`
   - XSS 방지: Content Security Policy 설정
   - 향후 개선: httpOnly 쿠키 고려 (현재 MVP에서는 localStorage)

3. **로그인 상태 유지**
   - Checkbox 컴포넌트로 "로그인 상태 유지" 옵션 제공
   - 체크 시 `remember_me: true` 전송

4. **Redirect 처리**
   - 로그인 성공 시 `/dashboard`로 이동
   - 이미 로그인된 상태에서 `/login` 접근 시 `/dashboard`로 리다이렉트

---

## [Tasks] 구현 작업

### Phase 1: Backend (FastAPI) - 2시간

#### Task 1.1: Pydantic 스키마 추가
**파일**: `backend/app/schemas/user.py`

```python
# 기존 파일에 추가

class UserLoginRequest(BaseModel):
    """로그인 요청 스키마"""
    email: EmailStr
    password: str = Field(..., min_length=1)
    remember_me: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "email": "test@example.com",
                "password": "password123",
                "remember_me": False
            }
        }


class UserLoginResponse(BaseModel):
    """로그인 성공 응답 스키마"""
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400
```

**업데이트**: `backend/app/schemas/__init__.py`에 export 추가
```python
from app.schemas.user import (
    UserRegisterRequest,
    UserRegisterResponse,
    UserResponse,
    UserLoginRequest,      # 추가
    UserLoginResponse      # 추가
)
```

---

#### Task 1.2: Login Endpoint 구현
**파일**: `backend/app/routers/auth.py`

```python
# 기존 파일에 추가

from datetime import timedelta
from app.schemas.user import UserLoginRequest, UserLoginResponse

@router.post("/login", response_model=UserLoginResponse, status_code=status.HTTP_200_OK)
async def login_user(
    user_data: UserLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    로그인 엔드포인트

    사용자가 이메일과 비밀번호로 로그인합니다.

    Args:
        user_data: 로그인 요청 데이터
        db: 데이터베이스 세션

    Returns:
        UserLoginResponse: 사용자 정보 및 JWT 토큰

    Raises:
        HTTPException: 이메일/비밀번호가 일치하지 않는 경우 401 Unauthorized
    """
    # 1. 이메일로 사용자 조회
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    # 2. 사용자가 없거나 비밀번호가 일치하지 않으면 동일한 에러 반환 (보안)
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "이메일 또는 비밀번호가 올바르지 않습니다"
            }
        )

    # 3. JWT 토큰 생성 (로그인 상태 유지 옵션 처리)
    if user_data.remember_me:
        # 30일 만료
        expires_delta = timedelta(days=30)
        expires_in = 30 * 24 * 60 * 60  # 2592000초
    else:
        # 24시간 만료 (기본값)
        expires_delta = None
        expires_in = 86400

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=expires_delta
    )

    # 4. 응답 반환
    return UserLoginResponse(
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            phone=user.phone,
            role=user.role.value,
            profile_image=user.profile_image,
            created_at=user.created_at
        ),
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_in
    )
```

**필요한 import 추가**:
```python
from datetime import timedelta
from app.utils.security import verify_password  # 이미 있을 것
```

---

#### Task 1.3: Backend 테스트 (cURL)

```bash
# 1. 로그인 성공 테스트
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "remember_me": false
  }'

# 예상 응답: 200 OK + JWT 토큰

# 2. 잘못된 비밀번호 테스트
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword",
    "remember_me": false
  }'

# 예상 응답: 401 Unauthorized

# 3. 존재하지 않는 이메일 테스트
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123",
    "remember_me": false
  }'

# 예상 응답: 401 Unauthorized

# 4. "로그인 상태 유지" 테스트
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "remember_me": true
  }'

# 예상 응답: expires_in=2592000 (30일)
```

---

### Phase 2: Frontend (Next.js) - 1-2시간

#### Task 2.1: Login Page 업데이트
**파일**: `src/app/login/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          remember_me: data.rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.detail?.code === "INVALID_CREDENTIALS") {
          setError("이메일 또는 비밀번호가 올바르지 않습니다");
        } else {
          setError(result.detail?.message || "로그인에 실패했습니다");
        }
        return;
      }

      // Store JWT token
      localStorage.setItem("access_token", result.access_token);

      // Store user info (optional, for UI display)
      localStorage.setItem("user", JSON.stringify(result.user));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            이메일과 비밀번호를 입력하여 로그인하세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                로그인 상태 유지 (30일)
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  또는 다음으로 로그인
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" disabled>
                카카오
              </Button>
              <Button type="button" variant="outline" disabled>
                구글
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/signup" className="text-sm text-blue-600 hover:underline">
              계정이 없으신가요? 회원가입
            </Link>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              비밀번호를 잊으셨나요?
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

---

#### Task 2.2: Frontend 테스트

1. **수동 테스트 - 성공 케이스**:
   - http://localhost:3000/login 접속
   - 등록된 이메일/비밀번호 입력 (story-001.md에서 생성한 계정)
   - "로그인" 버튼 클릭
   - `/dashboard`로 리다이렉트 확인
   - `localStorage`에 `access_token` 저장 확인 (브라우저 DevTools)

2. **수동 테스트 - 에러 케이스**:
   - 잘못된 비밀번호 입력 → 에러 메시지 표시 확인
   - 존재하지 않는 이메일 → 에러 메시지 표시 확인
   - 빈 필드 → 클라이언트 측 검증 에러 표시 확인

3. **"로그인 상태 유지" 테스트**:
   - 체크박스 선택 후 로그인
   - 응답의 `expires_in` 값이 `2592000` (30일)인지 확인

---

### Phase 3: Integration Testing - 30분

#### Task 3.1: E2E 테스트 시나리오

**테스트 파일**: `tests/e2e/auth-login.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Login', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');

    // Fill in form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // Check token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
  });

  test('should show error with invalid password', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
  });

  test('should validate empty fields', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Try to submit without filling
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=이메일을 입력해주세요')).toBeVisible();
  });

  test('should handle "remember me" option', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Check "remember me"
    await page.check('input[type="checkbox"]');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });
});
```

**실행**:
```bash
npx playwright test tests/e2e/auth-login.spec.ts
```

---

#### Task 3.2: API 통합 테스트

**데이터베이스 확인**:
```bash
# 1. 테스트 계정 생성 (story-001.md에서 이미 생성했다면 스킵)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "agreed_to_terms": true,
    "agreed_to_privacy": true
  }'

# 2. 로그인 테스트
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "remember_me": false
  }'

# 3. JWT 토큰 검증 (JWT.io에서 디코딩 또는 python-jose로 검증)
```

---

## Definition of Done

### Backend
- [x] `UserLoginRequest`, `UserLoginResponse` Pydantic 스키마 작성
- [x] `POST /api/v1/auth/login` 엔드포인트 구현
- [x] 비밀번호 검증 (`verify_password`) 적용
- [x] JWT 토큰 생성 (`create_access_token`) 적용
- [x] "로그인 상태 유지" 옵션 처리 (30일 vs 24시간)
- [x] 에러 처리 (401 Unauthorized, 422 Validation)
- [x] cURL로 API 테스트 통과

### Frontend
- [x] `/login` 페이지 기능 구현
- [x] react-hook-form + Zod 검증 적용
- [x] "로그인 상태 유지" 체크박스 추가
- [x] 로그인 성공 시 JWT 토큰 localStorage 저장
- [x] 로그인 성공 시 `/dashboard` 리다이렉트
- [x] 에러 메시지 UI 표시
- [x] 로딩 상태 처리

### Testing
- [x] 성공 케이스: 올바른 이메일/비밀번호로 로그인 성공
- [x] 에러 케이스 1: 잘못된 비밀번호 → 401 에러
- [x] 에러 케이스 2: 존재하지 않는 이메일 → 401 에러
- [x] 에러 케이스 3: 빈 필드 → 클라이언트 검증 에러
- [x] "로그인 상태 유지" 옵션 테스트 (expires_in 확인)
- [x] E2E 테스트 작성 및 통과 (선택 사항)

### Documentation
- [x] API 엔드포인트 문서화 (FastAPI 자동 문서 `/docs`)
- [x] STORY-TRACKER.md 업데이트 (US-1.2 완료 체크)
- [x] README.md 업데이트 (로그인 사용 방법 추가)

### Code Quality
- [x] TypeScript strict mode 준수
- [x] ESLint 에러 없음
- [x] FastAPI 코드 스타일 일관성
- [x] 보안 고려사항 적용 (동일 에러 메시지, bcrypt 검증)

---

## Time Estimate

| Phase | Task | Estimated Time |
|-------|------|----------------|
| Phase 1 | Backend 스키마 및 엔드포인트 | 1-1.5시간 |
| Phase 1 | Backend 테스트 | 0.5시간 |
| Phase 2 | Frontend 구현 | 1-1.5시간 |
| Phase 2 | Frontend 테스트 | 0.5시간 |
| Phase 3 | Integration Testing | 0.5시간 |
| **Total** | | **3-5시간** |

---

## Dependencies

### Prerequisites
- ✅ US-1.1: 회원가입 완료 (User 모델, JWT 인프라 구축됨)
- ✅ Backend 서버 실행 중 (http://localhost:8000)
- ✅ Frontend 서버 실행 중 (http://localhost:3000)
- ✅ PostgreSQL 데이터베이스 실행 중
- ✅ 테스트용 계정 존재 (story-001.md에서 생성)

### Related Stories
- **Next Story**: US-1.3 (카카오 소셜 로그인) - story-003.md
- **Blocked by**: 없음

---

## Security Considerations

1. **Timing Attack 방지**
   - 이메일 존재 여부와 비밀번호 불일치를 동일한 에러 메시지로 처리
   - bcrypt는 자체적으로 timing attack 방지 기능 제공

2. **Rate Limiting**
   - MVP에서는 생략
   - 향후 추가 권장: 동일 IP에서 1분에 5회 이상 로그인 시도 차단

3. **JWT 토큰 보안**
   - localStorage 사용 (XSS 취약점 있으나 MVP에서 허용)
   - 향후 개선: httpOnly 쿠키 + CSRF 토큰 조합

4. **HTTPS 필수**
   - 프로덕션 환경에서는 반드시 HTTPS 적용 (Vercel 자동 제공)

5. **비밀번호 해싱**
   - bcrypt 사용 (이미 story-001.md에서 구현됨)
   - Salt 자동 생성

---

## Notes

- 이 Story는 US-1.1 (회원가입)을 기반으로 하며, 동일한 기술 스택 사용
- "로그인 상태 유지" 기능은 PRD.md의 FR-02 요구사항에 포함됨
- 소셜 로그인 (카카오, 구글)은 별도 Story (US-1.3)에서 처리
- 비밀번호 재설정은 US-1.6 (story-006.md)에서 처리
