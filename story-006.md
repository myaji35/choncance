# Story-006: 비밀번호 재설정

**Epic**: Epic 1 - 사용자 인증 및 회원 관리
**User Story ID**: US-1.6
**Story Points**: 5
**Priority**: P1 (High)
**Dependencies**: US-1.1 (회원가입), US-1.2 (로그인)

---

## [What] 요구사항

### User Story

```
As a 가입된 사용자
I want to 비밀번호를 잊어버렸을 때 재설정할 수 있다
So that 계정 접근 권한을 다시 복구할 수 있다
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: 비밀번호 재설정 요청

```gherkin
Given: 사용자가 로그인 페이지의 "비밀번호를 잊으셨나요?" 링크를 클릭했을 때
When: 가입된 이메일 주소를 입력하고 "재설정 링크 보내기" 버튼을 클릭하면
Then:
  * HTTP 200 OK 응답이 반환되고
  * "비밀번호 재설정 링크가 이메일로 발송되었습니다" 메시지가 표시된다
  * 해당 이메일로 재설정 링크가 포함된 이메일이 발송된다
  * 재설정 토큰의 유효 시간은 1시간이다
```

**예상 Request:**
```json
{
  "email": "user@example.com"
}
```

**예상 Response (200 OK):**
```json
{
  "message": "비밀번호 재설정 링크가 이메일로 발송되었습니다"
}
```

---

#### Scenario 2: 가입되지 않은 이메일로 재설정 요청

```gherkin
Given: 사용자가 비밀번호 재설정 페이지에서
When: 가입되지 않은 이메일 주소를 입력하고 "재설정 링크 보내기" 버튼을 클릭하면
Then:
  * HTTP 200 OK 응답이 반환되고 (보안상 동일한 응답)
  * "비밀번호 재설정 링크가 이메일로 발송되었습니다" 메시지가 표시된다
  * 실제로는 이메일이 발송되지 않는다 (보안 - 계정 존재 여부 노출 방지)
```

**보안 고려사항**:
- 이메일이 존재하지 않아도 동일한 성공 메시지를 표시하여 계정 존재 여부를 노출하지 않음

---

#### Scenario 3: 재설정 링크로 비밀번호 변경 성공

```gherkin
Given: 사용자가 이메일에서 받은 재설정 링크를 클릭했을 때
When: 새 비밀번호를 입력하고 "비밀번호 변경" 버튼을 클릭하면
Then:
  * HTTP 200 OK 응답이 반환되고
  * 비밀번호가 새로운 값으로 변경된다
  * "비밀번호가 성공적으로 변경되었습니다" 메시지가 표시된다
  * 자동으로 로그인 페이지로 리다이렉트된다
```

**예상 Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewPassword123!"
}
```

**예상 Response (200 OK):**
```json
{
  "message": "비밀번호가 성공적으로 변경되었습니다"
}
```

---

#### Scenario 4: 만료된 토큰으로 재설정 시도

```gherkin
Given: 사용자가 1시간이 지난 재설정 링크를 클릭했을 때
When: 새 비밀번호를 입력하고 "비밀번호 변경" 버튼을 클릭하면
Then:
  * HTTP 400 Bad Request 응답이 반환되고
  * "재설정 링크가 만료되었습니다. 다시 요청해주세요" 에러 메시지가 표시된다
```

**예상 Response (400 Bad Request):**
```json
{
  "detail": {
    "code": "TOKEN_EXPIRED",
    "message": "재설정 링크가 만료되었습니다. 다시 요청해주세요"
  }
}
```

---

#### Scenario 5: 유효하지 않은 비밀번호 형식

```gherkin
Given: 사용자가 비밀번호 재설정 페이지에서
When: "1234" (영문 없음, 8자 미만)를 입력하고 저장하면
Then:
  * HTTP 422 Unprocessable Entity 응답이 반환되고
  * "비밀번호는 8자 이상이어야 합니다" 에러 메시지가 표시된다
```

**예상 Response (422 Validation Error):**
```json
{
  "detail": [
    {
      "loc": ["body", "new_password"],
      "msg": "비밀번호는 8자 이상이어야 합니다",
      "type": "value_error.min_length"
    }
  ]
}
```

---

## [How] 기술 구현

### API Endpoint 설계

#### POST /api/v1/auth/forgot-password

**설명**: 비밀번호 재설정 이메일 발송 요청

**Request Body (Pydantic Schema):**
```python
class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
```

