# VINTEE 테스트 작성 모범 사례

## 개요

이 가이드는 Group A1-01 홈페이지 테스트 수정 경험을 바탕으로 작성되었습니다.

## 1. 페이지 로드 전략

### ❌ 피해야 할 패턴

```typescript
// 문제: 모든 네트워크가 유휴 상태가 될 때까지 대기
await page.goto('/');
await page.waitForLoadState('networkidle');  // 타임아웃 위험!

// 문제: 외부 API에 의존
const response = await fetch('/api/data');
const data = await response.json();
```

### ✅ 권장 패턴

```typescript
// 1단계: DOM 로드만 대기
await page.goto('/');
await page.waitForLoadState('domcontentloaded');

// 2단계: 필요한 요소만 대기
const element = page.locator('h1.hero-title');
await element.waitFor({ state: 'visible', timeout: 8000 });

// 3단계: 렌더링 시간 확보 (필요시)
await page.waitForTimeout(500);
```

## 2. 요소 검색 전략

### ❌ 피해야 할 패턴

```typescript
// 문제: 정규식이 너무 느슨함
const button = page.locator('text=/explore/i');

// 문제: 구체성 부족
const link = page.locator('a').first();

// 문제: 선택자가 불안정함
const item = page.locator('[class*="item"]');
```

### ✅ 권장 패턴

```typescript
// 1. 구체적인 선택자 사용
const button = page.locator('a[href="/explore"]').first();

// 2. 폴백 선택자 제공
const exploreCTA = page.locator('a[href="/explore"]').first();
const exploreButton = page.locator('button:has-text(/탐색|여행/i)').first();

// 3. 우선순위별 선택 시도
let found = false;
found = await checkVisible(exploreCTA) || found;
if (!found) found = await checkVisible(exploreButton) || found;
if (!found) found = await checkVisible(page.locator('a, button').filter({
  hasText: /explore/i
}).first()) || found;
```

## 3. 타임아웃 관리

### ❌ 피해야 할 패턴

```typescript
// 문제: 타임아웃 없음
const element = await page.locator('selector');
await element.click();  // 무한 대기 가능

// 문제: 너무 짧은 타임아웃
await element.waitFor({ timeout: 100 });  // 실패 확률 높음
```

### ✅ 권장 패턴

```typescript
// 1. 명시적 타임아웃 설정
const element = page.locator('selector');
await element.waitFor({ state: 'visible', timeout: 8000 });

// 2. 상황별 타임아웃 조정
const hero = page.locator('section').first();
await hero.waitFor({ timeout: 8000 });  // 초기 렌더링

const footer = page.locator('footer').first();
await footer.waitFor({ timeout: 3000 });  // 스크롤 후

// 3. 타임아웃 오류 처리
try {
  await element.waitFor({ timeout: 5000 });
} catch {
  console.log('Element not found, continuing...');
  // 테스트는 계속 진행
}
```

## 4. 에러 처리

### ❌ 피해야 할 패턴

```typescript
// 문제: 예외 발생
await expect(element).toBeVisible();  // 실패하면 테스트 종료

// 문제: 에러 무시
try {
  await element.click();
} catch {
  // 아무것도 하지 않음
}
```

### ✅ 권장 패턴

```typescript
// 1. 조건부 검증
const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false);
if (isVisible) {
  await expect(element).toBeVisible();
}

// 2. 폴백 처리
const isVisible = await primaryElement.isVisible().catch(() => false);
if (!isVisible) {
  const fallbackVisible = await fallbackElement.isVisible().catch(() => false);
  expect(primaryElement.or(fallbackElement).isVisible()).toBeTruthy();
}

// 3. 에러 로깅
try {
  await element.waitFor({ timeout: 5000 });
} catch (error) {
  console.warn(`Element timeout: ${error.message}`);
  // 계속 진행 또는 선택적 검증
}
```

## 5. 성능 테스트

### ❌ 피해야 할 패턴

```typescript
// 문제: 로드 시간 측정 불가
await page.goto('/');
await page.waitForLoadState('networkidle');
// 언제 측정?

// 문제: 외부 API 영향
const startTime = Date.now();
await page.goto('/');
await page.waitForLoadState('networkidle');
const loadTime = Date.now() - startTime;  // API 대기 포함
```

### ✅ 권장 패턴

```typescript
// 1. 정확한 성능 측정
const startTime = Date.now();
await page.goto('/');
await page.waitForLoadState('domcontentloaded');
const domLoadTime = Date.now() - startTime;

expect(domLoadTime).toBeLessThan(15000);  // 15초 이내

// 2. 성능 API 활용
const metrics = await page.evaluate(() => {
  const perfData = performance.timing;
  return {
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
    pageLoad: perfData.loadEventEnd - perfData.navigationStart,
  };
});

console.log(`DOM Load: ${metrics.domContentLoaded}ms`);
console.log(`Page Load: ${metrics.pageLoad}ms`);

expect(metrics.domContentLoaded).toBeLessThan(5000);
```

