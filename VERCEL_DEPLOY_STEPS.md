# Vercel 배포 단계별 가이드

## 현재 상황
`https://choncance.vercel.com/` 에서 `DEPLOYMENT_NOT_FOUND` 에러 발생
→ Vercel 프로젝트가 생성되지 않았습니다.

## 해결 방법: Vercel에서 새 프로젝트 생성

### 1단계: Vercel 대시보드 접속
https://vercel.com/new

### 2단계: GitHub 저장소 Import
1. **"Import Git Repository"** 선택
2. **"myaji35/choncance"** 저장소 검색 및 선택
3. **"Import"** 클릭

### 3단계: 프로젝트 설정
- **Project Name**: `choncance` (그대로 유지)
- **Framework Preset**: Next.js (자동 감지됨)
- **Root Directory**: `./` (변경 안 함)
- **Build Command**: `prisma generate && next build` (자동으로 package.json에서 읽음)
- **Output Directory**: `.next` (자동 설정)

### 4단계: 환경 변수 추가 (중요!)
**"Environment Variables"** 섹션에서 다음을 추가:

```bash
DATABASE_URL
postgresql://neondb_owner:npg_d9OoK2qQlTXH@ep-proud-fog-a100b0a9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
pk_test_ZXRoaWNhbC1zd2lmdC0xLmNsZXJrLmFjY291bnRzLmRldiQ

CLERK_SECRET_KEY
sk_test_QGq3SR7xnY2fjnzeZhVVhUqOovPKfPgzYurXtJqfNV

NEXT_PUBLIC_CLERK_SIGN_IN_URL
/login

NEXT_PUBLIC_CLERK_SIGN_UP_URL
/signup

NEXTAUTH_URL
https://choncance.vercel.app

NEXTAUTH_SECRET
your-nextauth-secret-key-change-this-in-production

KAKAO_CLIENT_ID
83022bf07d136c31285491b85c6ee6aa

KAKAO_CLIENT_SECRET
A0PIZLG3vhO9CmS5J1hsgu9T0LhRnWSS
```

**각 변수를 하나씩 추가:**
- Name: 변수명 입력
- Value: 값 입력
- Environment: Production, Preview, Development 모두 체크

### 5단계: Deploy
**"Deploy"** 버튼 클릭

### 6단계: 배포 완료 대기 (2-3분)
- 빌드 로그를 확인하며 대기
- 에러가 있으면 로그에서 확인 가능

### 7단계: 도메인 확인
배포 완료 후 다음 URL로 접속:
- https://choncance.vercel.app
- https://choncance-git-main-[your-username].vercel.app
- https://choncance-[hash].vercel.app

## CLI 배포 (대안)

```bash
# 1. Vercel 로그인
vercel login

# 2. 프로젝트 연결 및 배포
vercel

# 3. 프로덕션 배포
vercel --prod
```

## 주의사항

1. **DATABASE_URL**: 반드시 설정해야 함 (Prisma 필요)
2. **Clerk Keys**: 인증에 필수
3. **Build Command**: `prisma generate && next build` (이미 package.json에 설정됨)
4. **Node.js Version**: 18.17.0 이상 (package.json에 설정됨)

## 배포 후 테스트

```bash
# API 테스트
curl https://choncance.vercel.app/api/tags
curl https://choncance.vercel.app/api/properties

# 페이지 테스트
https://choncance.vercel.app/
https://choncance.vercel.app/explore
https://choncance.vercel.app/property/1
```

## 트러블슈팅

### 빌드 실패 시
1. Vercel 대시보드 > Deployments > 실패한 배포 클릭
2. Build Logs 확인
3. 에러 메시지 기반으로 수정

### 환경 변수 누락 시
1. Settings > Environment Variables
2. 누락된 변수 추가
3. Deployments > Redeploy

### API 404 에러 시
- `src/middleware.ts`에서 public 라우트 확인
- 현재 설정: `/api/properties`, `/api/tags`, `/api/availability`, `/api/filters`는 public