**Request Example:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "비밀번호 재설정 링크가 이메일로 발송되었습니다"
}
```

**Error Responses:**
- `422 Unprocessable Entity`: 이메일 형식 오류

---

#### POST /api/v1/auth/reset-password

**설명**: 새 비밀번호로 변경

**Request Body (Pydantic Schema):**
```python
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(
        ...,
        min_length=8,
        pattern=r'^(?=.*[A-Za-z])(?=.*\d).+$'
    )
```

**Request Example:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "비밀번호가 성공적으로 변경되었습니다"
}
```

**Error Responses:**
- `400 Bad Request`: 토큰 만료 또는 유효하지 않은 토큰
- `422 Unprocessable Entity`: 비밀번호 형식 오류

---

### Database Schema

기존 `users` 테이블 사용, 추가 필드 필요 없음.

대신 **임시 토큰 저장을 위해 Redis 또는 DB 테이블 사용**:

#### 옵션 1: Redis (권장)
```
Key: reset_token:{token}
Value: {user_id}
TTL: 3600 (1시간)
```

#### 옵션 2: password_reset_tokens 테이블
| 컬럼명 | 타입 | 제약 조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 토큰 고유 ID |
| `user_id` | UUID | FOREIGN KEY (users.id) | 사용자 ID |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL | 재설정 토큰 (JWT) |
| `expires_at` | TIMESTAMP | NOT NULL | 만료 시간 (1시간 후) |
| `used` | BOOLEAN | DEFAULT FALSE | 사용 여부 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성 시간 |

**변경 사항**:
- MVP에서는 Redis 없이 DB 테이블 사용 권장
- 프로덕션에서는 Redis로 마이그레이션

---

### Email Template

비밀번호 재설정 이메일 내용:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>비밀번호 재설정 - ChonCance</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>비밀번호 재설정 요청</h2>
    <p>안녕하세요,</p>
    <p>ChonCance 계정의 비밀번호 재설정 요청이 접수되었습니다.</p>
    <p>아래 버튼을 클릭하여 비밀번호를 재설정하세요:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{reset_url}}"
         style="background-color: #4CAF50; color: white; padding: 12px 24px;
                text-decoration: none; border-radius: 4px; display: inline-block;">
        비밀번호 재설정
      </a>
    </div>
    <p style="color: #666; font-size: 14px;">
      또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
      <a href="{{reset_url}}">{{reset_url}}</a>
    </p>
    <p style="color: #666; font-size: 14px;">
      이 링크는 <strong>1시간 동안만</strong> 유효합니다.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">
      비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
    </p>
    <p style="color: #999; font-size: 12px;">
      ChonCance 팀 드림
    </p>
  </div>
</body>
</html>
```

---

### Coding Standards

#### Backend (FastAPI)

1. **이메일 발송 라이브러리**
   - `fastapi-mail` 또는 `python-jose` + `smtplib` 사용
   - SMTP 설정: Gmail, SendGrid, AWS SES 등

2. **토큰 생성**
   ```python
   from jose import jwt
   from datetime import datetime, timedelta

   def create_reset_token(user_id: str) -> str:
       payload = {
           "sub": user_id,
           "exp": datetime.utcnow() + timedelta(hours=1),
           "type": "password_reset"
       }
       return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
   ```

3. **토큰 검증**
   ```python
   def verify_reset_token(token: str) -> str | None:
       try:
           payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
           if payload.get("type") != "password_reset":
               return None
           return payload.get("sub")
       except JWTError:
           return None
   ```

#### Frontend (Next.js)

1. **비밀번호 재설정 요청 페이지**
   - 경로: `/forgot-password`
   - 이메일 입력 폼

2. **비밀번호 재설정 페이지**
   - 경로: `/reset-password?token={token}`
   - 새 비밀번호 입력 폼
   - 비밀번호 확인 입력

3. **Zod Validation**
   ```typescript
   const resetPasswordSchema = z.object({
     password: z
       .string()
       .min(8, "비밀번호는 8자 이상이어야 합니다")
       .regex(/[A-Za-z]/, "비밀번호는 영문을 포함해야 합니다")
       .regex(/\d/, "비밀번호는 숫자를 포함해야 합니다"),
     passwordConfirm: z.string(),
   }).refine((data) => data.password === data.passwordConfirm, {
     message: "비밀번호가 일치하지 않습니다",
     path: ["passwordConfirm"],
   });
   ```

---

## [Tasks] 구현 작업

### Phase 1: Backend (FastAPI) - 2.5시간

#### Task 1.1: 이메일 설정 및 템플릿

**파일**: `backend/app/core/email.py` (새로 생성)

```python
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from pathlib import Path

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@choncance.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=Path(__file__).parent.parent / "templates" / "email"
)

