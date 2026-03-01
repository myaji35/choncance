# US-02: 원활한 예약 플로우

**Story ID**: US-02
**Epic**: Epic 4 - 예약 및 결제
**상태**: 🔨 진행 중 (86%)
**우선순위**: P0 (Critical)
**작성일**: 2026-02-10

---

## User Story

**As a** MZ세대 여행객
**I want to** 날짜를 선택하고 간편하게 예약 및 결제하기
**So that** 복잡한 절차 없이 빠르게 농촌 휴가를 예약할 수 있다

---

## 배경 (Background)

기존 농촌 숙소 예약은 **전화 문의 → 가용성 확인 → 계좌이체**의 번거로운 과정을 거친다. VINTEE는 **실시간 가용성 확인 + 온라인 결제**로 5분 내 예약 완료를 목표로 한다.

### 문제점 (Pain Points)
- 전화 예약: 업무 시간에만 가능, 즉시 확인 불가
- 계좌이체: 입금 확인 지연, 예약 불확실성
- 가용성 불확실: 중복 예약 위험

### 기대 효과 (Expected Benefits)
- 예약 시간 30분 → 5분으로 83% 단축
- 예약 확정률 60% → 95% 향상 (실시간 결제)
- 호스트 업무 부담 70% 감소 (자동화)

---

## 시나리오 (Scenarios)

### Scenario 1: 주말 1박 2일 예약 (기본 플로우)

**Context**: 직장인 지수(28세)는 다음 주 토요일~일요일에 논뷰 펜션을 예약하려 한다.

**Steps**:
1. 숙소 상세 페이지 접속 (`/property/clprop001`)
2. 우측 예약 위젯에서 **체크인 날짜** 선택
   - 캘린더 팝업 → 다음 주 토요일 (2026-02-15) 클릭
3. **체크아웃 날짜** 선택
   - 다음 주 일요일 (2026-02-16) 클릭
4. **인원** 선택
   - 성인 2명 (기본값)
5. 가격 자동 계산 확인
   - 1박 × 80,000원 = 80,000원
   - 서비스 수수료 (5%) = 4,000원
   - **총 금액: 84,000원**
6. **"예약하기"** 버튼 클릭
7. 체크아웃 페이지로 이동 (`/booking/checkout`)
8. 게스트 정보 입력:
   - 이름: 김지수
   - 이메일: jisu@example.com
   - 전화: 010-1234-5678
   - 특별 요청: "조용한 방 부탁드립니다"
9. 결제 수단 선택: **신용카드**
10. **"결제하기"** 버튼 클릭
11. 토스페이먼츠 팝업 열림
12. 카드 정보 입력 및 결제 승인
13. 결제 성공 페이지로 이동 (`/booking/success?orderId=booking_123`)
14. 예약 확인 이메일 수신

**Expected Outcome**:
- ✅ 총 소요 시간 5분 이내
- ✅ 실시간 결제 완료
- ✅ 즉시 예약 확정
- ✅ 자동 이메일 발송

---

### Scenario 2: 가용성 확인 및 대체 날짜 선택

**Context**: 은지(32세)는 반려견과 함께 여행하려 하지만 원하는 날짜가 이미 예약됨.

**Steps**:
1. 숙소 상세 페이지 접속
2. 체크인 날짜 선택 (2026-02-15)
3. 캘린더에서 **이미 예약된 날짜는 비활성화** 표시
   - 2026-02-15 ~ 2026-02-16: 회색 배경, 클릭 불가
4. 대체 날짜 확인:
   - 2026-02-22 ~ 2026-02-23: 예약 가능 (녹색 테두리)
5. 대체 날짜 선택 후 예약 진행
6. 정상 결제 완료

**Expected Outcome**:
- ✅ 실시간 가용성 확인
- ✅ 비활성화된 날짜는 선택 불가
- ✅ 대체 날짜 추천 (같은 주말)

---

### Scenario 3: 경험 프로그램 추가 예약

**Context**: 민호(30세)는 숙박과 함께 아궁이 체험을 예약하려 한다.

**Steps**:
1. 숙소 상세 페이지에서 **"경험 프로그램"** 섹션 확인
   - 아궁이 체험 (2시간, 30,000원)
   - 농사 체험 (3시간, 40,000원)
2. **"아궁이 체험"** 선택 (체크박스)
3. 예약 위젯에 자동 추가:
   - 숙박: 100,000원
   - 아궁이 체험: 30,000원
   - **총 금액: 130,000원 + 수수료 6,500원 = 136,500원**
4. 체크아웃 페이지에서 예약 상세 확인:
   - 숙박 (1박): 100,000원
   - 경험 (아궁이 체험): 30,000원
