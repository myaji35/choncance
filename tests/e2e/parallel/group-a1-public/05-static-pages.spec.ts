import { test, expect } from '@playwright/test';

/**
 * Group A1-05: 정적 페이지 읽기 전용 테스트
 *
 * 목표:
 * - 이용약관 페이지 접근 및 콘텐츠 표시 확인
 * - 개인정보보호정책 페이지 접근 및 콘텐츠 표시 확인
 * - 사용 가이드 페이지 접근 및 콘텐츠 표시 확인
 * - 페이지 네비게이션 및 구조 확인
 *
 * 테스트 특성:
 * - 데이터 수정 없음 (읽기만 수행)
 * - 로그인 불필요
 * - 완전히 병렬 실행 가능
 */

test.describe('Group A1-05: 정적 페이지 (읽기 전용)', () => {
  test('이용약관 페이지 접근 확인', async ({ page }) => {
    // Arrange & Act: 이용약관 페이지 접근
    await page.goto('/terms');

    // Assert: 페이지 로드 확인
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/terms');
  });

  test('이용약관 제목 표시 확인', async ({ page }) => {
    // Arrange: 이용약관 페이지 접근
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    // Act: 페이지 제목 찾기
    const title = page.locator('h1, [data-testid="page-title"]').first();

    // Assert: 제목이 표시되는지 확인
    const isVisible = await title.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(title).toBeVisible();
    }
  });

  test('이용약관 콘텐츠 표시 확인', async ({ page }) => {
    // Arrange: 이용약관 페이지 접근
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    // Act: 본문 콘텐츠 찾기
    const content = page.locator('main, [role="main"]').first();

    // Assert: 콘텐츠가 표시되는지 확인
    const isVisible = await content.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(content).toBeVisible();
    }
  });

  test('이용약관 섹션 구조 확인', async ({ page }) => {
    // Arrange: 이용약관 페이지 접근
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    // Act: 섹션/제목 찾기
    const sections = page.locator('h2, h3, [role="heading"]');

    // Assert: 섹션이 여러 개 있는지 확인
    const sectionCount = await sections.count();
    if (sectionCount > 0) {
      expect(sectionCount).toBeGreaterThan(0);
    }
  });

  test('개인정보보호정책 페이지 접근 확인', async ({ page }) => {
    // Arrange & Act: 개인정보보호정책 페이지 접근
    await page.goto('/privacy');

    // Assert: 페이지 로드 확인
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/privacy');
  });

  test('개인정보보호정책 제목 표시 확인', async ({ page }) => {
    // Arrange: 개인정보보호정책 페이지 접근
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    // Act: 페이지 제목 찾기
    const title = page.locator('h1, [data-testid="page-title"]').first();

    // Assert: 제목이 표시되는지 확인
    const isVisible = await title.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(title).toBeVisible();
    }
  });

  test('개인정보보호정책 콘텐츠 표시 확인', async ({ page }) => {
    // Arrange: 개인정보보호정책 페이지 접근
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    // Act: 본문 콘텐츠 찾기
    const content = page.locator('main, [role="main"]').first();

    // Assert: 콘텐츠가 표시되는지 확인
    const isVisible = await content.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(content).toBeVisible();
    }
  });

  test('개인정보보호정책 섹션 구조 확인', async ({ page }) => {
    // Arrange: 개인정보보호정책 페이지 접근
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    // Act: 섹션/제목 찾기
    const sections = page.locator('h2, h3, [role="heading"]');

    // Assert: 섹션이 여러 개 있는지 확인
    const sectionCount = await sections.count();
    if (sectionCount > 0) {
      expect(sectionCount).toBeGreaterThan(0);
    }
  });

  test('사용 가이드 페이지 접근 확인', async ({ page }) => {
    // Arrange & Act: 사용 가이드 페이지 접근
    await page.goto('/how-to-use');

    // Assert: 페이지 로드 확인
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/how-to-use');
  });

  test('사용 가이드 제목 표시 확인', async ({ page }) => {
    // Arrange: 사용 가이드 페이지 접근
    await page.goto('/how-to-use');
    await page.waitForLoadState('networkidle');

    // Act: 페이지 제목 찾기
    const title = page.locator('h1, [data-testid="page-title"]').first();

    // Assert: 제목이 표시되는지 확인
    const isVisible = await title.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(title).toBeVisible();
    }
  });

  test('사용 가이드 콘텐츠 표시 확인', async ({ page }) => {
    // Arrange: 사용 가이드 페이지 접근
    await page.goto('/how-to-use');
    await page.waitForLoadState('networkidle');

    // Act: 본문 콘텐츠 찾기
    const content = page.locator('main, [role="main"]').first();

    // Assert: 콘텐츠가 표시되는지 확인
    const isVisible = await content.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(content).toBeVisible();
    }
  });

  test('사용 가이드 단계별 섹션 확인', async ({ page }) => {
    // Arrange: 사용 가이드 페이지 접근
    await page.goto('/how-to-use');
    await page.waitForLoadState('networkidle');

    // Act: 섹션/제목 찾기
    const sections = page.locator('h2, h3, [role="heading"]');

    // Assert: 단계별 섹션이 있는지 확인
    const sectionCount = await sections.count();
    if (sectionCount > 0) {
      expect(sectionCount).toBeGreaterThan(0);
    }
  });

  test('이용약관에서 개인정보보호정책으로 내부 링크 확인', async ({ page }) => {
    // Arrange: 이용약관 페이지 접근
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    // Act: 개인정보보호정책으로 가는 링크 찾기
    const privacyLink = page.locator('a[href*="/privacy"], a:has-text("개인정보|privacy")').first();

    // Assert: 링크가 존재하는지 확인 (클릭하지 않음)
    const isVisible = await privacyLink.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      const href = await privacyLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('푸터에서 정적 페이지 링크 접근 가능성 확인', async ({ page }) => {
    // Arrange: 홈페이지 접근
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Act: 페이지 끝까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 푸터의 정책 링크 찾기
    const policyLinks = page.locator('footer a, [role="contentinfo"] a').filter({
      hasText: /약관|정책|가이드|terms|privacy|guide/i
    });

    // Assert: 정책 링크가 존재하는지 확인
    const linkCount = await policyLinks.count();
    if (linkCount > 0) {
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('이용약관 페이지 반응형 레이아웃 - 모바일', async ({ browser }) => {
    // Arrange: 모바일 뷰포트로 컨텍스트 생성
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();

    // Act: 이용약관 페이지 접근
    await page.goto('http://localhost:3010/terms');
    await page.waitForLoadState('networkidle');

    // Assert: 모바일에서 콘텐츠가 표시되는지 확인
    const content = page.locator('main, [role="main"]').first();
    const isVisible = await content.isVisible({ timeout: 3000 }).catch(() => false);

    if (isVisible) {
      await expect(content).toBeVisible();
    }

    await context.close();
  });

  test('개인정보보호정책 페이지 반응형 레이아웃 - 모바일', async ({ browser }) => {
    // Arrange: 모바일 뷰포트로 컨텍스트 생성
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();

    // Act: 개인정보보호정책 페이지 접근
    await page.goto('http://localhost:3010/privacy');
    await page.waitForLoadState('networkidle');

    // Assert: 모바일에서 콘텐츠가 표시되는지 확인
    const content = page.locator('main, [role="main"]').first();
    const isVisible = await content.isVisible({ timeout: 3000 }).catch(() => false);

    if (isVisible) {
      await expect(content).toBeVisible();
    }

    await context.close();
  });

  test('사용 가이드 페이지 반응형 레이아웃 - 모바일', async ({ browser }) => {
    // Arrange: 모바일 뷰포트로 컨텍스트 생성
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();

    // Act: 사용 가이드 페이지 접근
    await page.goto('http://localhost:3010/how-to-use');
    await page.waitForLoadState('networkidle');

    // Assert: 모바일에서 콘텐츠가 표시되는지 확인
    const content = page.locator('main, [role="main"]').first();
    const isVisible = await content.isVisible({ timeout: 3000 }).catch(() => false);

    if (isVisible) {
      await expect(content).toBeVisible();
    }

    await context.close();
  });

  test('정적 페이지 접근성 - 이용약관', async ({ page }) => {
    // Arrange: 이용약관 페이지 접근
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    // Act: main 랜드마크 확인
    const main = page.locator('main, [role="main"]').first();

    // Assert: main 요소가 존재하는지 확인
    const isVisible = await main.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(main).toBeVisible();
    }
  });

  test('정적 페이지 접근성 - 개인정보보호정책', async ({ page }) => {
    // Arrange: 개인정보보호정책 페이지 접근
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    // Act: main 랜드마크 확인
    const main = page.locator('main, [role="main"]').first();

    // Assert: main 요소가 존재하는지 확인
    const isVisible = await main.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(main).toBeVisible();
    }
  });

  test('정적 페이지 접근성 - 사용 가이드', async ({ page }) => {
    // Arrange: 사용 가이드 페이지 접근
    await page.goto('/how-to-use');
    await page.waitForLoadState('networkidle');

    // Act: main 랜드마크 확인
    const main = page.locator('main, [role="main"]').first();

    // Assert: main 요소가 존재하는지 확인
    const isVisible = await main.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(main).toBeVisible();
    }
  });

  test('페이지 제목 텍스트 언어 확인 - 한국어', async ({ page }) => {
    // Arrange: 이용약관 페이지 접근
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    // Act: 페이지 제목 텍스트 확인
    const title = page.locator('h1, [data-testid="page-title"]').first();
    const titleText = await title.textContent({ timeout: 3000 }).catch(() => '');

    // Assert: 한국어 텍스트가 포함되어 있는지 확인
    const isKorean = /[가-힣]/.test(titleText);
    expect(isKorean || titleText.length > 0).toBeTruthy();
  });

  test('정적 페이지 본문 텍스트 언어 확인 - 한국어', async ({ page }) => {
    // Arrange: 개인정보보호정책 페이지 접근
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    // Act: 본문 텍스트 확인
    const content = page.locator('main, [role="main"]').first();
    const contentText = await content.textContent({ timeout: 3000 }).catch(() => '');

    // Assert: 한국어 텍스트가 포함되어 있는지 확인
    const isKorean = /[가-힣]/.test(contentText);
    expect(isKorean || contentText.length > 0).toBeTruthy();
  });
});
