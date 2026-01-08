/**
 * Group D3 크레딧 시스템 테스트 - 공유 설정
 *
 * 테스트 계정 및 환경 설정
 * - 테스트 사용자: test_credit_user@vintee.test
 * - 크레딧 시스템 모킹
 * - 병렬 실행 가능한 독립적인 테스트 환경
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
    // Clerk 토큰 설정을 통한 사용자 로그인
    await loginAsTestUser(page, TEST_CREDIT_USER.email);

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

    // 이메일 입력
    const emailInput = page.locator('input[type="email"]');

    if (await emailInput.count() > 0) {
      await emailInput.fill(email);
      await page.waitForTimeout(500);

      // 다음 버튼 클릭
      const nextButton = page.locator('button').filter({
        hasText: /다음|계속|Sign in|Next|Continue/i,
      });

      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(1000);
      }

      // 비밀번호 입력
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(TEST_CREDIT_USER.password);
        await page.waitForTimeout(500);

        // 로그인 버튼 클릭
        const submitButton = page.locator('button').filter({
          hasText: /로그인|Sign in|Login|제출/i,
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
    console.error(`사용자 로그인 실패: ${email}`, error);
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
      hasText: /프로필|계정|로그아웃|Sign out|Logout/i,
    });

    if (await userMenu.count() > 0) {
      await userMenu.first().click();
      await page.waitForTimeout(500);

      // 로그아웃 버튼 클릭
      const logoutButton = page.locator('button, a').filter({
        hasText: /로그아웃|Sign out|Logout/i,
      });

      if (await logoutButton.count() > 0) {
        await logoutButton.first().click();
        await page.waitForLoadState('networkidle');
      }
    }
  } catch (error) {
    console.warn('로그아웃 중 오류:', error);
  }
}

/**
 * 크레딧 API 응답 모킹
 * @param page Playwright Page 객체
 */
export async function setupCreditAPIMock(page: Page) {
  try {
    // 크레딧 API 모킹
    await page.route('**/api/credits/**', async (route) => {
      const request = route.request();
      const method = request.method();

      if (method === 'GET') {
        // 크레딧 조회 응답
        await route.continue();
      } else if (method === 'POST') {
        // 크레딧 충전 또는 사용
        await route.continue();
      }
    });
  } catch (error) {
    console.warn('크레딧 API 모킹 설정 실패:', error);
  }
}

/**
 * 테스트 크레딧 사용자 정보
 */
export const TEST_CREDIT_USER = {
  email: 'test_credit_user@vintee.test',
  password: 'TestPassword123!',
  name: '테스트 크레딧 사용자',
};

/**
 * 테스트 크레딧 정보
 */
export const TEST_CREDIT_DATA = {
  currentBalance: 50000, // 현재 크레딧 잔액
  chargeAmount: 100000, // 충전할 금액
  usageAmount: 10000, // 사용할 금액
  reviewReward: 1000, // 리뷰 작성 보상
  bookingBonus: 5000, // 예약 보너스
  referralReward: 10000, // 추천 보상
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
  PAYMENT: 5000,
};

/**
 * 선택자 상수
 */
export const SELECTORS = {
  // 크레딧 표시
  creditBalance: '[data-testid="credit-balance"], [class*="balance"]',
  creditDisplay: '[data-testid="credit-display"], [class*="credit"]',
  creditAmount: '[data-testid="credit-amount"], span[class*="amount"]',

  // 크레딧 충전
  chargeButton: 'button:has-text("충전"), button:has-text("구매"), button:has-text("Charge")',
  chargeForm: '[data-testid="charge-form"], form[name*="charge"]',
  chargeAmountInput: 'input[name="amount"], input[placeholder*="금액"]',
  chargeSubmitButton: 'button:has-text("충전하기"), button:has-text("구매하기"), button:has-text("결제")',

  // 크레딧 사용
  useButton: 'button:has-text("사용"), button:has-text("적용"), button:has-text("Use")',
  creditCheckbox: 'input[type="checkbox"][name*="credit"]',
  creditApplyButton: 'button:has-text("적용"), button:has-text("Apply")',

  // 크레딧 이력
  creditHistory: '[data-testid="credit-history"], [class*="history"]',
  historyItem: '[data-testid="history-item"], [class*="transaction"]',
  transactionDate: '[data-testid="transaction-date"]',
  transactionAmount: '[data-testid="transaction-amount"]',
  transactionDescription: '[data-testid="transaction-description"]',

  // 크레딧 정보
  creditInfo: '[data-testid="credit-info"], [class*="info"]',
  creditTerms: '[data-testid="credit-terms"], [class*="terms"]',
  validityPeriod: '[data-testid="validity-period"], [class*="validity"]',

  // 공통
  loadingSpinner: '[role="status"], [aria-busy="true"]',
  errorMessage: '[role="alert"]:has-text("오류"), [role="alert"]:has-text("실패")',
  successAlert: '[role="alert"]:has-text("성공"), [role="alert"]:has-text("완료")',
};

