# US-04: 안전한 사용자 인증

**Story ID**: US-04
**Epic**: Epic 1 - 사용자 인증
**상태**: ✅ 완료 (100%)
**우선순위**: P0 (Critical)
**작성일**: 2026-02-10

---

## User Story

**As a** 플랫폼 사용자 (게스트 또는 호스트)
**I want to** 간편하게 로그인하고 안전하게 내 정보를 관리하기
**So that** 예약 내역을 저장하고 개인화된 서비스를 받을 수 있다

---

## 배경 (Background)

VINTEE는 **Clerk**를 활용한 인증 시스템으로 개발 부담을 줄이고 **한국 사용자에 최적화된 로그인 경험**을 제공한다. 이메일/비밀번호 외에도 **카카오 간편 로그인**을 지원하여 가입 장벽을 낮춘다.

### 문제점 (Pain Points)
- 기존 플랫폼: 복잡한 회원가입 절차 (이메일 인증 필수)
- 비밀번호 분실: 재설정 과정 복잡
- 로그인 보안: 2FA 부재 시 계정 탈취 위험

### 기대 효과 (Expected Benefits)
- 회원가입 전환율 70% → 90% 향상 (간편 로그인)
- 비밀번호 재설정 문의 80% 감소 (Clerk 자동 처리)
- 계정 보안 강화 (2FA 옵션 제공)

---

## 시나리오 (Scenarios)

### Scenario 1: 카카오 간편 로그인 (신규 가입)

**Context**: 직장인 지수(28세)는 VINTEE에서 숙소를 예약하려 하지만 계정이 없다.

**Steps**:
1. 숙소 상세 페이지에서 **"예약하기"** 버튼 클릭
2. 로그인 필요 알림 → 로그인 페이지로 리다이렉트 (`/login`)
3. **"카카오로 시작하기"** 버튼 클릭
4. 카카오 OAuth 팝업 열림
5. 카카오 계정 로그인 (이미 로그인 시 자동 승인)
6. VINTEE 권한 동의:
   - 프로필 정보 (이름, 프로필 사진)
   - 이메일 주소
7. **"동의하고 계속하기"** 클릭
8. Clerk가 자동으로 User 레코드 생성:
   - kakaoId: "1234567890"
   - email: "jisu@kakao.com"
   - name: "김지수"
   - role: "USER"
9. 자동 로그인 후 원래 페이지로 리다이렉트 (`/property/clprop001`)
10. 예약 프로세스 계속 진행

**Expected Outcome**:
- ✅ 총 소요 시간 10초 이내
- ✅ 복잡한 회원가입 양식 불필요
- ✅ 카카오 프로필 자동 동기화

---

### Scenario 2: 이메일/비밀번호 로그인 (기존 사용자)

**Context**: 호스트 박영수 씨(55세)는 PC에서 호스트 대시보드에 접속하려 한다.

**Steps**:
1. VINTEE 홈페이지 접속 (`/`)
2. 우측 상단 **"로그인"** 버튼 클릭
3. 로그인 페이지 (`/login`)
4. **"이메일로 로그인"** 탭 선택
5. 이메일 입력: "park@example.com"
6. 비밀번호 입력: "********"
7. **"로그인"** 버튼 클릭
8. Clerk 인증 처리 (세션 생성)
9. 홈페이지로 리다이렉트
10. 우측 상단에 프로필 아이콘 표시 (로그인 상태)
11. 프로필 드롭다운에서 **"호스트 대시보드"** 클릭
12. 호스트 대시보드 접속 (`/host/dashboard`)

**Expected Outcome**:
- ✅ 간단한 이메일/비밀번호 로그인
- ✅ 세션 유지 (7일)
- ✅ 역할 기반 메뉴 표시 (호스트)

---

### Scenario 3: 비밀번호 재설정

**Context**: 지수(28세)는 비밀번호를 잊어버렸다.

