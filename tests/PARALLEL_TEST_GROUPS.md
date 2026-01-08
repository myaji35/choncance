# VINTEE Playwright E2E 테스트 병렬 실행 그룹

## 📋 개요

테스트 시나리오를 분석하여 병렬 실행 가능한 독립적인 그룹으로 재구성했습니다.
각 그룹은 서로 다른 데이터/상태를 사용하므로 동시 실행이 가능합니다.

## 🎯 병렬 실행 전략

### 핵심 원칙
1. **데이터 격리**: 각 그룹은 독립적인 테스트 데이터 사용
2. **상태 독립성**: 그룹 간 상태 공유 없음
3. **리소스 분리**: 서로 다른 테스트 계정/숙소 사용
4. **순차 실행**: 같은 그룹 내 테스트는 순차적으로 실행

---

## 🚀 Group A: 읽기 전용 테스트 (병렬 실행 가능)

이 그룹의 모든 테스트는 데이터 수정 없이 읽기만 수행하므로 완전히 병렬 실행 가능합니다.

### A1: 공개 페이지 테스트
```
tests/e2e/parallel/group-a1-public/
├── 01-homepage.spec.ts
│   ├── 메인 페이지 로딩
│   ├── 히어로 섹션 표시
│   ├── CTA 버튼 확인
│   └── 푸터 링크 확인
├── 02-explore-readonly.spec.ts
│   ├── 탐색 페이지 로딩
│   ├── 숙소 카드 표시
│   ├── 테마 섹션 표시
│   └── 모바일 레이아웃
├── 03-property-detail-readonly.spec.ts
│   ├── 숙소 기본 정보 표시
│   ├── 이미지 갤러리
│   ├── 호스트 스토리
│   └── 편의시설 목록
├── 04-search-filter-readonly.spec.ts
│   ├── 태그 필터 UI
│   ├── 가격 범위 슬라이더
│   ├── 지역 필터 드롭다운
│   └── 필터 초기화
└── 05-static-pages.spec.ts
    ├── 이용약관 페이지
    ├── 개인정보보호정책
    ├── 사용 가이드
    └── 자주 묻는 질문
```

### A2: UI 컴포넌트 테스트
```
tests/e2e/parallel/group-a2-components/
├── 01-navigation.spec.ts
│   ├── 헤더 네비게이션
│   ├── 모바일 메뉴
│   └── 브레드크럼
├── 02-forms-validation.spec.ts
│   ├── 입력 필드 유효성 검사
│   ├── 에러 메시지 표시
│   └── 폼 초기화
├── 03-modals-dialogs.spec.ts
│   ├── 모달 열기/닫기
│   ├── 다이얼로그 확인/취소
│   └── ESC 키로 닫기
└── 04-responsive-design.spec.ts
    ├── 데스크톱 레이아웃
    ├── 태블릿 레이아웃
    └── 모바일 레이아웃
```

---

## 👤 Group B: 사용자별 격리 테스트

각 사용자 타입별로 독립적인 계정을 사용하여 병렬 실행 가능합니다.

### B1: 일반 사용자 플로우 (test_user_1)
```
tests/e2e/parallel/group-b1-user/
├── setup.ts (테스트 계정: test_user_1@vintee.test)
├── 01-user-auth.spec.ts
│   ├── 회원가입
│   ├── 로그인
│   ├── 로그아웃
│   └── 비밀번호 재설정
├── 02-user-profile.spec.ts
│   ├── 프로필 조회
│   ├── 프로필 수정
│   ├── 전화번호 추가
│   └── 크레딧 확인
├── 03-user-wishlist.spec.ts
│   ├── 위시리스트 추가
│   ├── 위시리스트 목록
│   ├── 위시리스트 제거
│   └── 찜 아이콘 상태
├── 04-user-search.spec.ts
│   ├── 텍스트 검색
│   ├── 태그 필터링
│   ├── 복합 필터
│   └── 검색 결과 정렬
└── 05-user-notifications.spec.ts
    ├── 알림 목록
    ├── 알림 읽음 처리
    └── 알림 설정
```

### B2: 호스트 플로우 (test_host_1)
```
tests/e2e/parallel/group-b2-host/
├── setup.ts (테스트 계정: test_host_1@vintee.test)
├── 01-host-application.spec.ts
│   ├── 호스트 신청
│   ├── 사업자 정보 입력
│   └── 약관 동의
├── 02-host-dashboard.spec.ts
│   ├── 대시보드 접근
│   ├── 통계 표시
│   ├── 최근 예약
│   └── 수익 현황
├── 03-property-management.spec.ts
│   ├── 숙소 등록
│   ├── 숙소 수정
│   ├── 숙소 비활성화
│   └── 이미지 관리
├── 04-experience-management.spec.ts
│   ├── 체험 추가
│   ├── 체험 수정
│   ├── 체험 삭제
│   └── 가용 시간 설정
└── 05-host-profile.spec.ts
    ├── 호스트 프로필 조회
    ├── 연락처 수정
    └── 사업자 정보 업데이트
```

