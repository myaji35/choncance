# Group B1: 사용자 일반 플로우 E2E 테스트

## 개요

Group B1은 로그인된 일반 사용자의 핵심 플로우를 테스트하는 E2E 테스트 그룹입니다.

### 테스트 목표
- 사용자 인증 (로그인/로그아웃)
- 프로필 관리
- 위시리스트 관리
- 검색 및 필터링
- 알림 시스템

## 파일 구조

```
tests/e2e/parallel/group-b1-user/
├── setup.ts                        # 공유 설정 및 fixture
├── 01-user-auth.spec.ts            # 인증 플로우 테스트
├── 02-user-profile.spec.ts         # 프로필 관리 테스트
├── 03-user-wishlist.spec.ts        # 위시리스트 테스트
├── 04-user-search.spec.ts          # 검색 기능 테스트
├── 05-user-notifications.spec.ts   # 알림 시스템 테스트
└── README.md                        # 이 파일
```

## 테스트 계정

- **이메일**: test_user_1@vintee.test
- **비밀번호**: TestPassword123!
- **사용자명**: 테스트 사용자

## 실행 방법

### 전체 테스트 실행

```bash
# 모든 Group B1 테스트 실행
npm run test:parallel -- --project=group-b1-user

# 또는 Playwright CLI 직접 사용
npx playwright test tests/e2e/parallel/group-b1-user --project=chromium

# 특정 브라우저에서 실행
npx playwright test tests/e2e/parallel/group-b1-user --project=firefox
npx playwright test tests/e2e/parallel/group-b1-user --project=webkit
```

### 개별 테스트 파일 실행

```bash
# 인증 테스트만 실행
npx playwright test tests/e2e/parallel/group-b1-user/01-user-auth.spec.ts

# 프로필 테스트만 실행
npx playwright test tests/e2e/parallel/group-b1-user/02-user-profile.spec.ts

# 위시리스트 테스트만 실행
npx playwright test tests/e2e/parallel/group-b1-user/03-user-wishlist.spec.ts

# 검색 테스트만 실행
npx playwright test tests/e2e/parallel/group-b1-user/04-user-search.spec.ts

# 알림 테스트만 실행
npx playwright test tests/e2e/parallel/group-b1-user/05-user-notifications.spec.ts
```

### UI 모드로 실행

```bash
# 모든 Group B1 테스트를 UI 모드로 실행
npx playwright test tests/e2e/parallel/group-b1-user --ui

# 특정 파일을 UI 모드로 실행
npx playwright test tests/e2e/parallel/group-b1-user/01-user-auth.spec.ts --ui
```

### 디버그 모드로 실행

```bash
# 모든 테스트를 디버그 모드로 실행
PWDEBUG=1 npx playwright test tests/e2e/parallel/group-b1-user

# 특정 파일을 디버그 모드로 실행
PWDEBUG=1 npx playwright test tests/e2e/parallel/group-b1-user/01-user-auth.spec.ts
```

### 특정 테스트만 실행

```bash
# 특정 describe 블록의 테스트만 실행
npx playwright test tests/e2e/parallel/group-b1-user -g "사용자 인증"

# 특정 테스트 케이스만 실행
npx playwright test tests/e2e/parallel/group-b1-user -g "로그인 페이지 접근"
```

## 테스트 구성

### 01-user-auth.spec.ts (268 라인)
사용자 인증 플로우 테스트

**테스트 항목**:
- 로그인 페이지 접근 및 로그인
- 사용자 로그인
- 프로필/위시리스트/예약 페이지 접근 가능성
- 사용자 메뉴 표시
- 로그아웃 기능
- 로그아웃 후 보호된 페이지 접근 불가
- 공개 페이지 로그인 없이 접근 가능
- 탐색/숙소 상세 페이지 로그인 없이 접근 가능
- 세션 유지 확인
- Clerk 인증 UI 렌더링

**테스트 수**: 11개

### 02-user-profile.spec.ts (364 라인)
사용자 프로필 관리 테스트

**테스트 항목**:
- 프로필 페이지 로드 및 기본 정보 표시
- 프로필 이름 수정
- 전화번호 수정
- 소개 텍스트 수정
- 프로필 이미지 업로드
- 변경사항 취소
- 알림 설정 확인
- 개인정보 보호 설정
- 로그아웃 버튼 접근
- 이메일 주소 표시
- 프로필 탭 네비게이션

**테스트 수**: 11개

### 03-user-wishlist.spec.ts (375 라인)
사용자 위시리스트 기능 테스트

**테스트 항목**:
- 위시리스트 페이지 접근 및 로드
- 비어있을 때 메시지 표시
- 숙소 추가 (탐색 페이지에서)
- 숙소 추가 (상세 페이지에서)
- 추가된 숙소 조회
- 숙소 제거
- 여러 항목 관리
- 숙소 상세 보기
- 정렬 기능
- 필터링
- 공유 기능
- 동기화 확인
- 가격 범위 필터

**테스트 수**: 13개

### 04-user-search.spec.ts (414 라인)
사용자 검색 기능 테스트

