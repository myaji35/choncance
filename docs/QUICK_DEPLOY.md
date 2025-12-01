# VINTEE 빠른 배포 가이드 (5분 완성)

## 현재 상황
- ✅ GCP Cloud SQL 인스턴스: `postgresql-479201`
- ✅ Vercel 프로젝트: 생성됨
- ✅ 로컬 빌드: 성공

## 5분 배포 체크리스트

### 1️⃣ GCP Cloud SQL 준비 (1분)

**GCP Console에서 확인할 정보:**
1. [GCP SQL Console](https://console.cloud.google.com/sql/instances) 접속
2. `postgresql-479201` 클릭
3. 다음 정보 복사:
   - ✏️ **공개 IP**: `______________________`
   - ✏️ **사용자명**: `postgres` (또는 `______`)
   - ✏️ **비밀번호**: `______________________`
   - ✏️ **DB 이름**: `vintee` (또는 `______`)

4. **연결 설정 확인**:
   - [ ] 연결 > 네트워킹 > 공개 IP 활성화
   - [ ] 승인된 네트워크에 `0.0.0.0/0` 추가 (또는 Vercel IP)

### 2️⃣ DATABASE_URL 생성 (30초)

위에서 확인한 정보로 URL 생성:

```bash
# 형식
postgresql://[사용자명]:[비밀번호]@[공개IP]:5432/[DB이름]

# 예시
postgresql://postgres:mypassword@34.64.123.456:5432/vintee
```

**생성한 URL:**
```
DATABASE_URL="postgresql://______:______@______:5432/______?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://______:______@______:5432/______"
```

### 3️⃣ Vercel 환경 변수 설정 (2분)

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. VINTEE 프로젝트 선택
3. **Settings > Environment Variables** 클릭
4. 아래 환경 변수를 **Production과 Preview** 환경에 추가:

#### 필수 환경 변수 (복사해서 붙여넣기)

```bash
# Database
DATABASE_URL=postgresql://USER:PASS@IP:5432/DB?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://USER:PASS@IP:5432/DB

# Clerk (개발용 - 나중에 프로덕션 키로 변경)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d29uZHJvdXMtc3BvbmdlLTIwLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_bdfLUP32iwMl8zL2oAPgmJvXCqKeZpz8X4Yey8zUla

# Toss Payments (테스트용)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R

# Gemini AI
GEMINI_API_KEY=AIzaSyDMtwOnB77EYK9d_eaETnSSpC25Eiu7wa0

# Admin
ADMIN_PASSWORD_HASH=$2b$10$/2LriKXhyrDcDzRgC9TzeOmB5X2tY4AIUBvIeW4tH0eenTOcWVOte
JWT_SECRET=CHANGE_THIS_STRONG_RANDOM_STRING_123456789
```

### 4️⃣ 데이터베이스 마이그레이션 (1분)

**로컬 터미널에서 실행:**

```bash
# 1. .env.local에 GCP DB URL 설정
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://USER:PASS@IP:5432/vintee"
DIRECT_URL="postgresql://USER:PASS@IP:5432/vintee"
EOF

# 2. 마이그레이션 실행
npx prisma migrate deploy

# 3. 시드 데이터 입력
npm run seed
npm run seed:properties
```

### 5️⃣ 배포! (30초)

```bash
# Git에 커밋 & 푸시
git add .
git commit -m "feat: Vercel 배포 준비 완료"
git push origin main
```

Vercel이 자동으로 빌드하고 배포합니다!

### 6️⃣ 배포 확인 (30초)

1. [Vercel Dashboard](https://vercel.com/dashboard) > Deployments
2. 최근 배포 클릭 > **Visit** 클릭
3. 사이트 확인:
   - [ ] 홈페이지 로딩
   - [ ] `/explore` 숙소 목록 표시
   - [ ] 로그인 가능

---

## 🎉 배포 완료!

배포된 URL: `https://your-project.vercel.app`

## 다음 단계 (선택사항)

### 프로덕션 키 발급

#### Clerk (인증)
1. [Clerk Dashboard](https://dashboard.clerk.com/) > API Keys
2. Production 키 복사
3. Vercel 환경 변수 업데이트

#### Toss Payments (결제)
1. [Toss Payments](https://developers.tosspayments.com/) > 내 앱 > 라이브 키
2. 키 발급 (심사 필요할 수 있음)
3. Vercel 환경 변수 업데이트

### 커스텀 도메인 설정
1. Vercel > Settings > Domains
2. 도메인 추가 (예: `vintee.co.kr`)
3. DNS 설정

---

## 트러블슈팅

### ❌ 빌드 실패

**확인사항:**
1. Vercel 환경 변수에 `DATABASE_URL`과 `DIRECT_URL` 설정됨?
2. GCP SQL 공개 IP 활성화됨?
3. 로컬에서 `npm run build` 성공?

**해결:**
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인 후 Vercel 환경 변수 재확인
```

### ❌ 500 에러 (Database connection failed)

**확인사항:**
1. GCP SQL > 연결 > 네트워킹 > 공개 IP 활성화
2. 승인된 네트워크 설정
3. DATABASE_URL 형식 정확?

**해결:**
```bash
# 로컬에서 연결 테스트
npx prisma db push

# 성공하면 Vercel 환경 변수의 DATABASE_URL 재확인
```

### ❌ 빈 데이터 (숙소 목록이 안 보임)

**해결:**
```bash
# 시드 데이터 다시 입력
npm run seed
npm run seed:properties
```

---

## 도움말

- 📖 [상세 배포 가이드](./DEPLOY_STEPS.md)
- 📖 [Vercel 배포 설정](./VERCEL_DEPLOYMENT.md)
- 🔧 [환경 변수 템플릿](../.env.production.example)
- 🤖 [자동 설정 스크립트](../scripts/setup-vercel-env.sh)

---

## 체크리스트 요약

배포 전:
- [ ] GCP Cloud SQL 공개 IP 확인
- [ ] GCP 승인된 네트워크 설정
- [ ] DATABASE_URL 생성

Vercel:
- [ ] 환경 변수 8개 설정
- [ ] Production + Preview 환경 모두 설정

로컬:
- [ ] 마이그레이션 실행 (`npx prisma migrate deploy`)
- [ ] 시드 데이터 입력 (`npm run seed`)

배포:
- [ ] Git push
- [ ] Vercel 빌드 성공 확인
- [ ] 사이트 접속 확인

완료! 🚀
