# 인증 시스템 (Authentication)

ChonCance는 **Clerk**를 사용하여 안전하고 편리한 사용자 인증을 제공합니다.

## 📋 목차

- [Clerk란?](#clerk란)
- [설정 방법](#설정-방법)
- [주요 기능](#주요-기능)
- [사용 방법](#사용-방법)
- [배포 설정](#배포-설정)
- [커스터마이징](#커스터마이징)
- [문제 해결](#문제-해결)

## Clerk란?

Clerk는 현대적인 웹 애플리케이션을 위한 완전한 사용자 관리 및 인증 솔루션입니다.

### 왜 Clerk를 선택했나요?

- ✅ **보안**: 업계 표준 보안 프로토콜
- ✅ **간편함**: 몇 줄의 코드로 완전한 인증 시스템 구현
- ✅ **기능**: 이메일 인증, 소셜 로그인, 2FA 등 모든 기능 제공
- ✅ **UI/UX**: 아름답고 커스터마이징 가능한 UI 컴포넌트
- ✅ **국제화**: 한국어 포함 다국어 지원
- ✅ **무료 티어**: 개발 및 소규모 프로젝트에 충분

## 설정 방법

### 1. Clerk 계정 생성

1. https://dashboard.clerk.com 방문
2. 계정 생성 또는 로그인
3. "Add Application" 클릭
4. Application 이름 입력 (예: ChonCance)

### 2. API 키 받기

Clerk 대시보드에서:
1. 좌측 메뉴 → API Keys
2. Publishable key와 Secret key 복사

### 3. 환경 변수 설정

`.env.local` 파일에 추가:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
CLERK_SECRET_KEY=sk_test_your-key-here

# Clerk Routes (optional)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 4. 개발 서버 재시작

```bash
npm run dev
```

## 주요 기능

### 1. 이메일/비밀번호 인증
- 이메일 인증 자동 발송
- 강력한 비밀번호 정책
- 비밀번호 재설정 (이메일 링크)

### 2. 소셜 로그인
Clerk 대시보드에서 활성화 가능:
- Google
- GitHub
- 카카오
- 네이버
- 페이스북
- 애플 (Sign in with Apple)

### 3. 프로필 관리
- 프로필 사진 업로드
- 이름, 이메일 변경
- 비밀번호 변경
- 계정 삭제

### 4. 보안 기능
- 이메일 인증
- 다단계 인증 (2FA)
- SMS 인증
- 세션 관리
- Remember Me

## 사용 방법

### 로그인 페이지

`src/app/login/page.tsx`:

```typescript
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  );
}
```

### 회원가입 페이지

`src/app/signup/page.tsx`:

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  );
}
```

### 프로필 페이지

`src/app/profile/page.tsx`:

```typescript
import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <UserProfile />
    </div>
  );
}
```

### 보호된 라우트

`src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/explore(.*)',
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});
```

### 사용자 정보 가져오기

Server Component:

```typescript
import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return <div>로그인이 필요합니다</div>;
  }

  return <div>안녕하세요, {user.firstName}님!</div>;
}
```

Client Component:

```typescript
'use client';
import { useUser } from '@clerk/nextjs';

export default function UserInfo() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>로딩 중...</div>;
  if (!user) return <div>로그인이 필요합니다</div>;

  return <div>안녕하세요, {user.firstName}님!</div>;
}
```

## 배포 설정

### Netlify

1. Netlify 대시보드 → Site settings → Environment variables
2. 환경 변수 추가:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Clerk 설정

1. Clerk 대시보드 → Settings → Domains
2. Allowed redirect URLs 추가:
   - Production: `https://choncance.netlify.app/*`
   - Development: `http://localhost:3000/*`

## 커스터마이징

### 테마 변경

```typescript
<SignIn
  appearance={{
    elements: {
      rootBox: "w-full max-w-md",
      card: "shadow-lg border border-gray-200",
      headerTitle: "text-2xl font-bold",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
    }
  }}
/>
```

### 한국어 설정

`src/app/layout.tsx`:

```typescript
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

### 리다이렉트 URL 커스터마이징

`.env.local`:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/welcome
```

## 문제 해결

### "Clerk: Missing publishableKey" 오류

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. `.env.local` 파일에 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 추가
2. 개발 서버 재시작 (`npm run dev`)

### 소셜 로그인이 작동하지 않음

**원인**: Clerk 대시보드에서 활성화되지 않음

**해결**:
1. Clerk 대시보드 → User & Authentication → Social Connections
2. 원하는 소셜 로그인 제공자 활성화
3. 각 제공자의 Client ID/Secret 설정

### 배포 후 리다이렉트 에러

**원인**: Allowed redirect URLs에 프로덕션 URL이 없음

**해결**:
1. Clerk 대시보드 → Settings → Domains
2. Allowed redirect URLs에 프로덕션 URL 추가
3. 예: `https://choncance.netlify.app/*`

### 한국어가 표시되지 않음

**원인**: 로컬라이제이션이 설정되지 않음

**해결**:
```typescript
import { koKR } from '@clerk/localizations';

<ClerkProvider localization={koKR}>
```

## 추가 리소스

- [Clerk 공식 문서](https://clerk.com/docs)
- [Next.js 통합 가이드](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Discord 커뮤니티](https://clerk.com/discord)
- [API Reference](https://clerk.com/docs/reference/clerk-react)

---

문의사항이 있으시면 프로젝트 이슈를 생성해주세요.
