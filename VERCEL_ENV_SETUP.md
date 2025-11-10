# Vercel 환경 변수 설정 가이드

## 배포 전 필수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정해야 합니다:

### 1. 데이터베이스 (필수)

```bash
DATABASE_URL
```
**값**: `postgresql://neondb_owner:npg_d9OoK2qQlTXH@ep-proud-fog-a100b0a9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

**환경**: Production, Preview, Development (모두 체크)

---

### 2. Clerk Authentication (필수)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```
**값**: `pk_test_ZXRoaWNhbC1zd2lmdC0xLmNsZXJrLmFjY291bnRzLmRldiQ`
**환경**: Production, Preview, Development

```bash
CLERK_SECRET_KEY
```
**값**: `sk_test_QGq3SR7xnY2fjnzeZhVVhUqOovPKfPgzYurXtJqfNV`
**환경**: Production, Preview, Development

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL
```
**값**: `/login`
**환경**: Production, Preview, Development

```bash
NEXT_PUBLIC_CLERK_SIGN_UP_URL
```
**값**: `/signup`
**환경**: Production, Preview, Development

---

### 3. Toss Payments (필수)

⚠️ **주의**: 프로덕션 배포 시 **실제 프로덕션 키**로 변경해야 합니다!

```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY
```
**개발/테스트 값**: `test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq`
**프로덕션 값**: Toss Payments 대시보드에서 발급받은 실제 키
**환경**: Production, Preview, Development

```bash
TOSS_SECRET_KEY
```
**개발/테스트 값**: `test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R`
**프로덕션 값**: Toss Payments 대시보드에서 발급받은 실제 시크릿 키
**환경**: Production, Preview, Development

---

### 4. API URL (필수)

```bash
NEXT_PUBLIC_API_URL
```
**프로덕션 값**: Vercel 배포 후 자동 할당되는 URL (예: `https://your-app.vercel.app`)
**Preview 값**: 빈값 (자동으로 preview URL 사용)
**Development 값**: `http://localhost:3010`

**환경**: 각각 다르게 설정
- Production: `https://choncance.vercel.app` (배포 후 실제 URL로 업데이트)
- Preview: 비워두기
- Development: `http://localhost:3010`

---

### 5. Google Gemini AI (선택)

```bash
GEMINI_API_KEY
```
**값**: `AIzaSyCVE2Y-APnkuH5a4vvkW6LMuxv8HtifiV0`
**환경**: Production, Preview, Development

---

### 6. Kakao OAuth (선택 - 소셜 로그인용)

```bash
KAKAO_CLIENT_ID
```
**값**: `83022bf07d136c31285491b85c6ee6aa`
**환경**: Production, Preview, Development

```bash
KAKAO_CLIENT_SECRET
```
**값**: `A0PIZLG3vhO9CmS5J1hsgu9T0LhRnWSS`
**환경**: Production, Preview, Development

---

### 7. Kakao AlimTalk (선택)

```bash
KAKAO_ALIMTALK_ENABLED
```
**값**: `false` (프로덕션에서 활성화하려면 `true`)
**환경**: Production, Preview, Development

---

### 8. NextAuth (선택 - 현재 Clerk 사용 중)

```bash
NEXTAUTH_URL
```
**프로덕션 값**: `https://choncance.vercel.app` (배포 후 실제 URL)
**환경**: Production만

```bash
NEXTAUTH_SECRET
```
**값**: 랜덤 시크릿 키 (생성 방법: `openssl rand -base64 32`)
**환경**: Production만

---

## 설정 방법

### Option 1: Vercel Dashboard (권장)

1. https://vercel.com/myaji35s-projects/choncance 접속
2. **Settings** → **Environment Variables** 이동
3. 위의 환경 변수들을 하나씩 추가:
   - **Key**: 변수 이름 입력
   - **Value**: 변수 값 입력
   - **Environment**: Production, Preview, Development 선택
4. **Save** 클릭

### Option 2: Vercel CLI

```bash
# 각 환경 변수를 하나씩 추가
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# ... (나머지도 동일하게 추가)
```

---

## 환경 변수 설정 후 배포 명령어

```bash
# 환경 변수 설정 완료 후
vercel --prod --yes

# 또는 자동 배포 (GitHub push 시)
git push origin main
```

---

## 프로덕션 배포 전 체크리스트

- [ ] DATABASE_URL 설정 완료
- [ ] Clerk 환경 변수 4개 설정 완료
- [ ] Toss Payments 환경 변수 2개 설정 완료 (⚠️ 프로덕션 키 확인!)
- [ ] NEXT_PUBLIC_API_URL 설정 완료
- [ ] Gemini API 키 설정 (선택)
- [ ] Kakao OAuth 설정 (선택)
- [ ] 데이터베이스 마이그레이션 준비
- [ ] Git push 완료

---

## 배포 후 작업

### 1. 데이터베이스 마이그레이션

```bash
# Vercel 배포 URL 확인 후
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

### 2. Seed 데이터 생성

```bash
# 태그, 카테고리 등 초기 데이터
DATABASE_URL="your-production-db-url" npm run seed
```

### 3. NEXT_PUBLIC_API_URL 업데이트

배포 완료 후 실제 Vercel URL로 업데이트:
- Vercel Dashboard → Settings → Environment Variables
- `NEXT_PUBLIC_API_URL` 값을 `https://your-actual-url.vercel.app`으로 변경
- **Redeploy** 클릭

---

## 트러블슈팅

### "Environment Variable references Secret which does not exist"

→ Vercel Dashboard에서 해당 환경 변수를 직접 추가해야 합니다.

### 배포 후 데이터베이스 연결 오류

→ DATABASE_URL이 올바르게 설정되었는지 확인
→ Neon DB에서 외부 연결 허용 확인

### Clerk 로그인 오류

→ Clerk Dashboard에서 Vercel 도메인을 Allowed Origins에 추가
→ `https://your-app.vercel.app` 추가

### Toss Payments 테스트 모드

→ 프로덕션에서는 반드시 실제 프로덕션 키로 변경!
→ 테스트 키는 실제 결제가 불가능합니다.

---

**마지막 업데이트**: 2025-11-10
