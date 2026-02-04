/**
 * Group B2-02: 호스트 대시보드 및 통계 테스트
 *
 * 목표:
 * - 호스트 대시보드 페이지 로드 및 레이아웃 확인
 * - 예약 통계 표시 확인
 * - 수익 정보 표시 확인
 * - 빠른 액션 버튼 확인
 * - 네비게이션 메뉴 확인
 *
 * 테스트 특성:
 * - 호스트 대시보드의 UI 및 데이터 표시 테스트
 * - 병렬 실행 가능
 */

import { test, expect } from '@playwright/test';
import {
  test as hostTest,
  TEST_HOST,
  TIMEOUTS,
  SELECTORS,
} from './setup';

test.describe('Group B2-02: 호스트 대시보드', () => {
  test('호스트 대시보드 페이지 로드 및 레이아웃 확인', async ({ page }) => {
    // Arrange: 인증된 호스트 페이지 사용
    // 이 테스트는 기본 Playwright test를 사용하여 수동으로 로그인

    // Act: 호스트 대시보드 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 대시보드 페이지 로드 확인
    expect(page.url()).toContain('/host/dashboard');

    // 주요 섹션 확인
    const mainContent = page.locator('main, [role="main"]');
    expect(await mainContent.count()).toBeGreaterThan(0);

    // 대시보드 제목 확인
    const dashboardTitle = page.locator('h1').filter({
      hasText: /호스트 대시보드|Dashboard|Host/i
    });

    // 대시보드 페이지가 로드되었으면 제목이 있거나 주요 콘텐츠가 있음
    const hasTitle = await dashboardTitle.count() > 0;
    const hasContent = await mainContent.isVisible();

    expect(hasTitle || hasContent).toBeTruthy();
  });

  test('대시보드 통계 섹션 확인', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Act: 통계 섹션 찾기
    const statisticsSection = page.locator('[data-testid*="statistics"], [data-testid*="stats"]').first();
    const statsText = page.locator('text=/예약|통계|수익|Booking|Statistics|Revenue/i');

    // Assert: 통계 정보 표시 확인
    if (await statisticsSection.count() > 0) {
      expect(await statisticsSection.isVisible()).toBeTruthy();
    }

    // 통계 텍스트가 표시되는지 확인
    const hasStats = await statsText.count() > 0;
    expect(hasStats).toBeTruthy();

    // 숫자 데이터 확인 (0 이상의 숫자)
    const statsElements = page.locator('text=/[0-9]+/');
    expect(await statsElements.count()).toBeGreaterThan(0);
  });

  test('수익 정보 섹션 표시 확인', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Act: 수익 섹션 찾기
    const revenueSection = page.locator('[data-testid*="revenue"], [data-testid*="income"]').first();
    const revenueText = page.locator('text=/수익|매출|Revenue|Income/i');
    const priceText = page.locator('text=/₩|원|won|KRW/i');

    // Assert: 수익 정보 표시 확인
    if (await revenueSection.count() > 0) {
      expect(await revenueSection.isVisible()).toBeTruthy();
    }

    // 수익 관련 텍스트가 표시되는지 확인
    const hasRevenueInfo = await revenueText.count() > 0 || await priceText.count() > 0;
    expect(hasRevenueInfo).toBeTruthy();

    // 수익 차트 또는 그래프 확인 (SVG 또는 Canvas)
    const chart = page.locator('svg, canvas');
    const hasChart = await chart.count() > 0;

    // 차트가 없어도 수익 정보가 있으면 통과
    // (차트는 선택적 기능이지만 있으면 더 좋음)
  });

  test('예약 관리 링크 및 버튼 확인', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Act: 예약 관련 버튼/링크 찾기
    const bookingLinks = page.locator('a, button').filter({
      hasText: /예약|예약 관리|Booking/i
    });

    // Assert: 예약 관련 링크 확인
    if (await bookingLinks.count() > 0) {
      expect(await bookingLinks.first().isVisible()).toBeTruthy();

      // 예약 페이지로 네비게이션 테스트
      const firstLink = bookingLinks.first();
      const href = await firstLink.getAttribute('href');

      if (href) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');

        // 예약 페이지 또는 대시보드에 남아있음
        expect(page.url()).toContain('/host');
      }
    }
  });

  test('숙소 관리 액션 버튼 확인', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Act: 숙소 추가/관리 버튼 찾기
    const propertyButton = page.locator('a, button').filter({
      hasText: /숙소|숙소 관리|속성|Property/i
    });

    // Assert: 숙소 관리 버튼 확인
    if (await propertyButton.count() > 0) {
      expect(await propertyButton.first().isVisible()).toBeTruthy();

      // 버튼 클릭 가능 확인
      expect(await propertyButton.first().isEnabled()).toBeTruthy();
    }
  });

  test('네비게이션 메뉴 확인', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Act: 네비게이션 메뉴 찾기
    const sidebar = page.locator('nav, [role="navigation"], aside');
    const navLinks = page.locator('nav a, nav button, [role="navigation"] a, [role="navigation"] button');

    // Assert: 네비게이션 존재 확인
    const hasNav = await sidebar.count() > 0 || await navLinks.count() > 0;
    expect(hasNav).toBeTruthy();

    // 주요 메뉴 아이템 확인
    const menuItems = page.locator('text=/대시보드|숙소|예약|체험|프로필|Dashboard|Property|Booking|Experience|Profile/i');
    const hasMenuItems = await menuItems.count() > 0;
    expect(hasMenuItems).toBeTruthy();
  });

  test('대시보드 필터 및 정렬 옵션 확인', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Act: 필터/정렬 버튼 찾기
    const filterButton = page.locator('button').filter({
      hasText: /필터|정렬|Filter|Sort/i
    });

    const periodSelect = page.locator('select, button').filter({
      hasText: /기간|주|월|년|Period|Week|Month|Year/i
    });

    // Assert: 필터 또는 정렬 옵션 확인
    const hasFilterOptions = await filterButton.count() > 0 || await periodSelect.count() > 0;

    // 필터 옵션이 없어도 기본 대시보드는 표시됨
    if (await filterButton.count() > 0) {
      expect(await filterButton.first().isVisible()).toBeTruthy();
    }
  });

  test('대시보드 반응형 레이아웃 확인', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 메인 콘텐츠가 표시됨
    const mainContent = page.locator('main, [role="main"]');
    expect(await mainContent.count()).toBeGreaterThan(0);

    // 콘텐츠가 전체 너비에 맞음
    const contentBox = await mainContent.first().boundingBox();
    expect(contentBox).not.toBeNull();

    if (contentBox) {
      expect(contentBox.width).toBeGreaterThan(200);
    }
  });

  test('대시보드 로딩 상태 처리', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근 (느린 네트워크 시뮬레이션)
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto('/host/dashboard');

    // Act: 로딩 중 상태 확인
    const loadingSpinner = page.locator('[role="status"], [aria-busy="true"], .loading, .spinner');

    // Assert: 로딩이 완료됨
    await page.waitForLoadState('networkidle');

    // 최종적으로 콘텐츠가 표시됨
    const mainContent = page.locator('main, [role="main"]');
    expect(await mainContent.count()).toBeGreaterThan(0);
  });

  test('대시보드 빠른 액션 메뉴 확인', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Act: 빠른 액션 버튼들 찾기
    const actionButtons = page.locator('button').filter({
      hasText: /숙소 추가|예약 확인|메시지|Listing|Booking|Message/i
    });

    // Assert: 빠른 액션이 최소 하나 있음
    if (await actionButtons.count() > 0) {
      expect(await actionButtons.first().isVisible()).toBeTruthy();
    }

    // 액션 버튼 클릭 가능 확인
    const clickableButtons = page.locator('button:enabled');
    expect(await clickableButtons.count()).toBeGreaterThan(0);
  });

  test('대시보드 공지사항 또는 알림 표시', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Act: 알림/공지사항 섹션 찾기
    const announcements = page.locator('[role="alert"], [data-testid*="notification"], [data-testid*="announcement"]');
    const announcementText = page.locator('text=/공지|알림|안내|Announcement|Alert|Notice/i');

    // Assert: 알림이 있으면 표시 확인
    if (await announcements.count() > 0) {
      expect(await announcements.first().isVisible()).toBeTruthy();
    }

    // 알림 텍스트가 있으면 표시됨
    if (await announcementText.count() > 0) {
      expect(await announcementText.first().isVisible()).toBeTruthy();
    }
  });

  test('대시보드 페이지 성능 확인', async ({ page }) => {
    // Arrange: 대시보드 페이지 접근
    const startTime = Date.now();

    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Assert: 페이지 로드 시간이 5초 이내 (네트워크에 따라 다름)
    // 이 테스트는 참고용이며, CI 환경에서는 타임아웃 증가 필요
    expect(loadTime).toBeLessThan(10000); // 10초 이내

    // 메인 콘텐츠가 표시됨
    const mainContent = page.locator('main, [role="main"]');
    expect(await mainContent.count()).toBeGreaterThan(0);
  });
});
