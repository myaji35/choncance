# 토스 페이먼츠 결제 시스템

VINTEE 플랫폼의 토스 페이먼츠 연동 가이드입니다.

## 목차

- [개요](#개요)
- [환경 설정](#환경-설정)
- [결제 플로우](#결제-플로우)
- [API 엔드포인트](#api-엔드포인트)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [테스트 방법](#테스트-방법)
- [문제 해결](#문제-해결)

## 개요

VINTEE는 토스 페이먼츠를 사용하여 숙박 예약에 대한 결제를 처리합니다. 주요 기능은 다음과 같습니다:

- **결제 승인**: 토스 페이먼츠 API를 통한 결제 승인 처리
- **환불**: 전액/부분 환불 지원
- **영수증**: 결제 영수증 조회 기능
- **개발 모드**: 토스 API 키 없이도 시뮬레이션 가능

## 환경 설정

### 1. 토스 페이먼츠 API 키 발급

1. [토스 페이먼츠 개발자센터](https://developers.tosspayments.com/)에 가입
2. **내 개발 정보** 메뉴에서 테스트/운영 API 키 발급
3. 클라이언트 키와 시크릿 키를 복사

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가합니다:

```bash
# 토스 페이먼츠 클라이언트 키 (브라우저에서 사용)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_YOUR_CLIENT_KEY

# 토스 페이먼츠 시크릿 키 (서버에서만 사용)
TOSS_SECRET_KEY=test_sk_YOUR_SECRET_KEY
```

**주의사항:**
- `NEXT_PUBLIC_` 접두사가 있는 환경 변수는 브라우저에서도 접근 가능
- 시크릿 키는 절대 클라이언트에 노출되면 안 됨
- 운영 환경에서는 `test_` 접두사가 없는 실제 키 사용

### 3. 개발 모드

`TOSS_SECRET_KEY`가 설정되지 않은 경우, 개발 모드로 자동 전환됩니다:
- 실제 토스 API 호출 없이 결제 승인 시뮬레이션
- 데이터베이스에 결제 기록 저장
- 개발 및 테스트 목적으로만 사용

## 결제 플로우

### 1. 예약 생성 및 결제 준비

```
사용자 → 체크아웃 페이지 이동
       ↓
     [예약 정보 입력]
       ↓
  POST /api/bookings
       ↓
    [예약 생성]
       ↓
  [결제 객체 생성]
  - orderId 생성
  - amount 계산
  - Payment 레코드 생성 (status: READY)
```

**관련 파일:**
- `/src/app/booking/checkout/page.tsx` - 체크아웃 UI
- `/src/app/api/bookings/route.ts` - 예약 생성 API

### 2. 토스 페이먼츠 결제 창 호출

```javascript
// 토스 페이먼츠 SDK 로드
const { loadTossPayments } = await import("@tosspayments/payment-sdk");
const tossPayments = await loadTossPayments(clientKey);

// 결제 요청
await tossPayments.requestPayment("카드", {
  amount: 50000,
  orderId: "ORD-ABC123-1234567890",
  orderName: "산골집 예약",
  customerName: "홍길동",
  customerEmail: "user@example.com",
  customerMobilePhone: "01012345678",
  successUrl: `${origin}/booking/success`,
  failUrl: `${origin}/booking/fail`,
});
```

**결제 수단:**
- `"카드"`: 신용/체크카드
- `"가상계좌"`: 가상계좌
- `"계좌이체"`: 계좌이체
- `"휴대폰"`: 휴대폰 결제

### 3. 결제 승인 처리

```
결제 성공 → /booking/success?paymentKey=xxx&orderId=xxx&amount=xxx
              ↓
         [자동 승인 처리]
              ↓
      POST /api/payments/confirm
              ↓
      [토스 API 호출]
      - 결제 승인 요청
      - paymentKey, orderId, amount 전달
              ↓
      [데이터베이스 업데이트]
      - Payment: status → DONE
      - Booking: status → CONFIRMED
      - PaymentTransaction 생성
              ↓
         [예약 완료]
```

**관련 파일:**
- `/src/app/booking/success/page.tsx` - 성공 페이지 & 승인 처리
- `/src/app/api/payments/confirm/route.ts` - 결제 승인 API

### 4. 결제 실패 처리

```
결제 실패 → /booking/fail?code=xxx&message=xxx
              ↓
         [실패 메시지 표시]
              ↓
      [재시도 또는 취소]
```

**관련 파일:**
- `/src/app/booking/fail/page.tsx` - 실패 페이지

## API 엔드포인트

### POST /api/bookings

예약을 생성하고 결제 객체를 준비합니다.

**요청:**
```json
{
  "propertyId": "cm4xxxxx",
  "checkIn": "2025-12-01",
  "checkOut": "2025-12-03",
  "guests": 2,
  "guestInfo": {
    "name": "홍길동",
    "phone": "010-1234-5678",
    "email": "user@example.com"
  },
  "specialRequests": "조용한 방 부탁드립니다"
}
```

**응답:**
```json
{
  "booking": {
    "id": "cm4xxxxx",
    "status": "PENDING",
    "totalAmount": 50000,
    ...
  },
  "payment": {
    "orderId": "ORD-CM4XXXXX-1234567890",
    "orderName": "산골집 예약",
    "amount": 50000,
    "checkoutUrl": "/booking/cm4xxxxx/checkout"
  }
}
```

### POST /api/payments/confirm

토스 페이먼츠 결제를 승인합니다.

**요청:**
```json
{
  "paymentKey": "tgen_xxxxxxxxxxxxx",
  "orderId": "ORD-CM4XXXXX-1234567890",
  "amount": 50000
}
```

**응답:**
```json
{
  "success": true,
  "orderId": "ORD-CM4XXXXX-1234567890",
  "bookingId": "cm4xxxxx",
  "message": "결제가 완료되었습니다"
}
```

**에러 응답:**
```json
{
  "error": "Amount mismatch"
}
```

### POST /api/payments/[id]/refund

결제를 환불합니다.

**요청:**
```json
{
  "reason": "고객 요청",
  "cancelAmount": 50000  // 생략 시 전액 환불
}
```

**응답:**
```json
{
  "success": true,
  "refund": {
    "paymentId": "cm4xxxxx",
    "refundAmount": 50000,
    "status": "CANCELLED",
    "transactionId": "cm4xxxxx"
  }
}
```

### GET /api/payments/[id]/receipt

결제 영수증을 조회합니다.

**응답:**
```json
{
  "receiptNumber": "RC-CM4XXXXX",
  "issuedAt": "2025년 11월 26일 14:30",
  "payment": {
    "amount": 50000,
    "method": "card",
    "status": "DONE",
    "paidAt": "2025년 11월 26일 14:25"
  },
  "booking": {
    "checkIn": "2025년 12월 1일",
    "checkOut": "2025년 12월 3일",
    "guests": 2
  },
  "property": {
    "name": "산골집",
    "address": "강원도 ..."
  },
  "transactions": [...]
}
```

## 데이터베이스 스키마

### Payment 모델

```prisma
model Payment {
  id              String         @id @default(cuid())
  bookingId       String         @unique
  booking         Booking        @relation(fields: [bookingId], references: [id])

  amount          Decimal        @db.Decimal(10, 2)
  currency        String         @default("KRW")
  status          PaymentStatus  @default(READY)

  orderId         String         @unique
  orderName       String
  paymentKey      String?        // 토스 페이먼츠 결제 키
  paymentMethod   String?        // card, transfer, etc.

  requestedAt     DateTime       @default(now())
  approvedAt      DateTime?
  cancelledAt     DateTime?
  refundedAt      DateTime?

  transactions    PaymentTransaction[]

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

enum PaymentStatus {
  READY         // 결제 준비
  IN_PROGRESS   // 결제 진행 중
  DONE          // 결제 완료
  CANCELLED     // 결제 취소
  FAILED        // 결제 실패
}
```

### PaymentTransaction 모델

```prisma
model PaymentTransaction {
  id          String   @id @default(cuid())
  paymentId   String
  payment     Payment  @relation(fields: [paymentId], references: [id])

  externalId  String?  // 외부 거래 ID (토스 transactionKey)
  type        String   // "PAYMENT", "REFUND"
  amount      Decimal  @db.Decimal(10, 2)
  status      String   // "SUCCESS", "FAILED", "PENDING"
  method      String?  // "card", "transfer", "SIMULATED"
  metadata    Json?    // 토스 응답 데이터 등

  createdAt   DateTime @default(now())
}
```

## 테스트 방법

### 1. 개발 모드 테스트 (토스 API 키 없이)

```bash
# .env.local에서 TOSS_SECRET_KEY 주석 처리 또는 제거
# TOSS_SECRET_KEY=test_sk_xxxxx

# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
1. 숙소 선택 및 예약
2. 체크아웃 페이지에서 예약자 정보 입력
3. "예약 확정하기" 클릭
4. 토스 결제창이 표시되지 않고 자동으로 성공 페이지로 이동
5. 콘솔에 "⚠️ TOSS_SECRET_KEY not found. Simulating..." 메시지 확인
```

### 2. 토스 테스트 키로 테스트

```bash
# .env.local에 토스 테스트 키 설정
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R

# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
1. 숙소 선택 및 예약
2. 체크아웃 페이지에서 예약자 정보 입력
3. "예약 확정하기" 클릭
4. 토스 결제창 표시
5. 테스트 카드 정보로 결제:
   - 카드번호: 아무 16자리 (예: 1234567890123456)
   - 유효기간: 미래 날짜
   - CVC: 아무 3자리
```

### 3. 데이터베이스 확인

```bash
# Prisma Studio로 데이터 확인
npx prisma studio

# 확인할 테이블:
# - Booking: status가 CONFIRMED인지 확인
# - Payment: status가 DONE, paymentKey가 있는지 확인
# - PaymentTransaction: type이 PAYMENT, status가 SUCCESS인지 확인
```

## 문제 해결

### 결제창이 뜨지 않아요

**원인:**
- 토스 페이먼츠 SDK 로드 실패
- 클라이언트 키 오류

**해결:**
```javascript
// 브라우저 콘솔에서 확인
console.log(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);

// 또는 체크아웃 페이지 코드에서
const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
if (!tossClientKey) {
  console.error('토스 클라이언트 키가 설정되지 않았습니다');
}
```

### 결제 승인이 실패해요

**원인:**
- 시크릿 키 오류
- 금액 불일치
- orderId 중복

**해결:**
```bash
# 서버 로그 확인
# 콘솔에 "Toss Payments error:" 메시지 확인

# 환경 변수 확인
echo $TOSS_SECRET_KEY

# 데이터베이스에서 중복 orderId 확인
# Payment 테이블에서 같은 orderId가 있는지 확인
```

### 환불이 안 돼요

**원인:**
- 결제가 DONE 상태가 아님
- paymentKey가 없음 (개발 모드에서 생성된 결제)
- 토스 API 호출 실패

**해결:**
```bash
# Payment 상태 확인
# status가 DONE인지, paymentKey가 있는지 확인

# 환불 API 에러 로그 확인
# 서버 콘솔에서 "Toss Payments refund error:" 메시지 확인

# 개발 모드 결제는 환불 API 호출 없이 DB만 업데이트
# TOSS_SECRET_KEY가 없으면 토스 API 호출을 건너뜀
```

### 개발 모드와 실제 모드 구분

**개발 모드 (TOSS_SECRET_KEY 없음):**
- 결제 승인 시 토스 API 호출 없이 시뮬레이션
- PaymentTransaction의 metadata에 `simulatedPayment: true` 저장
- method가 "SIMULATED"로 저장
- 환불 시 토스 API 호출 건너뜀

**실제 모드 (TOSS_SECRET_KEY 있음):**
- 결제 승인 시 토스 API 호출
- 실제 결제 데이터 저장
- 환불 시 토스 API 호출

## 참고 자료

- [토스 페이먼츠 개발자 문서](https://docs.tosspayments.com/)
- [토스 페이먼츠 API 레퍼런스](https://docs.tosspayments.com/reference)
- [토스 페이먼츠 테스트 카드](https://docs.tosspayments.com/guides/test-card)
- [VINTEE 예약 시스템 아키텍처](./architecture/booking-system-architecture.md)

## 보안 주의사항

1. **시크릿 키 관리**
   - `.env.local` 파일을 절대 Git에 커밋하지 마세요
   - 운영 환경에서는 환경 변수로 관리하세요
   - 시크릿 키가 노출되면 즉시 재발급하세요

2. **금액 검증**
   - 클라이언트에서 전달받은 금액을 절대 신뢰하지 마세요
   - 서버에서 항상 금액을 재계산하세요
   - 결제 승인 시 금액 일치 여부를 검증하세요

3. **HTTPS 사용**
   - 운영 환경에서는 반드시 HTTPS를 사용하세요
   - 토스 페이먼츠는 HTTPS에서만 작동합니다

## 라이선스

이 문서는 VINTEE 프로젝트의 일부입니다.
