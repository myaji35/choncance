# Vercel 배포 가이드

## 1. Vercel 프로젝트 설정

### 1.1 프로젝트 연결
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "Add New Project" 클릭
3. GitHub 리포지토리 선택 및 Import

### 1.2 빌드 설정
- **Framework Preset**: Next.js
- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next` (자동 설정됨)
- **Install Command**: `npm install`

## 2. 환경 변수 설정

Vercel 대시보드의 프로젝트 > Settings > Environment Variables에서 다음 환경 변수를 설정하세요:

### 2.1 필수 환경 변수

```bash
# Database (GCP PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_YOUR_KEY"
CLERK_SECRET_KEY="sk_live_YOUR_KEY"

# Toss Payments (Production)
NEXT_PUBLIC_TOSS_CLIENT_KEY="live_ck_YOUR_KEY"
TOSS_SECRET_KEY="live_sk_YOUR_KEY"

# Google Gemini AI
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Admin Authentication
ADMIN_PASSWORD_HASH="$2b$10$/2LriKXhyrDcDzRgC9TzeOmB5X2tY4AIUBvIeW4tH0eenTOcWVOte"
JWT_SECRET="your-production-secret-key-change-this"
```

### 2.2 선택 환경 변수

```bash
# Supabase (사용하는 경우)
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"

# OpenAI (AI 챗봇 사용 시)
OPENAI_API_KEY="sk-YOUR_OPENAI_KEY"

# Kakao AlimTalk (알림톡 사용 시)
KAKAO_ALIMTALK_ENABLED="true"
KAKAO_ALIMTALK_API_KEY="YOUR_KAKAO_REST_API_KEY"
KAKAO_ALIMTALK_SENDER_KEY="YOUR_SENDER_KEY"

# API URL (자동 설정되나 필요시 수동 설정)
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app"
```

## 3. GCP PostgreSQL 연결 설정

### 3.1 Cloud SQL 인스턴스 준비
1. [GCP Console](https://console.cloud.google.com/) > SQL로 이동
2. PostgreSQL 인스턴스 생성 또는 기존 인스턴스 사용
3. 데이터베이스 생성: `vintee`

### 3.2 연결 설정
1. **Public IP 사용 (권장하지 않음, 개발용)**:
   - SQL 인스턴스 > Connections > Public IP
   - Authorized networks에 `0.0.0.0/0` 추가 (모든 IP 허용)

2. **Cloud SQL Proxy 사용 (권장)**:
   - Vercel에서는 직접 사용 불가
   - 대신 Connection Pooler (PgBouncer) 사용

3. **권장: Supabase Connection Pooler**:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:6543/DATABASE?pgbouncer=true&connection_limit=1
   DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
   ```

### 3.3 DATABASE_URL 형식
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?[OPTIONS]
```

예시:
```
DATABASE_URL="postgresql://postgres:mypassword@34.64.123.456:5432/vintee?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:mypassword@34.64.123.456:5432/vintee"
```

## 4. 데이터베이스 마이그레이션

### 4.1 로컬에서 프로덕션 DB로 마이그레이션
```bash
# 1. .env 파일에 프로덕션 DATABASE_URL 설정
DATABASE_URL="postgresql://USER:PASSWORD@GCP_HOST:5432/vintee"
DIRECT_URL="postgresql://USER:PASSWORD@GCP_HOST:5432/vintee"

# 2. 마이그레이션 실행
npx prisma migrate deploy

# 3. 시드 데이터 입력
npm run seed
npm run seed:properties
```

### 4.2 Vercel에서 자동 마이그레이션 (선택사항)
`package.json`의 build script를 수정:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## 5. 배포 확인 체크리스트

- [ ] Vercel 프로젝트 생성 및 GitHub 연결
- [ ] 모든 필수 환경 변수 설정
- [ ] DATABASE_URL과 DIRECT_URL 설정
- [ ] Clerk Production 키 발급 및 설정
- [ ] Toss Payments Production 키 발급 및 설정
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 시드 데이터 입력 완료
- [ ] 첫 배포 성공
- [ ] 웹사이트 접속 테스트
- [ ] 로그인/회원가입 테스트
- [ ] 숙소 조회 테스트
- [ ] 예약 기능 테스트

## 6. 배포 후 설정

### 6.1 도메인 연결 (선택사항)
1. Vercel Dashboard > 프로젝트 > Settings > Domains
2. 커스텀 도메인 추가
3. DNS 설정 업데이트

### 6.2 Clerk Redirect URLs 업데이트
Clerk Dashboard에서 다음 URL들을 추가:
- Sign-in URL: `https://your-domain.vercel.app/auth/login`
- Sign-up URL: `https://your-domain.vercel.app/auth/signup`
- After sign-in: `https://your-domain.vercel.app/`
- After sign-out: `https://your-domain.vercel.app/`

### 6.3 Toss Payments 도메인 등록
Toss Payments 개발자센터에서 프로덕션 도메인 등록:
- `https://your-domain.vercel.app`

## 7. 트러블슈팅

### 빌드 실패
- Prisma generate 오류: `DATABASE_URL`과 `DIRECT_URL` 확인
- TypeScript 오류: `npm run build` 로컬에서 먼저 테스트

### 데이터베이스 연결 실패
- GCP SQL 인스턴스 Public IP 확인
- Authorized networks 설정 확인
- 사용자 계정 및 비밀번호 확인
- Connection limit 설정 확인 (`connection_limit=1`)

### 배포 후 500 에러
- Vercel 대시보드 > Deployments > Logs 확인
- 환경 변수 누락 확인
- 데이터베이스 연결 확인

## 8. 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [GCP Cloud SQL](https://cloud.google.com/sql/docs)
- [Clerk with Vercel](https://clerk.com/docs/deployments/deploy-to-vercel)