**Steps**:
1. 로그인 페이지 접속 (`/login`)
2. **"비밀번호를 잊으셨나요?"** 링크 클릭
3. 비밀번호 재설정 페이지 (`/reset-password`)
4. 이메일 입력: "jisu@example.com"
5. **"재설정 이메일 발송"** 버튼 클릭
6. Clerk가 자동으로 재설정 이메일 발송
7. 이메일 수신 (5분 이내)
8. 이메일 내 **"비밀번호 재설정"** 링크 클릭
9. 새 비밀번호 입력 페이지
10. 새 비밀번호 입력 (최소 8자, 영문/숫자 조합)
11. **"비밀번호 변경"** 버튼 클릭
12. 성공 메시지: "비밀번호가 변경되었습니다"
13. 자동 로그인 후 홈페이지로 이동

**Expected Outcome**:
- ✅ Clerk 자동 처리로 개발 부담 0
- ✅ 이메일 발송 5분 이내
- ✅ 안전한 비밀번호 정책 강제

---

### Scenario 4: 회원가입 (이메일/비밀번호)

**Context**: 민호(30세)는 카카오 계정 없이 이메일로 가입하려 한다.

**Steps**:
1. VINTEE 홈페이지 접속
2. **"회원가입"** 버튼 클릭 (`/signup`)
3. **"이메일로 가입"** 탭 선택
4. 이메일 입력: "minho@example.com"
5. 비밀번호 입력: "MyPassword123!"
6. 비밀번호 확인: "MyPassword123!"
7. 이름 입력: "이민호"
8. **"회원가입"** 버튼 클릭
9. Clerk가 이메일 인증 코드 발송
10. 인증 코드 입력 페이지
11. 이메일에서 코드 확인 (6자리)
12. 코드 입력 후 **"인증"** 버튼 클릭
13. 회원가입 완료 → 자동 로그인
14. 홈페이지로 리다이렉트

**Expected Outcome**:
- ✅ 이메일 인증으로 스팸 계정 방지
- ✅ 간단한 회원가입 양식
- ✅ 즉시 서비스 이용 가능

---

### Scenario 5: 로그아웃 및 세션 관리

**Context**: 지수(28세)는 공용 PC에서 로그아웃하려 한다.

**Steps**:
1. VINTEE 홈페이지 접속 (로그인 상태)
2. 우측 상단 프로필 아이콘 클릭
3. 드롭다운 메뉴에서 **"로그아웃"** 클릭
4. Clerk 세션 종료
5. 홈페이지로 리다이렉트 (로그아웃 상태)
6. 우측 상단에 **"로그인"** 버튼 표시

**다음 접속 시 (세션 유지)**:
1. 7일 이내 다시 접속 (개인 PC)
2. 자동 로그인 (세션 유지)
3. 프로필 아이콘 표시 (로그인 상태)

**Expected Outcome**:
- ✅ 안전한 로그아웃
- ✅ 세션 자동 유지 (7일)
- ✅ 공용 PC 보안 (로그아웃 필수)

---

## 수락 기준 (Acceptance Criteria)

### AC-1: 로그인 페이지
- [ ] URL: `/login`
- [ ] Clerk UI Components 사용 (`<SignIn />`)
- [ ] 한국어 로컬라이제이션 적용
- [ ] 로그인 방법:
  - [ ] 카카오 간편 로그인 (우선)
  - [ ] 이메일/비밀번호 로그인
  - [ ] Google 로그인 (향후 추가)
- [ ] "회원가입" 링크 → `/signup`
- [ ] "비밀번호 찾기" 링크 → Clerk 자동 처리
- [ ] 로그인 성공 시 리다이렉트:
  - [ ] 기본: `/`
  - [ ] 원래 페이지 (redirectUrl 파라미터)

### AC-2: 회원가입 페이지
- [ ] URL: `/signup`
- [ ] Clerk UI Components 사용 (`<SignUp />`)
- [ ] 한국어 로컬라이제이션
- [ ] 가입 방법:
  - [ ] 카카오 간편 가입 (우선)
  - [ ] 이메일/비밀번호 가입
