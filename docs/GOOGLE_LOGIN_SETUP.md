# Google OAuth 로그인 설정 가이드

ChonCance에서 Google 로그인을 활성화하는 방법입니다.

## 현재 상태

✅ **완료된 작업**:
- Clerk 인증 시스템 통합 (이메일/비밀번호 로그인)
- 한국어 UI 적용 (koKR localization)
- SignInButton 모달 방식 적용 (홈페이지, SiteHeader)
- 인증 상태별 UI 분기 (SignedIn/SignedOut)

⏸️ **대기 중**:
- Google OAuth Provider 설정 (Clerk 대시보드)

---

## 1. Clerk 대시보드에서 Google OAuth 활성화

### 1단계: Clerk 대시보드 접속

1. [Clerk Dashboard](https://dashboard.clerk.com) 로그인
2. 프로젝트 선택: **ChonCance** (또는 현재 프로젝트)

### 2단계: Social Connections 설정

1. 왼쪽 메뉴에서 **User & Authentication** → **Social Connections** 클릭
2. **Google** 찾기
3. Google 옆의 토글 스위치를 **ON**으로 변경

### 3단계: Google OAuth 설정 방식 선택

Clerk는 두 가지 방식을 제공합니다:

#### 옵션 A: Clerk의 공유 OAuth 앱 사용 (추천 - 빠른 테스트)

- **장점**: 별도 설정 없이 즉시 사용 가능
- **단점**: "Sign in with Clerk" 브랜딩이 표시됨
- **권장 용도**: 개발/테스트 환경

1. **"Use Clerk's shared OAuth app"** 선택
2. **Save** 클릭
3. 완료! 바로 테스트 가능

#### 옵션 B: 커스텀 Google OAuth 앱 설정 (프로덕션 권장)

- **장점**: "Sign in with ChonCance" 브랜딩
- **단점**: Google Cloud Console 설정 필요
- **권장 용도**: 프로덕션 환경

설정 방법은 아래 **섹션 2** 참조

---

## 2. 커스텀 Google OAuth 앱 설정 (선택사항)

프로덕션 환경에서는 커스텀 OAuth 앱 설정을 권장합니다.

### 2-1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택

### 2-2. OAuth 동의 화면 구성

1. 왼쪽 메뉴 → **APIs & Services** → **OAuth consent screen**
2. **User Type** 선택:
   - **External**: 모든 Google 계정 사용자
   - **Internal**: Google Workspace 조직 내부만 (해당 없음)
3. **Create** 클릭
4. 앱 정보 입력:
   - **App name**: `ChonCance`
   - **User support email**: `support@choncance.com` (또는 본인 이메일)
   - **App logo**: ChonCance 로고 업로드 (선택)
   - **App domain**:
     - Homepage: `https://choncance.com` (또는 배포된 도메인)
     - Privacy policy: `https://choncance.com/privacy`
     - Terms of service: `https://choncance.com/terms`
   - **Developer contact**: 개발자 이메일
5. **Save and Continue**

### 2-3. Scopes 추가

1. **Add or Remove Scopes** 클릭
2. 다음 스코프 선택:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
3. **Update** → **Save and Continue**

### 2-4. OAuth 2.0 Client ID 생성

1. **Credentials** 메뉴로 이동
2. **+ Create Credentials** → **OAuth 2.0 Client IDs**
3. **Application type**: `Web application`
4. **Name**: `ChonCance Web App`
5. **Authorized redirect URIs** 추가:
   ```
   https://ethical-swift-1.clerk.accounts.dev/v1/oauth_callback
   ```
   **중요**: Clerk 대시보드의 Google 설정 페이지에서 정확한 Redirect URI를 복사하세요!

6. **Create** 클릭
7. **Client ID**와 **Client Secret**을 복사 (다음 단계에서 사용)

### 2-5. Clerk에 Google 자격 증명 등록

1. Clerk 대시보드 → **Social Connections** → **Google**
2. **"Use custom credentials"** 선택
3. 입력:
   - **Client ID**: Google에서 복사한 Client ID
   - **Client Secret**: Google에서 복사한 Client Secret
4. **Save** 클릭

---

## 3. 코드 확인 (이미 완료됨)

ChonCance는 이미 Google 로그인을 지원하도록 구현되어 있습니다:

### 홈페이지 (`src/app/page.tsx`)

```tsx
<SignedOut>
  <SignInButton mode="modal">
    <Button>로그인</Button>
  </SignInButton>
</SignedOut>
```

### SiteHeader (`src/components/layout/site-header.tsx`)

```tsx
<SignedOut>
  <SignInButton mode="modal">
    <Button variant="ghost" size="sm">로그인</Button>
  </SignInButton>
</SignedOut>
```

**`mode="modal"`**: 로그인 버튼 클릭 시 모달이 열리며, Google 로그인 옵션이 자동으로 표시됩니다.

---

## 4. 테스트

### 4-1. 로컬 개발 환경 테스트

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. `http://localhost:3000` 접속

3. **로그인** 버튼 클릭

4. 모달에서 **Continue with Google** 버튼 확인

5. Google 계정으로 로그인 시도

### 4-2. 확인 사항

✅ Google 로그인 버튼이 모달에 표시됨
✅ Google 계정 선택 화면으로 이동
✅ 로그인 후 홈페이지(`/`)로 리다이렉트
✅ 헤더에 "내 예약" 버튼과 프로필 사진 표시

---

## 5. 추가 설정 (선택사항)

### 5-1. 회원가입 시 Google만 허용

Clerk 대시보드 → **User & Authentication** → **Email, Phone, Username**:
- **Email address** 토글을 OFF로 설정하면 Google 로그인만 허용

### 5-2. 프로필 정보 자동 동기화

Google 로그인 시 자동으로 다음 정보가 Clerk에 저장됩니다:
- 이름 (firstName, lastName)
- 이메일
- 프로필 사진

### 5-3. 한국어 UI 확인

`.env.local`에 다음 설정이 있어야 합니다:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

`src/app/layout.tsx`에서 한국어 설정:

```tsx
<ClerkProvider localization={koKR}>
```

---

## 6. 문제 해결

### 문제 1: Google 로그인 버튼이 보이지 않음

**원인**: Clerk 대시보드에서 Google이 활성화되지 않음

**해결**:
1. Clerk Dashboard → Social Connections → Google 확인
2. 토글이 ON인지 확인

### 문제 2: "Redirect URI mismatch" 오류

**원인**: Google Cloud Console의 Redirect URI가 잘못 설정됨

**해결**:
1. Clerk 대시보드에서 정확한 Redirect URI 복사
2. Google Cloud Console → Credentials → OAuth 2.0 Client IDs → Edit
3. Authorized redirect URIs에 정확히 추가

### 문제 3: 로그인 후 홈으로 리다이렉트 안 됨

**원인**: `.env.local`의 `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` 설정 오류

**해결**:
```env
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

---

## 7. 다음 단계

Google 로그인이 정상 작동하면:

1. ✅ 사용자 데이터베이스 동기화 확인
   - Clerk User ID가 `prisma` User 테이블에 저장되는지 확인
   - `src/middleware.ts`에서 신규 사용자 자동 생성 확인

2. ⏸️ 추가 OAuth 제공자 (선택사항):
   - **Kakao Talk** (한국 사용자 대상)
   - **Naver** (한국 사용자 대상)
   - **Apple** (iOS 사용자 대상)

3. ⏸️ 호스트 프로필 등록 플로우:
   - Google 로그인 후 → 호스트 신청 페이지(`/become-a-host`)
   - HostProfile 생성 API 호출

---

## 참고 링크

- [Clerk Google OAuth 공식 가이드](https://clerk.com/docs/authentication/social-connections/google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Clerk Dashboard](https://dashboard.clerk.com)

---

**작성일**: 2025-10-28
**작성자**: Claude Code (Sonnet 4.5)