5. 결제 완료 후 호스트에게 경험 프로그램 정보 전달

**Expected Outcome**:
- ✅ 숙박 + 경험 복합 예약 가능
- ✅ 가격 자동 계산
- ✅ 호스트에게 경험 프로그램 정보 전달

---

### Scenario 4: 결제 실패 및 재시도

**Context**: 지수(28세)는 카드 잔액 부족으로 결제가 실패했다.

**Steps**:
1. 체크아웃 페이지에서 결제 진행
2. 토스페이먼츠 팝업에서 카드 정보 입력
3. 결제 승인 요청 → **실패 (잔액 부족)**
4. 결제 실패 페이지로 이동 (`/booking/fail?code=INSUFFICIENT_FUNDS`)
5. 실패 원인 표시: "카드 잔액이 부족합니다"
6. **"다시 시도"** 버튼 클릭
7. 체크아웃 페이지로 재이동 (예약 정보 유지)
8. 다른 카드로 결제 진행
9. 결제 성공

**Expected Outcome**:
- ✅ 결제 실패 시 명확한 원인 표시
- ✅ 예약 정보 유지 (재입력 불필요)
- ✅ 재시도 버튼 제공

---

## 수락 기준 (Acceptance Criteria)

### AC-1: 예약 위젯 (BookingWidget)
- [ ] 체크인 날짜 선택 캘린더 제공
- [ ] 체크아웃 날짜 선택 캘린더 제공
- [ ] 최소 숙박 기간: 1박 (당일 체크인/체크아웃 불가)
- [ ] 과거 날짜는 선택 불가 (비활성화)
- [ ] 이미 예약된 날짜는 선택 불가 (회색 배경)
- [ ] 인원 선택 (성인/어린이 카운터)
- [ ] 가격 자동 계산:
  - [ ] 1박 가격 × 박수
  - [ ] 서비스 수수료 (5%)
  - [ ] 총 금액 표시
- [ ] 예약하기 버튼 (로그인 필요 시 로그인 페이지로 이동)

### AC-2: 가용성 확인 (Availability Check)
- [ ] API 호출: `GET /api/availability/check?propertyId={id}&checkIn={date}&checkOut={date}`
- [ ] 실시간 가용성 확인 (캘린더 날짜 선택 시)
- [ ] 중복 예약 방지 (DB 트랜잭션)
- [ ] 가용 날짜는 녹색 테두리 표시
- [ ] 예약 불가 날짜는 회색 배경 + 클릭 불가
- [ ] 대체 날짜 추천 (같은 주말, 최대 3개)

### AC-3: 체크아웃 페이지
- [ ] 예약 요약 표시:
  - [ ] 숙소명 + 대표 이미지
  - [ ] 체크인/체크아웃 날짜
  - [ ] 인원
  - [ ] 가격 상세 (숙박 + 수수료 + 총액)
- [ ] 게스트 정보 입력 폼:
  - [ ] 이름 (필수)
  - [ ] 이메일 (필수, 이메일 형식 검증)
  - [ ] 전화번호 (필수, 한국 전화번호 형식)
  - [ ] 특별 요청 (선택, 최대 200자)
- [ ] 결제 수단 선택:
  - [ ] 신용카드 (기본)
  - [ ] 계좌이체 (향후 구현)
  - [ ] 간편결제 (카카오페이, 네이버페이 - 향후 구현)
- [ ] 결제하기 버튼 (토스페이먼츠 팝업 호출)

### AC-4: 토스페이먼츠 결제
- [ ] 토스페이먼츠 SDK 초기화
- [ ] 결제 요청:
  - [ ] amount: 총 금액
  - [ ] orderId: `booking_{cuid}`
  - [ ] orderName: "{숙소명} {박수}박"
  - [ ] customerName: 게스트 이름
  - [ ] customerEmail: 게스트 이메일
  - [ ] successUrl: `/booking/success`
  - [ ] failUrl: `/booking/fail`
- [ ] 결제 승인 API 호출:
  - [ ] POST `/api/payments/confirm`
  - [ ] paymentKey, orderId, amount 검증
- [ ] 결제 성공 시:
  - [ ] Payment 레코드 생성 (status: DONE)
  - [ ] Booking 레코드 생성 (status: CONFIRMED)
  - [ ] 성공 페이지로 리다이렉트
- [ ] 결제 실패 시:
  - [ ] 실패 페이지로 리다이렉트
  - [ ] 실패 원인 표시

### AC-5: 결제 성공 페이지
- [ ] 예약 확인 메시지: "예약이 완료되었습니다!"
- [ ] 예약 번호 (orderId) 표시
- [ ] 예약 상세 정보:
  - [ ] 숙소명
  - [ ] 체크인/체크아웃 날짜
  - [ ] 게스트 정보
  - [ ] 결제 금액