### B3: 관리자 플로우 (test_admin)
```
tests/e2e/parallel/group-b3-admin/
├── setup.ts (테스트 계정: test_admin@vintee.test)
├── 01-admin-auth.spec.ts
│   ├── 관리자 로그인
│   └── 권한 확인
├── 02-admin-dashboard.spec.ts
│   ├── 대시보드 통계
│   ├── 대기 중인 승인
│   └── 최근 활동
├── 03-host-approval.spec.ts
│   ├── 호스트 신청 목록
│   ├── 신청 상세 조회
│   ├── 승인 처리
│   └── 거절 처리
├── 04-property-review.spec.ts
│   ├── 검토 대기 목록
│   ├── 숙소 상세 검토
│   ├── 승인 처리
│   └── 거절 처리
└── 05-admin-settings.spec.ts
    ├── SNS 계정 관리
    ├── 챗봇 설정
    └── 시스템 설정
```

---

## 🔄 Group C: 예약/결제 플로우 (격리된 트랜잭션)

각 테스트 스위트는 독립적인 예약을 생성하므로 병렬 실행 가능합니다.

### C1: 예약 플로우 1 (Property ID: test_property_1)
```
tests/e2e/parallel/group-c1-booking/
├── setup.ts (사용자: test_booker_1, 숙소: test_property_1)
├── 01-booking-widget.spec.ts
│   ├── 예약 위젯 표시
│   ├── 날짜 선택
│   ├── 게스트 수 선택
│   └── 가격 계산
├── 02-checkout-process.spec.ts
│   ├── 체크아웃 페이지
│   ├── 게스트 정보 입력
│   ├── 체험 선택
│   └── 약관 동의
├── 03-payment-success.spec.ts
│   ├── 결제 성공 플로우
│   ├── 예약 확인
│   └── 이메일 알림
└── 04-booking-management.spec.ts
    ├── 예약 내역 조회
    ├── 예약 상세
    └── 예약 취소
```

### C2: 예약 플로우 2 (Property ID: test_property_2)
```
tests/e2e/parallel/group-c2-booking-alt/
├── setup.ts (사용자: test_booker_2, 숙소: test_property_2)
├── 01-availability-check.spec.ts
│   ├── 가용성 확인
│   ├── 블로킹 날짜
│   └── 최소/최대 숙박일
├── 02-payment-failure.spec.ts
│   ├── 결제 실패 처리
│   ├── 에러 메시지
│   └── 재시도
├── 03-booking-modification.spec.ts
│   ├── 날짜 변경
│   ├── 게스트 수 변경
│   └── 체험 추가/제거
└── 04-refund-process.spec.ts
    ├── 환불 요청
    ├── 환불 처리
    └── 환불 내역
```

### C3: 호스트 예약 관리 (Host: test_host_2)
```
tests/e2e/parallel/group-c3-host-bookings/
├── setup.ts (호스트: test_host_2)
├── 01-booking-requests.spec.ts
│   ├── 예약 요청 목록
│   ├── 대기 중 필터
│   └── 검색 기능
├── 02-booking-approval.spec.ts
│   ├── 예약 승인
│   ├── 예약 거절
│   └── 거절 사유
├── 03-guest-communication.spec.ts
│   ├── 게스트 메시지
│   ├── 자동 응답
│   └── 체크인 안내
└── 04-calendar-management.spec.ts
    ├── 가용성 설정
    ├── 블로킹 설정
    └── 가격 오버라이드
```

---

## 🧪 Group D: 기능별 독립 테스트

각 기능이 독립적이므로 병렬 실행 가능합니다.

### D1: 리뷰 시스템
```
tests/e2e/parallel/group-d1-reviews/
├── setup.ts (사용자: test_reviewer)
├── 01-review-creation.spec.ts
│   ├── 리뷰 작성 폼
│   ├── 별점 선택
│   └── 사진 업로드
├── 02-review-display.spec.ts
│   ├── 리뷰 목록
│   ├── 리뷰 필터
│   └── 리뷰 정렬
├── 03-sns-sharing.spec.ts
│   ├── SNS 공유 버튼
│   ├── 공유 링크 생성
│   └── 크레딧 획득
└── 04-host-response.spec.ts
    ├── 호스트 답글
    └── 답글 알림
```

### D2: AI 챗봇
```
tests/e2e/parallel/group-d2-chatbot/
├── 01-chatbot-ui.spec.ts
│   ├── 챗봇 버튼
│   ├── 채팅 창 열기
│   └── 메시지 입력
├── 02-chatbot-responses.spec.ts
│   ├── 인사말
│   ├── 숙소 추천
│   └── 예약 안내
└── 03-chatbot-context.spec.ts
    ├── 대화 컨텍스트
    └── 이전 대화 기록
```

