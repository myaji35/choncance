# VINTEE 프로덕션 배포 가이드

## 📋 선택하신 작업: 1, 4, 5

### ✅ 1. 프로덕션 데이터베이스 설정 (Supabase)
### ✅ 4. SendGrid 이메일 설정
### ✅ 5. 베타 테스트 준비

---

## 1️⃣ 프로덕션 데이터베이스 설정

### Step 1: Supabase 프로젝트 생성

1. **Supabase 접속**: https://supabase.com/dashboard
2. **New Project 클릭**
3. **프로젝트 정보 입력**:
   ```
   Name: vintee-production
   Database Password: [강력한 비밀번호 생성]
   Region: Northeast Asia (Seoul)
   ```
4. **Create new project** 클릭 (약 2분 소요)

### Step 2: 데이터베이스 연결 정보 복사

프로젝트 생성 완료 후:

1. **Settings** → **Database** 이동
2. **Connection string** 섹션에서 복사:

```bash
# Connection pooling (recommended)
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

# Direct connection
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

3. **Project API keys** 복사:
```bash
Project URL: https://[PROJECT_REF].supabase.co
anon public key: eyJhbGci...
```

### Step 3: 환경변수 업데이트

`.env.production` 파일 생성:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Database (Pooler for production)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct (for migrations)
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### Step 4: 데이터베이스 마이그레이션

```bash
# 1. Prisma 스키마를 프로덕션 DB에 적용
npx prisma migrate deploy

# 2. Prisma Client 재생성
npx prisma generate

# 3. 연결 테스트
npx prisma db push --skip-generate

# 4. 시드 데이터 삽입 (태그 16개)
npx tsx prisma/seed.ts
```

### Step 5: 연결 확인

```bash
# Prisma Studio로 데이터 확인
npx prisma studio
```

---

## 4️⃣ SendGrid 이메일 설정

### Step 1: SendGrid 가입

1. **SendGrid 접속**: https://sendgrid.com/
2. **Start For Free** 클릭
3. **계정 생성**:
   - Email
   - Password
   - 무료 플랜 선택 (100 emails/day)

### Step 2: 이메일 인증

1. 가입 후 이메일 확인
2. 계정 활성화

### Step 3: API 키 생성

1. **Settings** → **API Keys** 이동
2. **Create API Key** 클릭
3. 설정:
   ```
   API Key Name: vintee-production
   API Key Permissions: Full Access
   ```
4. **Create & View** 클릭
5. **API 키 복사** (⚠️ 한 번만 표시됨!)

```
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: 발신자 인증

1. **Settings** → **Sender Authentication**
2. **Single Sender Verification** 선택
3. 정보 입력:
   ```
   From Name: VINTEE
   From Email Address: noreply@vintee.kr (또는 보유 도메인)
   Reply To: support@vintee.kr
   Company Address: [회사 주소]
   ```
4. **Create** 클릭
5. **인증 이메일 확인** (발신자 이메일로 전송됨)

### Step 5: 환경변수 설정

`.env.production`에 추가:

```bash
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@vintee.kr
```

### Step 6: 이메일 테스트

테스트 API 엔드포인트 생성:

```typescript
// src/app/api/test-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { to } = await request.json();
  
  const success = await sendEmail({
    to,
    subject: "VINTEE 이메일 테스트",
    html: "<h1>테스트 성공!</h1><p>이메일이 정상적으로 전송되었습니다.</p>",
  });
  
  return NextResponse.json({ success });
}
```

테스트 실행:

```bash
curl -X POST http://localhost:3010/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

---

## 5️⃣ 베타 테스트 준비

### Step 1: 테스트 환경 체크리스트

```
환경 점검:
- [ ] 프로덕션 DB 연결 확인
- [ ] 이메일 발송 테스트 완료
- [ ] 결제 시스템 (테스트 모드) 동작 확인
- [ ] 챗봇 응답 확인
- [ ] 모바일 반응형 확인
```

### Step 2: 테스트 계정 생성

#### 방법 1: Prisma Studio 사용

```bash
npx prisma studio
```

1. User 테이블 열기
2. "Add record" 클릭
3. 정보 입력:
   - email: `beta-tester-1@test.com`
   - name: `베타 테스터 1`
   - role: `GUEST`

#### 방법 2: SQL 직접 실행

Supabase Dashboard → SQL Editor:

```sql
-- 게스트 테스트 계정 3개
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'guest1@test.com', '게스트1', 'GUEST', NOW(), NOW()),
  (gen_random_uuid(), 'guest2@test.com', '게스트2', 'GUEST', NOW(), NOW()),
  (gen_random_uuid(), 'guest3@test.com', '게스트3', 'GUEST', NOW(), NOW());