- [ ] 다음 단계 안내:
  - [ ] "예약 내역 보기" 버튼 → `/bookings`
  - [ ] "홈으로 돌아가기" 버튼 → `/`
- [ ] 자동 이메일 발송:
  - [ ] 게스트: 예약 확인 이메일
  - [ ] 호스트: 예약 알림 이메일

### AC-6: 결제 실패 페이지
- [ ] 실패 메시지: "결제가 실패했습니다"
- [ ] 실패 원인 표시:
  - [ ] INSUFFICIENT_FUNDS: 잔액 부족
  - [ ] INVALID_CARD: 유효하지 않은 카드
  - [ ] CANCELED: 사용자 취소
  - [ ] UNKNOWN_ERROR: 알 수 없는 오류
- [ ] "다시 시도" 버튼 → 체크아웃 페이지로 재이동 (정보 유지)
- [ ] "홈으로 돌아가기" 버튼 → `/`

---

## 기술 구현 (Technical Implementation)

### 프론트엔드

**컴포넌트 구조**:
```
src/components/booking/
├── BookingWidget.tsx        // 예약 위젯 (날짜 선택, 인원, 가격 계산)
├── CheckoutForm.tsx         // 체크아웃 폼 (게스트 정보, 결제)
└── BookingCard.tsx          // 예약 내역 카드

src/app/booking/
├── checkout/
│   └── page.tsx             // 체크아웃 페이지
├── success/
│   └── page.tsx             // 결제 성공 페이지
└── fail/
    └── page.tsx             // 결제 실패 페이지
```