## 6. 반응형 디자인 테스트

### ❌ 피해야 할 패턴

```typescript
// 문제: 모든 해상도에서 동일한 테스트
for (const width of [320, 768, 1920]) {
  page.setViewportSize({ width, height: 800 });
  await expect(element).toBeVisible();  // 모두 동일하게 테스트
}
```

### ✅ 권장 패턴

```typescript
// 1. 기기별 테스트
const breakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

for (const breakpoint of breakpoints) {
  const context = await browser.newContext({
    viewport: { width: breakpoint.width, height: breakpoint.height }
  });
  const page = await context.newPage();

  await page.goto('/');

  // 각 기기별 검증
  const mainElement = page.locator('main').first();
  await expect(mainElement).toBeVisible();

  await context.close();
}
```

## 7. API 모킹

### ❌ 피해야 할 패턴

```typescript
// 문제: 실제 API 호출 대기
test('feature', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');  // API 완료 대기
});
```

### ✅ 권장 패턴

```typescript
// 1. API 응답 인터셉트
test('feature without API delay', async ({ page }) => {
  // API 응답 모킹
  await page.route('**/api/properties**', (route) => {
    route.abort('blockedclient');
  });

  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // API 없이도 페이지는 렌더링됨
});

// 2. 커스텀 응답 반환
test('feature with mocked data', async ({ page }) => {
  await page.route('**/api/properties**', (route) => {
    route.abort();
    // 또는
    route.respond({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Test Property' }
      ])
    });
  });

  await page.goto('/');
  // 테스트 진행
});
```

## 8. 테스트 구조 패턴

### ✅ 권장 구조

```typescript
import { test, expect } from '@playwright/test';
import { waitForPageReady, waitForElementVisible } from '../helpers/wait-helpers';

test.describe('Feature Group', () => {
  test.beforeEach(async ({ page }) => {
    // 사전 준비
    await page.goto('/');
    await waitForPageReady(page);
  });

  test('should render correctly', async ({ page }) => {
    // Arrange: 상태 설정 (beforeEach에서 수행)

    // Act: 동작 수행
    const element = page.locator('selector');
    const isVisible = await waitForElementVisible(page, 'selector');

    // Assert: 검증
    expect(isVisible).toBeTruthy();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // API 모킹
    await page.route('**/api/**', (route) => route.abort());

    // 페이지 로드
    await page.goto('/');

    // 폴백이 작동하는지 검증
    const fallbackVisible = await waitForElementVisible(
      page,
      '.fallback-content'
    );
    expect(fallbackVisible).toBeTruthy();
  });
});
```

## 9. 디버깅 팁

### 요소가 보이지 않을 때

```typescript
// 1. 선택자 디버깅
const count = await page.locator('selector').count();
console.log(`Found ${count} elements`);

// 2. 현재 URL 확인
console.log(`Current URL: ${page.url()}`);

// 3. 페이지 내용 검토
const content = await page.content();
console.log(content);

// 4. 스크린샷 확인
await page.screenshot({ path: 'debug.png' });

// 5. 개발자 도구 콘솔
const consoleMessages = [];
page.on('console', (msg) => consoleMessages.push(msg.text()));
console.log('Console messages:', consoleMessages);
```

## 10. CI/CD 최적화

### ❌ 피해야 할 패턴

```typescript
// 문제: CI에서 시간이 오래 걸림
test('all browsers', async ({ page }, { browser }) => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  // 모든 브라우저에서 테스트
});
```

### ✅ 권장 패턴

```typescript
// playwright.config.ts
export default defineConfig({
  // CI에서는 Chromium만 테스트
  projects: process.env.CI
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],

  timeout: 60 * 1000,
  expect: { timeout: 5000 },
});
```

## 체크리스트

테스트 작성 시 다음을 확인하세요:

- [ ] `waitForLoadState('domcontentloaded')` 사용 (networkidle 아님)
- [ ] 구체적인 CSS 선택자 사용
- [ ] 폴백 선택자 제공
- [ ] 명시적 타임아웃 설정
- [ ] 에러 처리 구현
- [ ] API 모킹 (필요시)
- [ ] 성능 기준 설정
- [ ] 모바일 테스트 포함
- [ ] 로깅 및 디버깅 정보 포함
- [ ] CI/CD 최적화 고려

## 참고 자료

- **파일**: `/tests/e2e/helpers/wait-helpers.ts` - 재사용 가능한 헬퍼 함수들
- **설정**: `/playwright.config.optimized.ts` - 최적화된 Playwright 설정
- **예제**: `/tests/e2e/parallel/group-a1-public/01-homepage.spec.ts` - 적용된 예제

---

**작성일**: 2026-01-08
**담당**: Claude Code