**테스트 항목**:
- 검색 바 표시
- 텍스트 기반 검색
- 가격 범위 필터
- 태그 기반 필터링
- 다중 태그 필터링
- 저장된 검색 항목 (로그인 사용자)
- 인기도 정렬
- 가격 정렬
- 페이지네이션
- 필터 초기화
- 결과 조회 수 표시
- 위치 기반 검색
- 고급 검색 옵션
- 검색 중 로딩 상태

**테스트 수**: 14개

### 05-user-notifications.spec.ts (450 라인)
사용자 알림 시스템 테스트

**테스트 항목**:
- 알림 벨 아이콘 표시
- 알림 센터 열기
- 알림 목록 표시
- 알림 읽음 표시
- 알림 타입별 필터링
- 예약 관련 알림
- 리뷰 관련 알림
- 메시지 알림
- 시스템 알림
- 알림 삭제
- 모두 읽음 표시
- 알림 설정 페이지
- 이메일 알림 설정
- 푸시 알림 설정
- 읽음 상태 시각적 구분
- 알림 배지 표시
- 알림 페이지네이션

**테스트 수**: 17개

## 병렬 실행

Group B1 테스트는 완전히 병렬 실행 가능합니다:

```bash
# 병렬 설정 파일로 실행
npx playwright test -c tests/e2e/playwright.parallel.config.ts --project=group-b1-user
```

## 테스트 결과

### 리포트 생성
테스트 실행 후 HTML 리포트가 자동으로 생성됩니다:

```bash
# 리포트 보기
npx playwright show-report
```

### 결과 파일
- `playwright-report/`: HTML 리포트
- `test-results/`: JUnit XML 결과
- 스크린샷 및 비디오: 테스트 실패 시에만 저장

## 주요 특징

### 1. Fixture 기반 설정
`setup.ts`에서 공유 fixture 제공:
- `authenticatedPage`: 자동으로 로그인된 페이지
- 테스트 후 자동 로그아웃

### 2. 타이밍 상수
```typescript
TIMEOUTS = {
  NETWORK_IDLE: 3000,
  DIALOG_APPEAR: 2000,
  ANIMATION: 500,
  FORM_SUBMIT: 2000,
  NAVIGATION: 3000,
}
```

### 3. 선택자 상수
일관된 선택자 사용으로 유지보수성 향상:
```typescript
SELECTORS = {
  userMenu: '버튼 선택자',
  wishlistButton: '위시리스트 버튼',
  searchInput: '검색 입력 필드',
  // ... 등등
}
```

### 4. 한국어 처리
- 한국어 텍스트 매칭
- 정규식 기반 로케이터 (/패턴/i)
- 한국어 입력 시뮬레이션

## 주의사항

### 1. 테스트 계정 설정
테스트를 실행하기 전에 테스트 계정이 Clerk 시스템에 등록되어 있어야 합니다:
- 이메일: test_user_1@vintee.test
- 비밀번호: TestPassword123!

### 2. 환경 변수
`.env.test` 파일 확인:
```env
PLAYWRIGHT_BASE_URL=http://localhost:3010
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
```

### 3. 서버 실행
테스트 실행 전 개발 서버가 실행 중이어야 합니다:
```bash
npm run dev
```

### 4. 브라우저 인스턴스
각 테스트는 새로운 브라우저 컨텍스트에서 실행되어 격리됩니다.

## 트러블슈팅

### "로그인 실패" 오류
1. 테스트 계정 존재 확인
2. 비밀번호 정확성 확인
3. Clerk 설정 확인
4. 서버 로그 확인

### 타임아웃 오류
1. 네트워크 속도 확인
2. 타이밍 상수 증가 고려
3. 서버 응답 시간 확인

### 선택자 오류
1. 페이지 구조 확인
2. 선택자 업데이트
3. 로케이터 명시성 확인

## Playwright Best Practices

### 1. 대기 전략
```typescript
// Good: 네트워크 로드 완료 대기
await page.waitForLoadState('networkidle');

// Good: 특정 요소 표시 대기
await expect(element).toBeVisible({ timeout: 5000 });

// Avoid: 고정 시간 대기 (최후의 수단)
await page.waitForTimeout(1000);
```

### 2. 선택자 우선순위
```typescript
// Best: data-testid
page.locator('[data-testid="notification-item"]')

// Good: ARIA 속성
page.locator('[aria-label="알림"]')

// Fair: 텍스트 매칭
page.locator('button:has-text("로그아웃")')

// Avoid: XPath
page.locator('//button[@class="logout"]')
```

### 3. 오류 처리
```typescript
// Good: catch() 사용
const isVisible = await element.isVisible().catch(() => false);

// Good: try-catch
try {
  await element.click();
} catch (error) {
  console.warn('요소를 클릭할 수 없음');
}
```

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Clerk 문서](https://clerk.com/docs)

## 기여

새로운 테스트를 추가할 때:
1. 기존 패턴 준수
2. 한국어 주석 추가
3. setup.ts의 타이밍 상수 사용
4. 테스트 격리 보장
5. README 업데이트