### D3: 크레딧 시스템
```
tests/e2e/parallel/group-d3-credits/
├── setup.ts (사용자: test_credit_user)
├── 01-credit-earning.spec.ts
│   ├── 리뷰 작성 크레딧
│   ├── SNS 공유 크레딧
│   └── 이벤트 크레딧
├── 02-credit-usage.spec.ts
│   ├── 예약 시 사용
│   ├── 크레딧 차감
│   └── 잔액 확인
└── 03-credit-history.spec.ts
    ├── 적립 내역
    ├── 사용 내역
    └── 내역 필터
```

---

## ⚠️ Group E: 순차 실행 필요 (동일 그룹 내 순차)

이 테스트들은 상태를 공유하거나 순서가 중요하므로 각 그룹 내에서는 순차 실행이 필요합니다.

### E1: 전체 사용자 여정 (End-to-End Journey)
```
tests/e2e/sequential/group-e1-journey/
├── 01-new-user-journey.spec.ts (순차 실행)
│   ├── 1. 회원가입
│   ├── 2. 프로필 설정
│   ├── 3. 숙소 탐색
│   ├── 4. 위시리스트 추가
│   ├── 5. 예약 진행
│   ├── 6. 결제 완료
│   ├── 7. 리뷰 작성
│   └── 8. 크레딧 확인
└── 02-host-journey.spec.ts (순차 실행)
    ├── 1. 호스트 신청
    ├── 2. 승인 대기
    ├── 3. 숙소 등록
    ├── 4. 예약 수락
    ├── 5. 체크인 처리
    └── 6. 수익 정산
```

### E2: 데이터 의존성 테스트
```
tests/e2e/sequential/group-e2-dependencies/
├── 01-cascade-operations.spec.ts
│   ├── 1. 숙소 생성
│   ├── 2. 체험 추가
│   ├── 3. 예약 생성
│   └── 4. 연관 데이터 삭제
└── 02-state-transitions.spec.ts
    ├── 1. 예약 상태 변경 (PENDING → CONFIRMED)
    ├── 2. 결제 상태 변경 (READY → DONE)
    └── 3. 환불 상태 변경 (DONE → REFUNDED)
```

---

## 🛠️ Group F: 성능 및 부하 테스트

리소스 집약적이므로 별도 실행을 권장합니다.

### F1: 성능 테스트
```
tests/e2e/performance/
├── 01-page-load-metrics.spec.ts
│   ├── First Contentful Paint
│   ├── Time to Interactive
│   └── Largest Contentful Paint
├── 02-api-response-time.spec.ts
│   ├── 숙소 목록 API
│   ├── 검색 API
│   └── 예약 생성 API
└── 03-concurrent-users.spec.ts
    ├── 동시 접속자 10명
    ├── 동시 예약 5건
    └── 동시 검색 20건
```

### F2: 접근성 테스트
```
tests/e2e/accessibility/
├── 01-wcag-compliance.spec.ts
│   ├── WCAG 2.1 Level A
│   ├── WCAG 2.1 Level AA
│   └── 색상 대비
├── 02-keyboard-navigation.spec.ts
│   ├── Tab 순서
│   ├── 포커스 관리
│   └── 키보드 단축키
└── 03-screen-reader.spec.ts
    ├── ARIA 레이블
    ├── 대체 텍스트
    └── 시맨틱 마크업
```

---

## 📝 병렬 실행 설정

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  // 병렬 실행 설정
  fullyParallel: true,
  workers: process.env.CI ? 4 : 8, // CI에서는 4개, 로컬에서는 8개 워커

  projects: [
    // 병렬 그룹 A: 읽기 전용
    {
      name: 'group-a-readonly',
      testMatch: /parallel\/group-a.*\.spec\.ts/,
      fullyParallel: true,
    },

    // 병렬 그룹 B: 사용자별 격리
    {
      name: 'group-b-users',
      testMatch: /parallel\/group-b.*\.spec\.ts/,
      fullyParallel: true,
    },

    // 병렬 그룹 C: 예약/결제
    {
      name: 'group-c-bookings',
      testMatch: /parallel\/group-c.*\.spec\.ts/,
      fullyParallel: true,
    },

    // 병렬 그룹 D: 독립 기능
    {
      name: 'group-d-features',
      testMatch: /parallel\/group-d.*\.spec\.ts/,
      fullyParallel: true,
    },

    // 순차 그룹 E: 종단간 테스트
    {
      name: 'group-e-sequential',
      testMatch: /sequential\/group-e.*\.spec\.ts/,
      fullyParallel: false, // 순차 실행
    },

    // 성능 테스트 (별도 실행)
    {
      name: 'performance',
      testMatch: /performance\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-gpu-benchmarking'],
        },
      },
    },
  ],
});
```

### 실행 스크립트 (package.json)
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:parallel": "playwright test --project=group-a-readonly --project=group-b-users --project=group-c-bookings --project=group-d-features",
    "test:e2e:sequential": "playwright test --project=group-e-sequential",
    "test:e2e:performance": "playwright test --project=performance",
    "test:e2e:group-a": "playwright test --project=group-a-readonly",
    "test:e2e:group-b": "playwright test --project=group-b-users",
    "test:e2e:group-c": "playwright test --project=group-c-bookings",
    "test:e2e:group-d": "playwright test --project=group-d-features",
    "test:e2e:ci": "playwright test --project=group-a-readonly --project=group-b-users --project=group-c-bookings --workers=4"
  }
}
```

