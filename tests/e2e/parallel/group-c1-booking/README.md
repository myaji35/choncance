# Group C1: 예약/결제 플로우 테스트

VINTEE 플랫폼의 핵심 기능인 예약과 결제 플로우를 엔드-투-엔드 테스트하는 Group C1입니다.

## 개요

예약에서 결제까지 전체 프로세스를 테스트하는 E2E 테스트 스위트입니다. Playwright를 사용하여 실제 사용자의 예약 여정을 재현합니다.

## 테스트 계정 정보

- **이메일**: test_booker_1@vintee.test
- **비밀번호**: TestPassword123!
- **게스트 이름**: 김예약
- **게스트 전화번호**: 010-3333-4444
- **게스트 이메일**: guest@example.com

## 테스트 숙소

- **숙소 ID**: test_property_1
- **숙소명**: 테스트 시골 펜션
- **1박 가격**: ₩150,000
- **최대 게스트**: 6명
- **위치**: 강원도 강릉시

## 파일 구조

```
group-c1-booking/
├── setup.ts                        # 공유 설정 및 유틸리티
├── 01-booking-widget.spec.ts       # 예약 위젯 테스트
├── 02-checkout-process.spec.ts     # 체크아웃 프로세스 테스트
├── 03-payment-success.spec.ts      # 결제 및 성공 페이지 테스트
├── 04-booking-management.spec.ts   # 예약 관리 테스트
└── README.md                       # 이 파일
```

## 테스트 스펙

### 01-booking-widget.spec.ts (20개 테스트)
숙소 상세 페이지의 예약 위젯 기능을 테스트합니다.

**테스트 항목**:
- 예약 위젯 표시
- 가격 정보 표시
- 체크인/체크아웃 날짜 선택
- 게스트 수 선택
- 날짜 유효성 검증 (과거 날짜 비활성화)
- 예약 버튼 활성화 조건
- 숙소 정보, 이미지, 호스트, 리뷰 표시
- 반응형 디자인 (모바일, 태블릿)
- 페이지 로드 성능

### 02-checkout-process.spec.ts (14개 테스트)
체크아웃 페이지의 예약 정보 입력 프로세스를 테스트합니다.

**테스트 항목**:
- 날짜 선택 (체크인, 체크아웃)
- 게스트 수 선택
- 예약 요약 정보 표시
- 체크아웃 페이지 이동
- 체크아웃 폼 표시 및 입력
  - 게스트 이름 입력
  - 게스트 전화번호 입력
  - 게스트 이메일 입력
  - 특수 요청사항 입력
- 약관 동의 체크박스
- 필수 필드 유효성 검증
- 총액 계산
- 예약 정보 수정

### 03-payment-success.spec.ts (19개 테스트)
결제 프로세스와 성공 페이지를 테스트합니다.

**테스트 항목**:
- 결제 페이지 접근
- 결제 위젯 표시
- 결제 수단 선택 (카드, 계좌이체)
- 결제 가격 정보 표시
- 결제 완료 프로세스
- 성공 페이지 표시
  - 예약 번호 표시
  - 상세 정보 표시
  - 체크인/체크아웃 날짜
  - 총액 정보
  - 호스트 연락처
- 대시보드 이동
- 영수증 다운로드
- 예약 취소 안내
- 공유 기능
- 이메일 발송 안내
- 결제 실패 처리

### 04-booking-management.spec.ts (22개 테스트)
대시보드의 예약 관리 기능을 테스트합니다.

**테스트 항목**:
- 대시보드 페이지 접근
- 예약 목록 표시
- 빈 목록 메시지
- 예약 카드 정보 (숙소, 날짜, 번호, 상태, 가격)
- 예약 상세 조회
- 예약 수정/취소 기능
- 취소 확인 다이얼로그
- 예약 목록 필터링 및 검색
- 예약 정렬
- 다운로드 기능
- 호스트 메시지 기능
- 영수증 조회
- 리뷰 작성
- 숙소 상세 페이지 링크
- 반응형 디자인
- 로딩 상태 표시

## 모킹 및 테스트 환경

### Toss Payments 모킹

결제 테스트를 위해 Toss Payments API를 모킹하여 실제 결제 없이 테스트합니다:

```typescript
// setup.ts의 setupTossPaymentsMock 함수 참고
await setupTossPaymentsMock(page, mockId, true); // 성공
await setupTossPaymentsMock(page, mockId, false); // 실패
```

### API 모킹

예약 및 가용성 API도 모킹하여 백엔드 의존성 없이 테스트합니다:

```typescript
await setupBookingAPIMock(page, mockId);
await setupAvailabilityAPIMock(page);
```

## 실행 방법

### 전체 테스트 실행
```bash
npx playwright test tests/e2e/parallel/group-c1-booking/
```

### 특정 테스트 파일 실행
```bash
# 예약 위젯 테스트만 실행
npx playwright test tests/e2e/parallel/group-c1-booking/01-booking-widget.spec.ts

# 체크아웃 프로세스 테스트만 실행
npx playwright test tests/e2e/parallel/group-c1-booking/02-checkout-process.spec.ts

# 결제 및 성공 페이지 테스트만 실행
npx playwright test tests/e2e/parallel/group-c1-booking/03-payment-success.spec.ts

# 예약 관리 테스트만 실행
npx playwright test tests/e2e/parallel/group-c1-booking/04-booking-management.spec.ts
```