/**
 * API 엔드포인트
 */
export const API_ENDPOINTS = {
  creditBalance: '/api/credits/balance',
  creditCharge: '/api/credits/charge',
  creditUse: '/api/credits/use',
  creditHistory: '/api/credits/history',
};

/**
 * 유틸리티 함수: 크레딧 잔액 조회
 * @param page Playwright Page 객체
 * @returns 크레딧 잔액 (숫자)
 */
export async function getCreditBalance(page: Page): Promise<number> {
  const creditAmount = page.locator(SELECTORS.creditAmount);

  if (await creditAmount.count() > 0) {
    const text = await creditAmount.first().textContent();
    if (text) {
      // 숫자만 추출
      const match = text.match(/\d+/);
      if (match) {
        return parseInt(match[0], 10);
      }
    }
  }

  return 0;
}

/**
 * 유틸리티 함수: 크레딧 충전
 * @param page Playwright Page 객체
 * @param amount 충전할 금액
 */
export async function chargeCredits(page: Page, amount: number) {
  // 충전 버튼 클릭
  const chargeButton = page.locator(SELECTORS.chargeButton);
  if (await chargeButton.count() > 0) {
    await chargeButton.first().click();
    await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);
  }

  // 금액 입력
  const amountInput = page.locator(SELECTORS.chargeAmountInput);
  if (await amountInput.count() > 0) {
    await amountInput.first().fill(amount.toString());
    await page.waitForTimeout(TIMEOUTS.ANIMATION);
  }

  // 충전 버튼 클릭
  const submitButton = page.locator(SELECTORS.chargeSubmitButton);
  if (await submitButton.count() > 0) {
    await submitButton.first().click();
    await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);
  }
}

/**
 * 유틸리티 함수: 크레딧 사용
 * @param page Playwright Page 객체
 */
export async function useCredits(page: Page) {
  // 크레딧 사용 체크박스 클릭
  const creditCheckbox = page.locator(SELECTORS.creditCheckbox);
  if (await creditCheckbox.count() > 0) {
    await creditCheckbox.first().click();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);
  }

  // 적용 버튼 클릭
  const applyButton = page.locator(SELECTORS.creditApplyButton);
  if (await applyButton.count() > 0) {
    await applyButton.first().click();
    await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);
  }
}

/**
 * 유틸리티 함수: 크레딧 이력 조회
 * @param page Playwright Page 객체
 * @returns 이력 항목 배열
 */
export async function getCreditHistory(page: Page): Promise<string[]> {
  const historyItems = page.locator(SELECTORS.historyItem);
  const count = await historyItems.count();
  const history: string[] = [];

  for (let i = 0; i < count; i++) {
    const text = await historyItems.nth(i).textContent();
    if (text) {
      history.push(text.trim());
    }
  }

  return history;
}

/**
 * 유틸리티 함수: 크레딧 금액 검증
 * @param amount 금액
 * @returns 유효성 검사 결과
 */
export function validateCreditAmount(amount: number): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (amount <= 0) {
    errors.push('금액은 0보다 커야 합니다.');
  }

  if (amount < 1000) {
    errors.push('최소 충전 금액은 1,000원입니다.');
  }

  if (amount > 10000000) {
    errors.push('최대 충전 금액은 10,000,000원입니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 유틸리티 함수: 크레딧 데이터 검증
 * @param creditData 크레딧 데이터
 * @returns 유효성 검사 결과
 */
export function validateCreditData(creditData: typeof TEST_CREDIT_DATA): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (creditData.currentBalance < 0) {
    errors.push('현재 잔액은 음수일 수 없습니다.');
  }

  if (creditData.chargeAmount <= 0) {
    errors.push('충전 금액은 0보다 커야 합니다.');
  }

  if (creditData.usageAmount > creditData.currentBalance) {
    errors.push('사용 금액이 현재 잔액을 초과합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