fm = FastMail(conf)


async def send_password_reset_email(
    email: EmailStr,
    reset_token: str,
    frontend_url: str = "http://localhost:3000"
):
    """
    비밀번호 재설정 이메일 발송

    Args:
        email: 수신자 이메일
        reset_token: 재설정 토큰
        frontend_url: 프론트엔드 URL
    """
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"

    message = MessageSchema(
        subject="ChonCance 비밀번호 재설정",
        recipients=[email],
        template_body={
            "reset_url": reset_url
        },
        subtype="html"
    )

    await fm.send_message(message, template_name="password_reset.html")
```

---

#### Task 1.2: Pydantic 스키마 추가

**파일**: `backend/app/schemas/auth.py` (기존 파일에 추가)

```python
class ForgotPasswordRequest(BaseModel):
    """비밀번호 재설정 요청 스키마"""
    email: EmailStr

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com"
            }
        }


class ForgotPasswordResponse(BaseModel):
    """비밀번호 재설정 요청 응답 스키마"""
    message: str


class ResetPasswordRequest(BaseModel):
    """비밀번호 재설정 스키마"""
    token: str
    new_password: str = Field(..., min_length=8)

    @validator('new_password')
    def validate_password(cls, v):
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('비밀번호는 영문을 포함해야 합니다')
        if not re.search(r'\d', v):
            raise ValueError('비밀번호는 숫자를 포함해야 합니다')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "new_password": "NewPassword123!"
            }
        }


class ResetPasswordResponse(BaseModel):
    """비밀번호 재설정 응답 스키마"""
    message: str
```

---

#### Task 1.3: 비밀번호 재설정 API 라우터

**파일**: `backend/app/routers/auth.py` (기존 파일에 추가)

```python
from app.core.email import send_password_reset_email
from app.utils.security import create_reset_token, verify_reset_token, hash_password


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request_data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    비밀번호 재설정 이메일 발송

    보안상 이메일 존재 여부와 관계없이 동일한 응답 반환
    """
    # 사용자 조회
    result = await db.execute(
        select(User).where(User.email == request_data.email)
    )
    user = result.scalar_one_or_none()

    if user:
        # 재설정 토큰 생성
        reset_token = create_reset_token(str(user.id))

        # 이메일 발송
        try:
            await send_password_reset_email(
                email=user.email,
                reset_token=reset_token
            )
        except Exception as e:
            # 이메일 발송 실패 시 로그만 남기고 사용자에게는 성공 메시지
            print(f"Email send failed: {e}")

    # 보안상 항상 동일한 응답 반환
    return ForgotPasswordResponse(
        message="비밀번호 재설정 링크가 이메일로 발송되었습니다"
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    request_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    비밀번호 재설정
    """
    # 토큰 검증
    user_id = verify_reset_token(request_data.token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_TOKEN",
                "message": "유효하지 않은 재설정 링크입니다"
            }
        )

    # 사용자 조회
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "USER_NOT_FOUND",
                "message": "사용자를 찾을 수 없습니다"
            }
        )

    # 비밀번호 변경
    user.password_hash = hash_password(request_data.new_password)
    await db.commit()

    return ResetPasswordResponse(
        message="비밀번호가 성공적으로 변경되었습니다"
    )
```

---

#### Task 1.4: 토큰 유틸리티 함수 추가

**파일**: `backend/app/utils/security.py` (기존 파일에 추가)

```python
from datetime import datetime, timedelta
from jose import jwt, JWTError

RESET_TOKEN_EXPIRE_HOURS = 1