### 특정 테스트만 실행
```bash
npx playwright test -g "예약 위젯 표시 확인"
```

### UI 모드로 실행
```bash
npx playwright test tests/e2e/parallel/group-c1-booking/ --ui
```

### 디버그 모드
```bash
npx playwright test tests/e2e/parallel/group-c1-booking/ --debug
```

### 병렬 실행 설정
Group C1은 병렬 실행을 지원하도록 설계되었습니다. 각 테스트는 독립적인 테스트 계정과 환경을 사용합니다.

## 주요 기능 및 검증 항목

### 예약 위젯 (01)
- ✅ 가격 정보의 정확한 표시
- ✅ 날짜 선택의 유효성 검증
- ✅ 게스트 수 조정
- ✅ 과거 날짜 비활성화
- ✅ 레이아웃 반응형 대응

### 체크아웃 (02)
- ✅ 필수 정보 입력 검증
- ✅ 폼 데이터 저장 및 수정
- ✅ 예약 요약 정보 정확성
- ✅ 약관 동의 확인

### 결제 (03)
- ✅ Toss Payments 통합
- ✅ 여러 결제 수단 지원
- ✅ 성공/실패 페이지 처리
- ✅ 예약 확인 정보 표시
- ✅ 환불 및 취소 정책 안내

### 예약 관리 (04)
- ✅ 예약 목록 표시 및 필터링
- ✅ 예약 상세 조회
- ✅ 예약 수정 및 취소
- ✅ 호스트 통신
- ✅ 리뷰 작성

## 선택자(Selectors) 참고

`setup.ts`의 `SELECTORS` 객체에 정의된 CSS 선택자를 사용합니다:

```typescript
export const SELECTORS = {
  // 예약 위젯
  bookingWidget: '[data-testid="booking-widget"]',
  priceDisplay: '[data-testid="price-display"]',

  // 체크아웃
  checkoutForm: '[data-testid="checkout-form"]',
  guestNameInput: 'input[name="guestName"]',

  // 결제
  paymentWidget: '[data-testid="payment-widget"]',
  confirmPaymentButton: 'button:has-text("결제 완료")',

  // 성공
  successMessage: '[data-testid="success-message"]',
  bookingNumber: '[data-testid="booking-number"]',

  // 예약 관리
  bookingList: '[data-testid="booking-list"]',
  bookingCard: '[data-testid="booking-card"]',
  // ... 더 많은 선택자
};
```

## 타이밍 상수

```typescript
export const TIMEOUTS = {
  NETWORK_IDLE: 3000,      // 네트워크 유휴 대기
  DIALOG_APPEAR: 2000,     // 다이얼로그 표시 대기
  ANIMATION: 500,          // 애니메이션 대기
  FORM_SUBMIT: 2000,       // 폼 제출 대기
  NAVIGATION: 3000,        // 페이지 이동 대기
  PAYMENT: 5000,           // 결제 프로세스 대기
  BOOKING_CONFIRMATION: 3000, // 예약 확인 대기
};
```

## 트러블슈팅

### 테스트 실패 원인

1. **로그인 실패**
   - 테스트 계정 생성 확인
   - Clerk 설정 확인
   - 네트워크 상태 확인

2. **타이밍 문제**
   - 네트워크 속도가 느린 경우 TIMEOUTS 값 증가
   - waitForLoadState('networkidle') 추가

3. **선택자 변경**
   - 프로젝트의 HTML 구조 변경 시 선택자 업데이트 필요
   - setup.ts의 SELECTORS 객체 수정

4. **모킹 문제**
   - setupTossPaymentsMock 함수가 올바르게 실행되는지 확인
   - 브라우저 콘솔에서 Toss 객체 존재 여부 확인

## 데이터 일관성

테스트 데이터는 `setup.ts`에 정의됩니다:

```typescript
export const TEST_BOOKER = { /* 테스트 계정 */ };
export const TEST_PROPERTY = { /* 테스트 숙소 */ };
export const TEST_BOOKING_DATA = { /* 예약 데이터 */ };
```

필요한 경우 이 값들을 수정하여 테스트 환경에 맞게 조정할 수 있습니다.

## 병렬 실행 지원

Group C1의 모든 테스트는 병렬 실행을 지원합니다:

- 각 테스트마다 독립적인 모킹 ID 생성
- 테스트 계정 격리
- 상태 공유 최소화

## 성능 최적화

- 불필요한 대기 최소화
- 네트워크 모킹으로 외부 의존성 제거
- 병렬 실행으로 테스트 시간 단축

## 보고서 및 결과

테스트 실행 후 다음 위치에서 결과를 확인할 수 있습니다:

```
playwright-report/
├── index.html        # 테스트 보고서
└── trace/           # 테스트 실행 기록 (--trace on-first-retry 설정)
```

## 추가 정보

- **Playwright 문서**: https://playwright.dev/
- **프로젝트 구조**: 프로젝트의 CLAUDE.md 참고
- **기타 E2E 테스트**: tests/e2e/parallel/ 디렉토리

## 버전 정보

- **Playwright**: 1.56+
- **Node.js**: 18+
- **브라우저**: Chromium, Firefox, WebKit

## 라이선스

프로젝트 라이선스에 따릅니다.
