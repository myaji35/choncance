# Vercel 배포 설정 가이드

## 필수 환경 변수

Vercel 대시보드에서 다음 환경 변수들을 설정해야 합니다:

### 1. Database (필수)
```
DATABASE_URL=postgresql://neondb_owner:npg_d9OoK2qQlTXH@ep-proud-fog-a100b0a9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Clerk Authentication (필수)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXRoaWNhbC1zd2lmdC0xLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_QGq3SR7xnY2fjnzeZhVVhUqOovPKfPgzYurXtJqfNV
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
```

### 3. NextAuth (선택사항 - 현재 Clerk 사용 중)
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
```

### 4. Kakao OAuth (선택사항)
```
KAKAO_CLIENT_ID=83022bf07d136c31285491b85c6ee6aa
KAKAO_CLIENT_SECRET=A0PIZLG3vhO9CmS5J1hsgu9T0LhRnWSS
```

### 5. API URL (선택사항)
```
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

## 배포 단계

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - choncance 프로젝트 선택

3. **Settings > Environment Variables**
   - 위의 환경 변수들을 모두 추가
   - Production, Preview, Development 환경 모두 체크

4. **Redeploy**
   - Deployments 탭으로 이동
   - 최신 배포의 ... 메뉴 클릭
   - "Redeploy" 선택

## 주의사항

- **DATABASE_URL**: Neon PostgreSQL 연결 문자열
- **Clerk Keys**: 현재 테스트 키 사용 중, 프로덕션에서는 프로덕션 키로 변경 필요
- **NEXTAUTH_SECRET**: 프로덕션에서는 안전한 랜덤 문자열로 변경 필요

## 트러블슈팅

### API 라우트 404 에러
- middleware.ts에서 public 라우트 설정 확인
- 현재 `/api/properties`, `/api/tags`, `/api/availability`, `/api/filters`는 public 접근 가능

### 빌드 에러
- `prisma generate`가 빌드 전에 실행되는지 확인
- package.json의 build 스크립트: `"build": "prisma generate && next build"`

### 데이터베이스 연결 에러
- DATABASE_URL 환경 변수가 올바르게 설정되었는지 확인
- Neon 데이터베이스가 활성 상태인지 확인