---

## 🔄 CI/CD 파이프라인 설정

### GitHub Actions (.github/workflows/e2e-tests.yml)
```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 병렬 Job 1: 읽기 전용 테스트
  test-readonly:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e:group-a

  # 병렬 Job 2: 사용자 테스트
  test-users:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e:group-b

  # 병렬 Job 3: 예약/결제 테스트
  test-bookings:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e:group-c

  # 병렬 Job 4: 기능 테스트
  test-features:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e:group-d

  # 순차 실행이 필요한 테스트
  test-sequential:
    runs-on: ubuntu-latest
    needs: [test-readonly, test-users, test-bookings, test-features]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e:sequential
```

---

## 📊 예상 실행 시간

### 병렬 실행 시
- **Group A (읽기 전용)**: ~3분
- **Group B (사용자별)**: ~5분
- **Group C (예약/결제)**: ~7분
- **Group D (기능별)**: ~4분
- **Group E (순차)**: ~10분
- **총 실행 시간**: ~17분 (병렬 최대 7분 + 순차 10분)

### 순차 실행 시
- **총 실행 시간**: ~29분 (모든 그룹 합계)

### 성능 개선
- **병렬 실행으로 약 41% 시간 단축**
- **8개 워커 사용 시 최적 성능**
- **CI 환경에서는 4개 워커로 안정성 우선**

---

## 🔧 테스트 데이터 관리

### 테스트 계정
```typescript
// tests/e2e/fixtures/test-accounts.ts
export const TEST_ACCOUNTS = {
  // Group B1: 일반 사용자
  user1: {
    email: 'test_user_1@vintee.test',
    password: 'TestUser1Pass!',
    name: '테스트사용자1',
  },

  // Group B2: 호스트
  host1: {
    email: 'test_host_1@vintee.test',
    password: 'TestHost1Pass!',
    name: '테스트호스트1',
    businessNumber: '123-45-67890',
  },

  // Group B3: 관리자
  admin: {
    email: 'test_admin@vintee.test',
    password: 'TestAdminPass!',
    name: '테스트관리자',
  },

  // Group C1: 예약자1
  booker1: {
    email: 'test_booker_1@vintee.test',
    password: 'TestBooker1Pass!',
    name: '테스트예약자1',
  },

  // Group C2: 예약자2
  booker2: {
    email: 'test_booker_2@vintee.test',
    password: 'TestBooker2Pass!',
    name: '테스트예약자2',
  },
};
```

### 테스트 숙소
```typescript
// tests/e2e/fixtures/test-properties.ts
export const TEST_PROPERTIES = {
  // Group C1용
  property1: {
    id: 'test_property_1',
    name: '테스트 한옥 1',
    pricePerNight: 80000,
    maxGuests: 4,
  },

  // Group C2용
  property2: {
    id: 'test_property_2',
    name: '테스트 펜션 2',
    pricePerNight: 120000,
    maxGuests: 6,
  },

  // 읽기 전용 테스트용
  readonlyProperty: {
    id: 'test_property_readonly',
    name: '읽기 전용 숙소',
    pricePerNight: 100000,
    maxGuests: 4,
  },
};
```

---

## 🎯 실행 권장 사항

### 개발 환경
```bash
# 특정 그룹만 실행 (빠른 피드백)
npm run test:e2e:group-a  # 읽기 전용 테스트만

# 변경된 파일 관련 테스트만
npx playwright test --only-changed

# UI 모드로 디버깅
npx playwright test --ui
```

### CI/CD 환경
```bash
# 병렬 그룹 실행
npm run test:e2e:ci

# 전체 테스트 (야간 빌드)
npm run test:e2e
```

### 로컬 전체 테스트
```bash
# 모든 병렬 그룹 동시 실행
npm run test:e2e:parallel

# 이후 순차 테스트
npm run test:e2e:sequential
```