- [ ] 이메일 인증 코드 발송 (자동)
- [ ] 비밀번호 정책:
  - [ ] 최소 8자
  - [ ] 영문 + 숫자 조합
  - [ ] 특수문자 권장
- [ ] 회원가입 완료 시:
  - [ ] User 레코드 자동 생성
  - [ ] role: "USER" (기본)
  - [ ] 자동 로그인
  - [ ] 홈페이지로 리다이렉트

### AC-3: Protected Routes (Middleware)
- [ ] 미들웨어 설정 (`middleware.ts`):
  - [ ] 공개 라우트: `/`, `/explore`, `/property/:id`, `/login`, `/signup`
  - [ ] 보호 라우트: `/bookings`, `/host/*`, `/profile`
- [ ] 보호 라우트 접근 시:
  - [ ] 로그인 확인
  - [ ] 미로그인: `/login`으로 리다이렉트 (redirectUrl 저장)
  - [ ] 로그인: 페이지 접근 허용
- [ ] 역할 기반 접근 제어:
  - [ ] `/host/*`: HOST 역할 필요
  - [ ] HOST 역할 없음: 권한 없음 페이지 표시

### AC-4: Clerk Webhook (사용자 동기화)
- [ ] Webhook 엔드포인트: `/api/webhooks/clerk`
- [ ] 이벤트 처리:
  - [ ] `user.created`: User 레코드 생성 (Prisma)
  - [ ] `user.updated`: User 레코드 업데이트
  - [ ] `user.deleted`: User 레코드 soft delete
- [ ] 사용자 정보 동기화:
  - [ ] id: Clerk userId
  - [ ] email: 이메일
  - [ ] name: 이름
  - [ ] profileImage: 프로필 사진 (카카오)
  - [ ] kakaoId: 카카오 고유 ID (OAuth)

### AC-5: 사용자 프로필 컴포넌트
- [ ] SiteHeader 우측 상단:
  - [ ] 로그아웃 상태: "로그인" 버튼
  - [ ] 로그인 상태: 프로필 아이콘
- [ ] 프로필 드롭다운 (로그인 시):
  - [ ] 사용자 이름 표시
  - [ ] "내 예약" → `/bookings`
  - [ ] "프로필 설정" → `/profile` (Clerk UserProfile)
  - [ ] "호스트 대시보드" → `/host/dashboard` (HOST 역할만)
  - [ ] "로그아웃" → Clerk 로그아웃
- [ ] 모바일 반응형:
  - [ ] 햄버거 메뉴에 통합

### AC-6: 세션 관리
- [ ] 세션 유지 기간: 7일
- [ ] 자동 로그인 (세션 유효 시)
- [ ] 세션 만료 시:
  - [ ] 로그인 페이지로 리다이렉트
  - [ ] 만료 메시지 표시: "세션이 만료되었습니다. 다시 로그인해주세요."

---

## 기술 구현 (Technical Implementation)

### 프론트엔드

**Clerk Provider 설정** (`app/layout.tsx`):
```tsx
import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**로그인 페이지** (`app/login/[[...rest]]/page.tsx`):
```tsx
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
        routing="path"
        path="/login"
        signUpUrl="/signup"
      />
    </div>
  );
}
```

**SiteHeader 컴포넌트** (`components/layout/SiteHeader.tsx`):
```tsx
"use client";