-- 호스트 테스트 계정
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'host1@test.com', '호스트1', 'HOST', NOW(), NOW()),
  (gen_random_uuid(), 'host2@test.com', '호스트2', 'HOST', NOW(), NOW());
```

### Step 3: 테스트 시나리오 작성

`BETA_TEST_SCENARIOS.md` 파일 생성:

```markdown
# 베타 테스트 시나리오

## 시나리오 1: 게스트 회원가입 → 예약

1. 회원가입 (이메일 또는 카카오)
2. 메인 페이지에서 테마 선택 (#논뷰맛집)
3. 숙소 필터링 (지역, 가격, 날짜)
4. 숙소 상세 페이지 확인
5. 예약하기 (테스트 카드: 4242 4242 4242 4242)
6. 예약 확정 이메일 수신 확인
7. 마이페이지에서 예약 내역 확인

## 시나리오 2: 호스트 숙소 등록

1. 회원가입
2. 호스트 전환 신청
3. 숙소 등록 (8단계 폼)
4. 대시보드에서 예약 관리
5. 게스트 예약 승인/거부

## 시나리오 3: 챗봇 상담

1. 우측 하단 챗봇 아이콘 클릭
2. "반려동물 동반 가능한 숙소 추천해줘"
3. "전라남도 숙소 알려줘"
4. "가격대는 어떻게 되나요?"
```

### Step 4: 베타 테스터 모집

#### 모집 대상
- MZ세대 (20-35세)
- SNS 활동적인 사용자
- 촌캉스 관심 있는 사람
- 5-10명

#### 피드백 수집 양식 (Google Forms)

질문 항목:
1. 회원가입 과정이 쉬웠나요? (1-5점)
2. 숙소 검색이 편리했나요? (1-5점)
3. 예약 과정이 명확했나요? (1-5점)
4. 가장 마음에 드는 기능은?
5. 개선이 필요한 부분은?
6. 발견한 버그가 있나요?
7. 추가했으면 하는 기능은?

### Step 5: 모니터링 설정

#### Vercel Analytics 활성화

```bash
# package.json에 추가
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Error Tracking (Sentry - 선택사항)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 📊 배포 후 점검

### 1주차: 초기 모니터링

- [ ] 회원가입 성공률
- [ ] 예약 전환율
- [ ] 이메일 발송 성공률
- [ ] 결제 성공률
- [ ] 평균 페이지 로딩 시간

### 2주차: 피드백 수집

- [ ] 베타 테스터 피드백 분석
- [ ] 버그 수정 우선순위 결정
- [ ] UX 개선사항 도출

### 3주차: 개선 및 재테스트

- [ ] 주요 버그 수정
- [ ] UI/UX 개선
- [ ] 재테스트

---

## 🎯 공식 런칭 체크리스트

- [ ] 베타 테스트 완료 (최소 50건 예약)
- [ ] 주요 버그 0건
- [ ] 모바일 UX 최적화
- [ ] 결제 시스템 검증 완료
- [ ] 이메일 발송률 95% 이상
- [ ] 페이지 로딩 속도 3초 이내
- [ ] 보안 점검 완료
- [ ] 개인정보처리방침 작성
- [ ] 이용약관 작성
- [ ] 마케팅 자료 준비

---

## 🚀 다음 단계

### 베타 테스트 기간 (2-4주)
1. 5-10명 초기 테스터 모집
2. 피드백 수집 및 버그 수정
3. UX 개선

### 소프트 런칭 (1개월)
1. 100명 제한 가입
2. 초기 호스트 10-20개 확보
3. 마케팅 시작

### 공식 런칭
1. 가입 제한 해제
2. PR 배포
3. 인플루언서 협업

---

**축하합니다! 🎉**  
VINTEE가 프로덕션 배포를 위한 준비를 완료했습니다!