**BookingWidget 예시**:
```tsx
"use client";

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

export default function BookingWidget({ property }) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);

  const nights = checkIn && checkOut
    ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = nights * property.pricePerNight;
  const serviceFee = totalPrice * 0.05;
  const grandTotal = totalPrice + serviceFee;

  const handleBooking = async () => {
    // 로그인 확인
    if (!userId) {
      router.push('/login');
      return;
    }

    // 체크아웃 페이지로 이동
    router.push(`/booking/checkout?propertyId=${property.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>예약하기</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 날짜 선택 */}
        <div className="mb-4">
          <label>체크인</label>
          <Calendar
            mode="single"
            selected={checkIn}
            onSelect={setCheckIn}
            disabled={(date) => date < new Date() || isBooked(date)}
          />
        </div>

        <div className="mb-4">
          <label>체크아웃</label>
          <Calendar
            mode="single"
            selected={checkOut}
            onSelect={setCheckOut}
            disabled={(date) => date <= checkIn || isBooked(date)}
          />
        </div>

        {/* 인원 선택 */}
        <div className="mb-4">
          <label>인원</label>
          <div className="flex items-center gap-2">
            <Button onClick={() => setGuests(Math.max(1, guests - 1))}>-</Button>
            <span>{guests}명</span>
            <Button onClick={() => setGuests(guests + 1)}>+</Button>
          </div>
        </div>

        {/* 가격 계산 */}
        {nights > 0 && (
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>{property.pricePerNight.toLocaleString()}원 × {nights}박</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>서비스 수수료 (5%)</span>
              <span>{serviceFee.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>총 금액</span>
              <span>{grandTotal.toLocaleString()}원</span>
            </div>
          </div>
        )}

        {/* 예약하기 버튼 */}
        <Button
          className="w-full bg-[#00A1E0]"
          onClick={handleBooking}
          disabled={!checkIn || !checkOut}
        >
          예약하기
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

### 백엔드

**API Endpoints**:
```typescript
// 1. 가용성 확인
GET /api/availability/check?propertyId={id}&checkIn={date}&checkOut={date}
Response:
{
  "available": true,
  "reason": null
}
// 또는
{
  "available": false,
  "reason": "이미 예약된 날짜입니다",
  "alternatives": [
    { "checkIn": "2026-02-22", "checkOut": "2026-02-23" }
  ]
}

// 2. 숙소 달력 조회 (한 달 전체)
GET /api/availability/calendar/:propertyId?month=2026-02
Response:
{
  "calendar": [
    { "date": "2026-02-01", "isAvailable": true },
    { "date": "2026-02-02", "isAvailable": false },
    ...
  ]
}

// 3. 예약 생성
POST /api/bookings
Request:
{
  "propertyId": "clprop001",
  "checkIn": "2026-02-15",
  "checkOut": "2026-02-16",
  "guestCount": 2,
  "guestName": "김지수",
  "guestEmail": "jisu@example.com",
  "guestPhone": "010-1234-5678",
  "specialRequests": "조용한 방 부탁드립니다",
  "experiences": ["clexp001"]  // 선택적
}
Response:
{
  "bookingId": "clbook001",
  "orderId": "booking_clbook001",
  "totalPrice": 84000,
  "status": "PENDING"
}

// 4. 결제 승인
POST /api/payments/confirm
Request:
{
  "paymentKey": "tpk_xxx",
  "orderId": "booking_clbook001",
  "amount": 84000
}
Response:
{
  "success": true,
  "paymentId": "clpay001",
  "bookingId": "clbook001",
  "status": "DONE"
}
```

---

### 데이터베이스

**Prisma Schema**:
```prisma
model Booking {
  id             String        @id @default(cuid())
  orderId        String        @unique
  userId         String
  user           User          @relation(...)
  propertyId     String
  property       Property      @relation(...)
  checkIn        DateTime
  checkOut       DateTime
  guestCount     Int
  guestName      String
  guestEmail     String
  guestPhone     String
  specialRequests String?      @db.Text
  totalPrice     Int
  status         BookingStatus @default(PENDING)
  payment        Payment?
  items          BookingItem[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([userId])
  @@index([propertyId])
  @@index([checkIn, checkOut])
}

enum BookingStatus {
  PENDING      // 결제 대기
  CONFIRMED    // 예약 확정
  CANCELLED    // 취소됨
  COMPLETED    // 완료됨
}

model Payment {
  id          String        @id @default(cuid())
  bookingId   String        @unique
  booking     Booking       @relation(...)
  paymentKey  String        @unique
  orderId     String
  amount      Int
  status      PaymentStatus @default(READY)
  method      String?       // "카드", "계좌이체" 등
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum PaymentStatus {
  READY        // 결제 준비
  IN_PROGRESS  // 결제 진행 중
  DONE         // 결제 완료
  CANCELED     // 결제 취소
  FAILED       // 결제 실패
}

model Calendar {
  id          String   @id @default(cuid())
  propertyId  String
  property    Property @relation(...)
  date        DateTime @db.Date
  isAvailable Boolean  @default(true)
  priceOverride Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([propertyId, date])
  @@index([propertyId, date])
}
```

---

## 테스트 시나리오 (Test Scenarios)

### E2E Test (Playwright)

```typescript
// tests/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test('사용자가 숙소를 예약하고 결제할 수 있다', async ({ page }) => {
  // 1. 숙소 상세 페이지 접속
  await page.goto('/property/clprop001');

  // 2. 체크인 날짜 선택
  await page.click('[data-testid="check-in-calendar"]');
  await page.click('button:has-text("15")');

  // 3. 체크아웃 날짜 선택
  await page.click('[data-testid="check-out-calendar"]');
  await page.click('button:has-text("16")');

  // 4. 가격 확인
  await expect(page.locator('[data-testid="total-price"]')).toContainText('84,000원');

  // 5. 예약하기 버튼 클릭
  await page.click('[data-testid="booking-submit"]');

  // 6. 체크아웃 페이지로 이동
  await expect(page).toHaveURL(/\/booking\/checkout/);

  // 7. 게스트 정보 입력
  await page.fill('[name="guestName"]', '김지수');
  await page.fill('[name="guestEmail"]', 'jisu@example.com');
  await page.fill('[name="guestPhone"]', '010-1234-5678');

  // 8. 결제하기 버튼 클릭
  await page.click('[data-testid="payment-submit"]');

  // 9. 토스페이먼츠 팝업 대기 (개발 환경)
  // ... (실제 결제 로직은 테스트 모드에서 자동 승인)

  // 10. 결제 성공 페이지 확인
  await expect(page).toHaveURL(/\/booking\/success/);
  await expect(page.locator('[data-testid="success-message"]')).toContainText('예약이 완료되었습니다');
});
```

---

## 우선순위 (Priority)

**P0 (Critical)**: MVP 핵심
- ✅ BookingWidget (날짜 선택, 가격 계산)
- ✅ 가용성 확인 API
- ✅ 체크아웃 페이지
- ✅ 토스페이먼츠 결제 연동
- ✅ 결제 성공/실패 페이지

**P1 (High)**: MVP 완성
- ⏸️ 예약 취소/환불 UI (진행 중)
- 🔮 이메일 알림 (예약 확인, 호스트 알림)

**P2 (Medium)**: Post-MVP
- 🔮 간편결제 (카카오페이, 네이버페이)
- 🔮 경험 프로그램 복합 예약
- 🔮 쿠폰/할인 시스템

---

**마지막 업데이트**: 2026-02-10
**작성자**: Claude Sonnet 4.5 with Gagahoho Engineering Team
