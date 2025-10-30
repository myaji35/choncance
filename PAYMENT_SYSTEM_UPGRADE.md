# 결제 시스템 강화 완료

**작성일**: 2025-01-30
**목표**: 프로덕션 레벨의 결제 시스템 구축

---

## 📋 구현된 기능

### 1. 결제 내역 조회 페이지 ✅
- **경로**: `/payments`
- **기능**:
  - 사용자의 모든 결제 내역 조회
  - 결제 상태별 배지 (완료, 취소, 환불, 실패)
  - 결제 방법 표시 (카드, 가상계좌, 계좌이체 등)
  - 거래 내역 표시 (결제, 환불, 취소)
  - 예약 상세보기 링크
  - 영수증 다운로드 버튼

### 2. 환불 요청 기능 ✅
- **API**: `POST /api/payments/[id]/refund`
- **컴포넌트**: `RefundDialog`
- **기능**:
  - 환불 사유 입력
  - 토스 페이먼츠 환불 API 연동
  - 전액/부분 환불 지원
  - 데이터베이스 트랜잭션 처리
  - 예약 상태 자동 업데이트
  - 환불 정책 안내

### 3. 영수증 생성 ✅
- **API**: `GET /api/payments/[id]/receipt`
- **기능**:
  - 결제 정보 조회
  - 예약 정보 포함
  - 숙소 및 호스트 정보
  - 거래 내역 포함
  - PDF 생성 준비 완료 (프론트엔드 구현 필요)

### 4. 이메일 알림 시스템 ✅
- **유틸리티**: `src/lib/email/send-email.ts`
- **템플릿**: `src/lib/email/templates.ts`
- **지원 서비스**:
  - SendGrid (권장)
  - Resend (최신 대안)
  - Nodemailer (SMTP)
- **이메일 템플릿**:
  - 예약 확정 이메일
  - 환불 완료 이메일
  - 결제 실패 이메일

---

## 🔐 프로덕션 환경 설정

### 1. 토스 페이먼츠 프로덕션 키 전환

**현재 (테스트 키)**:
```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R
```

**프로덕션 설정**:
1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)에 로그인
2. 실제 사업자 정보로 가맹점 등록
3. 프로덕션 키 발급
4. 환경 변수 업데이트:

```env
# .env.production
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_YOUR_PRODUCTION_CLIENT_KEY
TOSS_SECRET_KEY=live_sk_YOUR_PRODUCTION_SECRET_KEY
```

5. Google Cloud Run 환경 변수 업데이트:
```bash
gcloud run services update choncance \
  --set-env-vars="NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_YOUR_KEY" \
  --set-env-vars="TOSS_SECRET_KEY=live_sk_YOUR_KEY" \
  --region=asia-northeast3
```

### 2. 이메일 서비스 설정

#### Option A: SendGrid (권장)

**설치**:
```bash
npm install @sendgrid/mail
```

**환경 변수**:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@choncance.com
```

**SendGrid 설정**:
1. [SendGrid](https://sendgrid.com/) 회원가입
2. API Key 생성
3. Sender Identity 인증 (이메일 또는 도메인)
4. 무료 플랜: 100통/일

#### Option B: Resend (최신 대안)

**설치**:
```bash
npm install resend
```

**환경 변수**:
```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=ChonCance <noreply@choncance.com>
```

**Resend 설정**:
1. [Resend](https://resend.com/) 회원가입
2. API Key 생성
3. 도메인 인증
4. 무료 플랜: 100통/일

#### Option C: Nodemailer (SMTP)

**설치**:
```bash
npm install nodemailer
```

**환경 변수**:
```env
EMAIL_SERVICE=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@choncance.com
```

### 3. 환경 변수 전체 목록

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_...
TOSS_SECRET_KEY=live_sk_...

# Email
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG....
EMAIL_FROM=noreply@choncance.com

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://choncance.com
```

---

## 📝 사용 방법

### 결제 내역 조회

```typescript
// 사용자가 /payments 페이지 방문
// 자동으로 모든 결제 내역 표시
```

### 환불 요청

```typescript
// 컴포넌트에서 사용
import { RefundDialog } from "@/components/payments/refund-dialog";

<RefundDialog
  paymentId="payment_id"
  amount={100000}
  trigger={<Button>환불 요청</Button>}
/>
```

### 영수증 조회

```typescript
// API 호출
const response = await fetch(`/api/payments/${paymentId}/receipt`);
const receipt = await response.json();

// receipt 데이터로 PDF 생성 또는 화면 표시
```

### 이메일 발송

```typescript
import { sendEmail } from "@/lib/email/send-email";
import { getBookingConfirmationEmail } from "@/lib/email/templates";

// 예약 확정 이메일
const email = getBookingConfirmationEmail({
  customerName: "홍길동",
  propertyName: "한옥 스테이",
  checkIn: new Date(),
  checkOut: new Date(),
  guests: 2,
  totalAmount: 150000,
  bookingId: "booking_123",
});

await sendEmail({
  to: "customer@example.com",
  ...email,
});
```

---

## 🚀 배포 체크리스트

### 프로덕션 배포 전 확인사항

- [ ] 토스 페이먼츠 프로덕션 키 발급 및 설정
- [ ] 이메일 서비스 선택 및 설정 (SendGrid 권장)
- [ ] 이메일 도메인 인증
- [ ] 환경 변수 모두 설정
- [ ] 환불 정책 최종 확인
- [ ] 결제 테스트 (소액 실제 결제)
- [ ] 이메일 템플릿 테스트
- [ ] 영수증 PDF 생성 구현 (선택사항)

### 테스트 항목

1. **결제 플로우**
   - [ ] 예약 생성 → 결제 → 예약 확정
   - [ ] 결제 실패 시 에러 처리
   - [ ] 예약 확정 이메일 수신

2. **환불 플로우**
   - [ ] 환불 요청 → 토스 API 호출 → 환불 완료
   - [ ] 예약 상태 변경 (취소)
   - [ ] 환불 완료 이메일 수신

3. **결제 내역**
   - [ ] 모든 결제 내역 조회
   - [ ] 상태별 필터링
   - [ ] 영수증 다운로드

---

## 💰 비용 예상

### 무료 플랜으로 시작 가능

- **토스 페이먼츠**: 거래당 2.9% + VAT (무료 가입)
- **SendGrid**: 100통/일 무료 (또는 $19.95/월 - 40,000통)
- **Resend**: 100통/일 무료 (또는 $20/월 - 50,000통)

### 예상 월 비용 (100 예약 기준)

- 토스 페이먼츠 수수료: 거래액의 ~3%
- 이메일 비용: 무료 (100통/일 이내)
- **총 비용**: 거래 수수료만 발생

---

## 🔄 다음 단계 (선택사항)

### 고급 기능

1. **영수증 PDF 생성**
   - 라이브러리: `puppeteer` 또는 `pdfkit`
   - HTML을 PDF로 변환
   - 자동 다운로드 또는 이메일 첨부

2. **정기 결제**
   - 월간 구독 모델
   - 토스 페이먼츠 Billing Key API 사용

3. **결제 분석 대시보드**
   - 일별/월별 매출 통계
   - 환불율 분석
   - 인기 결제 수단 통계

4. **알림 센터**
   - 결제 완료 알림
   - 환불 처리 알림
   - 푸시 알림 통합

---

## 📞 지원

문제가 발생하면:
1. 토스 페이먼츠 고객센터: 1544-7772
2. SendGrid 지원: [support.sendgrid.com](https://support.sendgrid.com)
3. ChonCance 개발팀: dev@choncance.com