def create_reset_token(user_id: str) -> str:
    """
    비밀번호 재설정 토큰 생성

    Args:
        user_id: 사용자 ID

    Returns:
        str: JWT 재설정 토큰
    """
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS),
        "type": "password_reset"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_reset_token(token: str) -> str | None:
    """
    비밀번호 재설정 토큰 검증

    Args:
        token: JWT 토큰

    Returns:
        str | None: 사용자 ID (유효한 경우) 또는 None
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # 토큰 타입 확인
        if payload.get("type") != "password_reset":
            return None

        # 만료 시간 확인 (자동으로 검증됨)
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None
```

---

#### Task 1.5: 이메일 템플릿 생성

**파일**: `backend/app/templates/email/password_reset.html` (새로 생성)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>비밀번호 재설정 - ChonCance</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2c3e50;">비밀번호 재설정 요청</h2>
    <p>안녕하세요,</p>
    <p>ChonCance 계정의 비밀번호 재설정 요청이 접수되었습니다.</p>
    <p>아래 버튼을 클릭하여 비밀번호를 재설정하세요:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{reset_url}}"
         style="background-color: #4CAF50; color: white; padding: 12px 24px;
                text-decoration: none; border-radius: 4px; display: inline-block;">
        비밀번호 재설정
      </a>
    </div>
    <p style="color: #666; font-size: 14px;">
      또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
      <a href="{{reset_url}}" style="color: #3498db;">{{reset_url}}</a>
    </p>
    <p style="color: #e74c3c; font-size: 14px;">
      ⏰ 이 링크는 <strong>1시간 동안만</strong> 유효합니다.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">
      비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.<br>
      귀하의 계정은 안전하게 보호됩니다.
    </p>
    <p style="color: #999; font-size: 12px;">
      ChonCance 팀 드림
    </p>
  </div>
</body>
</html>
```

---

#### Task 1.6: 환경 변수 설정

**파일**: `backend/.env` (추가)

```bash
# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@choncance.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
```

---

### Phase 2: Frontend (Next.js) - 2시간

#### Task 2.1: 비밀번호 재설정 요청 페이지

**파일**: `src/app/forgot-password/page.tsx` (새로 생성)

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('요청 처리 중 오류가 발생했습니다');
      }

      setSuccess(true);
    } catch (err) {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">비밀번호 재설정</CardTitle>
          <CardDescription className="text-center">
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {success && (
              <div className="p-4 text-sm text-green-700 bg-green-50 rounded-md">
                비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요.
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {!success && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '전송 중...' : '재설정 링크 보내기'}
                </Button>
              </>
            )}

            <div className="text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
```

---

#### Task 2.2: 비밀번호 재설정 페이지

**파일**: `src/app/reset-password/page.tsx` (새로 생성)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[A-Za-z]/, '비밀번호는 영문을 포함해야 합니다')
    .regex(/\d/, '비밀번호는 숫자를 포함해야 합니다'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 재설정 링크입니다');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('유효하지 않은 재설정 링크입니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.detail?.code === 'INVALID_TOKEN') {
          setError('재설정 링크가 만료되었거나 유효하지 않습니다');
        } else {
          setError(result.detail?.message || '비밀번호 재설정에 실패했습니다');
        }
        return;
      }

      alert('비밀번호가 성공적으로 변경되었습니다!');
      router.push('/login');
    } catch (err) {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">새 비밀번호 설정</CardTitle>
          <CardDescription className="text-center">
            새로운 비밀번호를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="password">새 비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="영문, 숫자 포함 8자 이상"
                {...register('password')}
                disabled={isLoading || !token}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type="password"
                {...register('passwordConfirm')}
                disabled={isLoading || !token}
              />
              {errors.passwordConfirm && (
                <p className="text-sm text-red-500">{errors.passwordConfirm.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !token}>
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
```

---

#### Task 2.3: 로그인 페이지에 링크 추가 (이미 존재)

**파일**: `src/app/login/page.tsx` (확인)

이미 "비밀번호를 잊으셨나요?" 링크가 존재하므로 추가 작업 불필요.

```tsx
<Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
  비밀번호를 잊으셨나요?
</Link>
```

---

### Phase 3: Integration Testing - 30분

#### Task 3.1: Backend 테스트 (cURL)

```bash
# 1. 비밀번호 재설정 요청
curl -X POST "http://localhost:8000/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# 예상 응답: 200 OK + "비밀번호 재설정 링크가 이메일로 발송되었습니다"

# 2. 비밀번호 재설정 (토큰은 이메일에서 복사)
curl -X POST "http://localhost:8000/api/v1/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "new_password": "NewPassword123!"
  }'

# 예상 응답: 200 OK + "비밀번호가 성공적으로 변경되었습니다"

# 3. 새 비밀번호로 로그인 테스트
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "NewPassword123!",
    "remember_me": false
  }'

# 예상 응답: 200 OK + JWT 토큰
```

---

#### Task 3.2: E2E 테스트 시나리오

**테스트 파일**: `tests/e2e/password-reset.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Password Reset Flow', () => {
  test('should request password reset successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');

    // 이메일 입력
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // 성공 메시지 확인
    await expect(page.locator('text=비밀번호 재설정 링크가 이메일로 발송되었습니다')).toBeVisible();
  });

  test('should reset password with valid token', async ({ page }) => {
    // 테스트용 토큰 생성 (실제로는 이메일에서 가져옴)
    const testToken = 'test-reset-token';

    await page.goto(`http://localhost:3000/reset-password?token=${testToken}`);

    // 새 비밀번호 입력
    await page.fill('input[id="password"]', 'NewPassword123!');
    await page.fill('input[id="passwordConfirm"]', 'NewPassword123!');

    await page.click('button[type="submit"]');

    // 성공 후 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    const testToken = 'test-reset-token';

    await page.goto(`http://localhost:3000/reset-password?token=${testToken}`);

    await page.fill('input[id="password"]', 'NewPassword123!');
    await page.fill('input[id="passwordConfirm"]', 'DifferentPassword456!');

    await page.click('button[type="submit"]');

    // 에러 메시지 확인
    await expect(page.locator('text=비밀번호가 일치하지 않습니다')).toBeVisible();
  });
});
```

---

## Definition of Done

### Backend
- [ ] `forgot-password` 엔드포인트 구현
- [ ] `reset-password` 엔드포인트 구현
- [ ] JWT 토큰 생성/검증 함수 구현
- [ ] 이메일 발송 기능 구현
- [ ] 이메일 템플릿 생성
- [ ] Pydantic 검증 작동
- [ ] cURL로 API 테스트 통과

### Frontend
- [ ] `/forgot-password` 페이지 구현
- [ ] `/reset-password` 페이지 구현
- [ ] 로그인 페이지에 "비밀번호를 잊으셨나요?" 링크 확인
- [ ] Zod 검증 작동
- [ ] 에러 메시지 UI 표시
- [ ] 성공 후 리다이렉트 작동

### Testing
- [ ] 모든 Acceptance Criteria 통과
- [ ] 비밀번호 재설정 요청 테스트
- [ ] 비밀번호 재설정 테스트
- [ ] 만료된 토큰 테스트
- [ ] 유효성 검증 테스트

### Documentation
- [ ] API 엔드포인트 Swagger 문서화
- [ ] STORY-TRACKER.md 업데이트

---

## Time Estimate

| Phase | Estimated Time |
|-------|----------------|
| Phase 1: Backend | 2.5시간 |
| Phase 2: Frontend | 2시간 |
| Phase 3: Testing | 0.5시간 |
| **Total** | **5시간** |

---

## Dependencies

### Prerequisites
- ✅ US-1.1: 회원가입 완료
- ✅ US-1.2: 로그인 완료
- ✅ Backend 서버 실행 중
- ✅ Frontend 서버 실행 중
- ✅ JWT 인증 구현 완료
- ❌ SMTP 서버 설정 (Gmail, SendGrid 등)

### Python Packages
```bash
pip install fastapi-mail python-jose[cryptography]
```

### Related Stories
- **Next Story**: US-2.1 (테마 태그 시스템) - story-007.md
- **Depends On**: US-1.1, US-1.2

---

## Security Considerations

1. **토큰 보안**
   - 재설정 토큰은 1시간 후 자동 만료
   - 일회용 토큰 (한 번 사용 후 무효화 권장)
   - HTTPS를 통한 토큰 전송 필수

2. **계정 열거 방지**
   - 존재하지 않는 이메일도 동일한 성공 메시지 반환
   - 응답 시간 차이로 계정 존재 여부 노출 방지

3. **Rate Limiting**
   - 동일 IP에서 1분에 최대 3회 요청 제한 (선택 사항)
   - 브루트포스 공격 방지

4. **이메일 스푸핑 방지**
   - SPF, DKIM, DMARC 설정
   - 공식 도메인에서만 이메일 발송

---

## Notes

### SMTP 설정 가이드

#### Gmail 사용 시
1. Google 계정에서 "앱 비밀번호" 생성
2. 2단계 인증 필수
3. `.env`에 앱 비밀번호 입력

#### SendGrid 사용 시 (권장 - 프로덕션)
```bash
MAIL_SERVER=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.your-sendgrid-api-key
```

### 개선 사항 (추후)
- 비밀번호 재설정 횟수 제한
- 재설정 토큰 블랙리스트 (Redis)
- 비밀번호 재설정 성공 알림 이메일
- 계정 보안 활동 로그

---

## 참고 자료

- [FastAPI Mail 문서](https://sabuhish.github.io/fastapi-mail/)
- [Python-JOSE 문서](https://python-jose.readthedocs.io/)
- [OWASP Forgot Password 가이드](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