import { useUser, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SiteHeader() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          VINTEE
        </Link>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link href="/bookings">
                <Button variant="ghost">내 예약</Button>
              </Link>
              {user.publicMetadata.role === 'HOST' && (
                <Link href="/host/dashboard">
                  <Button variant="ghost">호스트 대시보드</Button>
                </Link>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
                afterSignOutUrl="/"
              />
            </>
          ) : (
            <Link href="/login">
              <Button className="bg-[#00A1E0]">로그인</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

---

### 백엔드

**미들웨어** (`middleware.ts`):
```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/explore',
    '/property/:id',
    '/api/properties',
    '/api/tags',
  ],
  ignoredRoutes: [
    '/api/webhooks/clerk',
  ],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**Clerk Webhook** (`app/api/webhooks/clerk/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  const svix = new Webhook(WEBHOOK_SECRET);
  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  let evt;
  try {
    evt = svix.verify(payload, headers);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, image_url, external_accounts } = evt.data;

    const kakaoAccount = external_accounts.find(
      (acc) => acc.provider === 'oauth_kakao'
    );

    await prisma.user.create({
      data: {
        id,
        email: email_addresses[0].email_address,
        name: first_name || '사용자',
        profileImage: image_url,
        kakaoId: kakaoAccount?.provider_user_id,
        role: 'USER',
      },
    });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, image_url } = evt.data;

    await prisma.user.update({
      where: { id },
      data: {
        email: email_addresses[0].email_address,
        name: first_name,
        profileImage: image_url,
      },
    });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
```

---

### 데이터베이스

**Prisma Schema**:
```prisma
model User {
  id           String    @id // Clerk userId
  email        String    @unique
  name         String
  phone        String?
  profileImage String?
  kakaoId      String?   @unique
  role         UserRole  @default(USER)
  credits      Int       @default(0)
  bookings     Booking[]
  hostProfile  HostProfile?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime? // Soft delete

  @@index([email])
  @@index([kakaoId])
}

enum UserRole {
  USER          // 일반 사용자
  HOST_PENDING  // 호스트 신청 (승인 대기)
  HOST          // 승인된 호스트
  ADMIN         // 관리자
}

model HostProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(...)
  businessNumber  String?  // 사업자 등록번호
  bankAccount     String   // 정산 계좌
  introduction    String   @db.Text
  approvalStatus  HostApprovalStatus @default(PENDING)
  approvedAt      DateTime?
  properties      Property[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum HostApprovalStatus {
  PENDING   // 승인 대기
  APPROVED  // 승인 완료
  REJECTED  // 거부됨
}
```

---

## 테스트 시나리오 (Test Scenarios)

```typescript
// tests/authentication.spec.ts
import { test, expect } from '@playwright/test';

test('사용자가 카카오로 로그인할 수 있다', async ({ page }) => {
  // 1. 홈페이지 접속
  await page.goto('/');

  // 2. 로그인 버튼 클릭
  await page.click('text=로그인');

  // 3. 로그인 페이지로 이동
  await expect(page).toHaveURL('/login');

  // 4. 카카오 로그인 버튼 확인
  await expect(page.locator('button:has-text("카카오로 시작하기")')).toBeVisible();

  // (실제 카카오 OAuth 테스트는 E2E에서 제외, Clerk 테스트 환경 사용)
});

test('보호된 라우트는 로그인 필요', async ({ page }) => {
  // 1. 예약 페이지 접속 (로그인 필요)
  await page.goto('/bookings');

  // 2. 로그인 페이지로 리다이렉트
  await expect(page).toHaveURL(/\/login\?redirect_url=%2Fbookings/);
});
```

---

## 우선순위 (Priority)

**P0 (Critical)**: MVP 필수
- ✅ Clerk 통합
- ✅ 카카오 간편 로그인
- ✅ 이메일/비밀번호 로그인
- ✅ Protected Routes

**P1 (High)**: MVP 완성
- ✅ Webhook (사용자 동기화)
- ✅ 역할 기반 접근 제어

**P2 (Medium)**: Post-MVP
- 🔮 Google 로그인
- 🔮 네이버 로그인
- 🔮 2FA (Two-Factor Authentication)

---

**마지막 업데이트**: 2026-02-10
**작성자**: Claude Sonnet 4.5 with Gagahoho Engineering Team
