/**
 * Group B1 사용자 플로우 테스트 - 공유 설정
 *
 * 테스트 계정 및 환경 설정
 * - 테스트 사용자: test_user_1@vintee.test
 * - Clerk 인증 시스템 사용
 * - 병렬 실행 가능한 독립적인 테스트 계정
 */

import { test as base, Page } from '@playwright/test';

export type TestFixtures = {
  authenticatedPage: Page;
};

/**
 * 인증된 페이지 Fixture
 * 테스트마다 새로운 페이지를 생성하고 사용자로 로그인합니다.
 */
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Clerk 토큰 설정 (실제 환경에서는 테스트 용 세션 활용)
    // 개발 환경에서 테스트 계정으로 직접 로그인
    await loginAsTestUser(page, 'test_user_1@vintee.test');

    // 테스트에서 사용
    await use(page);

    // 정리: 로그아웃
    await logoutUser(page);
  },
});

/**
 * 테스트 사용자로 로그인
 * @param page Playwright Page 객체
 * @param email 사용자 이메일
 */
export async function loginAsTestUser(page: Page, email: string) {
  try {
    // 로그인 페이지 접근
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Clerk 로그인 UI 로딩 대기
    await page.waitForTimeout(2000);

    // 이메일 입력 (Clerk의 기본 로그인 플로우)
    const emailInput = page.locator('input[type="email"]');

    // Clerk 구성에 따라 여러 시도
    if (await emailInput.count() > 0) {
      await emailInput.fill(email);
      await page.waitForTimeout(500);

      // 다음 버튼 또는 로그인 버튼 클릭
      const nextButton = page.locator('button').filter({
        hasText: /다음|계속|Sign in|Next|Continue/i
      });

      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(1000);
      }

      // 비밀번호 입력 필드가 있을 경우
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.count() > 0) {
        // 테스트 환경 비밀번호 (프로젝트 설정에 따라 변경)
        await passwordInput.fill('TestPassword123!');
        await page.waitForTimeout(500);

        // 로그인 버튼 클릭
        const submitButton = page.locator('button').filter({
          hasText: /로그인|Sign in|Login|제출/i
        });

        if (await submitButton.count() > 0) {
          await submitButton.first().click();
        }
      }
    }

    // 로그인 완료 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.error(`로그인 실패: ${email}`, error);
    throw error;
  }
}

/**
 * 사용자 로그아웃
 * @param page Playwright Page 객체
 */
export async function logoutUser(page: Page) {
  try {
    // 프로필 메뉴 또는 로그아웃 버튼 찾기
    const userMenu = page.locator('button, a').filter({
      hasText: /프로필|계정|로그아웃|Sign out|Logout/i
    });

    if (await userMenu.count() > 0) {
      await userMenu.first().click();
      await page.waitForTimeout(500);

      // 로그아웃 버튼 클릭
      const logoutButton = page.locator('button, a').filter({
        hasText: /로그아웃|Sign out|Logout/i
      });

      if (await logoutButton.count() > 0) {
        await logoutButton.first().click();
        await page.waitForLoadState('networkidle');
      }
    }
  } catch (error) {
    console.warn('로그아웃 중 오류:', error);
    // 로그아웃 실패는 치명적이지 않으므로 무시
  }
}

/**
 * 테스트 사용자 정보
 */
export const TEST_USER = {
  email: 'test_user_1@vintee.test',
  password: 'TestPassword123!',
  name: '테스트 사용자',
  phone: '010-1234-5678',
};

/**
 * 테스트 데이터
 */
export const TEST_DATA = {
  // 위시리스트 테스트용 숙소 ID
  propertyIds: [
    '1', // 첫 번째 테스트 숙소
    '2', // 두 번째 테스트 숙소
  ],

  // 검색 테스트용 키워드
  searchKeywords: [
    { query: '시골', expected: 'results' },
    { query: '펜션', expected: 'results' },
    { query: '한옥', expected: 'results' },
  ],

  // 알림 테스트용 데이터
  notifications: {
    types: ['booking', 'review', 'message', 'system'],
  },

  // 프로필 업데이트 테스트 데이터
  profileUpdate: {
    name: '업데이트된 사용자 이름',
    phone: '010-9876-5432',
    bio: '빈티 여행을 즐기는 사용자입니다.',
  },
};

/**
 * 타이밍 상수
 */
export const TIMEOUTS = {
  NETWORK_IDLE: 3000,
  DIALOG_APPEAR: 2000,
  ANIMATION: 500,
  FORM_SUBMIT: 2000,
  NAVIGATION: 3000,
};

/**
 * 선택자 상수
 */
export const SELECTORS = {
  // 네비게이션
  userMenu: 'button:has-text("프로필"), button:has-text("계정")',
  logoutButton: 'button:has-text("로그아웃")',

  // 위시리스트
  wishlistButton: 'button:has-text("위시리스트"), button[aria-label*="위시리스트"]',
  wishlistItem: '[data-testid="wishlist-item"]',
  removeWishlistButton: 'button:has-text("제거"), button:has-text("삭제")',

  // 검색
  searchInput: 'input[placeholder*="검색"], input[aria-label*="검색"]',
  searchButton: 'button:has-text("검색")',
  filterButton: 'button:has-text("필터"), button[aria-label*="필터"]',

  // 알림
  notificationBell: 'button[aria-label*="알림"], button:has-text("알림")',
  notificationItem: '[data-testid="notification-item"]',
  markAsReadButton: 'button:has-text("읽음")',

  // 프로필
  profileForm: '[data-testid="profile-form"]',
  nameInput: 'input[name="name"]',
  phoneInput: 'input[name="phone"]',
  bioInput: 'textarea[name="bio"]',
  saveButton: 'button:has-text("저장"), button:has-text("업데이트")',

  // 공통
  loadingSpinner: '[role="status"], [aria-busy="true"]',
  successMessage: '[role="alert"]:has-text("성공"), [role="alert"]:has-text("완료")',
  errorMessage: '[role="alert"]:has-text("오류"), [role="alert"]:has-text("실패")',
};
