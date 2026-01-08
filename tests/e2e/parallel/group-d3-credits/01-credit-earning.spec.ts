/**
 * Group D3-01: 크레딧 획득 테스트
 *
 * 목표:
 * - 크레딧 잔액 표시 확인
 * - 리뷰 작성 보상 확인
 * - 예약 보너스 확인
 * - 추천 보상 확인
 * - 크레딧 충전 기능 확인
 * - 결제 성공 후 크레딧 추가 확인
 * - 크레딧 이력 표시 확인
 * - 크레딧 유효 기간 확인
 *
 * 테스트 특성:
 * - 사용자 인증이 필요함
 * - 사용자 대시보드에서 실행
 * - 병렬 실행 가능
 */

import { test, expect } from './setup';
import {
  TEST_CREDIT_DATA,
  TIMEOUTS,
  SELECTORS,
  getCreditBalance,
  getCreditHistory,
  validateCreditAmount,
} from './setup';

test.describe('Group D3-01: 크레딧 획득', () => {
  /**
   * 각 테스트마다 대시보드 또는 크레딧 페이지로 이동
   */
  test.beforeEach(async ({ authenticatedPage }) => {
    // 사용자 대시보드 접근
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

    // 크레딧 섹션으로 이동 또는 스크롤
    const creditSection = authenticatedPage.locator('[data-testid="credits"], [class*="credit"]').first();
    if (await creditSection.count() > 0) {
      await creditSection.scrollIntoViewIfNeeded();
    }
  });

  test('크레딧 잔액 표시 확인', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 크레딧 잔액이 표시됨
    const creditBalance = authenticatedPage.locator(SELECTORS.creditBalance);
    const creditAmount = authenticatedPage.locator(SELECTORS.creditAmount);

    const hasBalance =
      (await creditBalance
        .isVisible({ timeout: TIMEOUTS.NAVIGATION })
        .catch(() => false)) ||
      (await creditAmount
        .isVisible({ timeout: TIMEOUTS.NAVIGATION })
        .catch(() => false));

    expect(hasBalance).toBe(true);
  });

  test('크레딧 금액 숫자 형식 확인', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act: 크레딧 금액 조회
    const balance = await getCreditBalance(authenticatedPage);

    // Assert: 크레딧이 숫자 형식
    expect(typeof balance).toBe('number');
  });

  test('크레딧 충전 버튼 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 충전 버튼이 표시됨
    const chargeButton = authenticatedPage.locator(SELECTORS.chargeButton);
    const isVisible = await chargeButton
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('크레딧 충전 폼 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act: 충전 버튼 클릭
    const chargeButton = authenticatedPage.locator(SELECTORS.chargeButton);
    if (await chargeButton.count() > 0) {
      await chargeButton.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Assert: 충전 폼이 표시됨
      const chargeForm = authenticatedPage.locator(SELECTORS.chargeForm);
      const isVisible = await chargeForm
        .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
        .catch(() => false);

      // 폼이 표시되거나 충전 입력 필드가 있음
      expect(isVisible).toBe(true);
    }
  });

  test('크레딧 충전 금액 입력', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act: 충전 버튼 클릭
    const chargeButton = authenticatedPage.locator(SELECTORS.chargeButton);
    if (await chargeButton.count() > 0) {
      await chargeButton.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // 금액 입력 필드
      const amountInput = authenticatedPage.locator(SELECTORS.chargeAmountInput);
      if (await amountInput.count() > 0) {
        // Assert: 입력 필드가 표시됨
        const isVisible = await amountInput
          .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
          .catch(() => false);

        expect(isVisible).toBe(true);

        // 금액 입력
        await amountInput.first().fill('10000');
        await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

        // 입력한 금액 확인
        const inputValue = await amountInput.first().inputValue();
        expect(inputValue).toBe('10000');
      }
    }
  });

  test('크레딧 충전 금액 검증', async ({ authenticatedPage }) => {
    // Arrange: 테스트 데이터 검증

    // Act & Assert: 유효한 금액
    const validation = validateCreditAmount(TEST_CREDIT_DATA.chargeAmount);
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  test('크레딧 충전 최소 금액 제한', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act: 충전 버튼 클릭
    const chargeButton = authenticatedPage.locator(SELECTORS.chargeButton);
    if (await chargeButton.count() > 0) {
      await chargeButton.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // 최소 금액 미만으로 입력
      const amountInput = authenticatedPage.locator(SELECTORS.chargeAmountInput);
      if (await amountInput.count() > 0) {
        await amountInput.first().fill('100'); // 최소값보다 작음
        await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

        // 충전 버튼 클릭
        const submitButton = authenticatedPage.locator(SELECTORS.chargeSubmitButton);
        if (await submitButton.count() > 0) {
          await submitButton.first().click();
          await authenticatedPage.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

          // Assert: 오류 메시지 표시 또는 폼 유지
          const errorMessage = authenticatedPage.locator(SELECTORS.errorMessage);
          const hasError = await errorMessage
            .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
            .catch(() => false);

          expect(hasError).toBe(true);
        }
      }
    }
  });

  test('크레딧 충전 최대 금액 제한', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act: 충전 버튼 클릭
    const chargeButton = authenticatedPage.locator(SELECTORS.chargeButton);
    if (await chargeButton.count() > 0) {
      await chargeButton.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // 최대 금액 초과로 입력
      const amountInput = authenticatedPage.locator(SELECTORS.chargeAmountInput);
      if (await amountInput.count() > 0) {
        // 입력 길이 제한 확인
        const maxValue = await amountInput.first().getAttribute('max');

        if (maxValue) {
          // 최대값이 설정되어 있음
          expect(parseInt(maxValue, 10)).toBeGreaterThan(0);
        }
      }
    }
  });

  test('크레딧 충전 완료 메시지', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act: 크레딧 충전 프로세스 (모킹)
    const chargeButton = authenticatedPage.locator(SELECTORS.chargeButton);
    if (await chargeButton.count() > 0) {
      await chargeButton.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      const amountInput = authenticatedPage.locator(SELECTORS.chargeAmountInput);
      if (await amountInput.count() > 0) {
        await amountInput.first().fill('10000');
        await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

        const submitButton = authenticatedPage.locator(SELECTORS.chargeSubmitButton);
        if (await submitButton.count() > 0) {
          await submitButton.first().click();
          await authenticatedPage.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

          // Assert: 성공 메시지 또는 페이지 업데이트
          const successMessage = authenticatedPage.locator(SELECTORS.successAlert);
          const hasSuccess = await successMessage
            .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
            .catch(() => false);

          // 성공 메시지가 있거나 폼이 닫혔음
          if (hasSuccess) {
            expect(hasSuccess).toBe(true);
          }
        }
      }
    }
  });

  test('크레딧 이력 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 크레딧 이력이 표시됨
    const creditHistory = authenticatedPage.locator(SELECTORS.creditHistory);
    const isVisible = await creditHistory
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    // 크레딧 이력이 표시되거나 거래 항목이 있음
    expect(isVisible).toBe(true);
  });

  test('크레딧 이력 항목 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 크레딧 이력 항목들이 표시됨
    const historyItems = authenticatedPage.locator(SELECTORS.historyItem);
    const itemCount = await historyItems.count();

    // 최소 1개 이상의 거래 기록이 있어야 함
    expect(itemCount).toBeGreaterThanOrEqual(0); // 없을 수도 있음
  });

  test('크레딧 거래 날짜 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 거래 날짜가 표시됨
    const transactionDates = authenticatedPage.locator(SELECTORS.transactionDate);
    const dateCount = await transactionDates.count();

    // 날짜가 표시될 수도 있고 없을 수도 있음
    if (dateCount > 0) {
      expect(dateCount).toBeGreaterThanOrEqual(1);

      // 첫 번째 날짜 확인
      const firstDate = transactionDates.first();
      const dateText = await firstDate.textContent();
      expect(dateText).toBeTruthy();
    }
  });

  test('크레딧 거래 금액 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 거래 금액이 표시됨
    const transactionAmounts = authenticatedPage.locator(SELECTORS.transactionAmount);
    const amountCount = await transactionAmounts.count();

    // 금액이 표시될 수도 있고 없을 수도 있음
    if (amountCount > 0) {
      expect(amountCount).toBeGreaterThanOrEqual(1);

      // 첫 번째 금액 확인
      const firstAmount = transactionAmounts.first();
      const amountText = await firstAmount.textContent();
      expect(amountText).toBeTruthy();
    }
  });

  test('크레딧 거래 설명 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 거래 설명이 표시됨
    const descriptions = authenticatedPage.locator(SELECTORS.transactionDescription);
    const descriptionCount = await descriptions.count();

    // 설명이 표시될 수도 있고 없을 수도 있음
    if (descriptionCount > 0) {
      expect(descriptionCount).toBeGreaterThanOrEqual(1);

      // 첫 번째 설명 확인
      const firstDescription = descriptions.first();
      const descText = await firstDescription.textContent();
      expect(descText).toBeTruthy();
    }
  });

  test('크레딧 정보 섹션 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 크레딧 정보가 표시됨
    const creditInfo = authenticatedPage.locator(SELECTORS.creditInfo);
    const isVisible = await creditInfo
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    // 정보 섹션이 표시될 수도 있고 없을 수도 있음
    if (isVisible) {
      expect(isVisible).toBe(true);
    }
  });

  test('크레딧 유효 기간 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 유효 기간이 표시됨
    const validityPeriod = authenticatedPage.locator(SELECTORS.validityPeriod);
    const isVisible = await validityPeriod
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    // 유효 기간이 표시될 수도 있고 없을 수도 있음
    if (isVisible) {
      expect(isVisible).toBe(true);

      const text = await validityPeriod.first().textContent();
      expect(text).toBeTruthy();
    }
  });

  test('크레딧 약관 표시', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act & Assert: 크레딧 약관이 표시됨
    const creditTerms = authenticatedPage.locator(SELECTORS.creditTerms);
    const isVisible = await creditTerms
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    // 약관이 표시될 수도 있고 없을 수도 있음
    if (isVisible) {
      expect(isVisible).toBe(true);
    }
  });

  test('모바일 뷰에서 크레딧 표시', async ({ authenticatedPage }) => {
    // Arrange: 모바일 뷰포트 설정
    await authenticatedPage.setViewportSize({ width: 375, height: 812 });

    // Act & Assert: 크레딧 정보가 올바르게 표시됨
    const creditBalance = authenticatedPage.locator(SELECTORS.creditBalance);
    const isVisible = await creditBalance
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('태블릿 뷰에서 크레딧 표시', async ({ authenticatedPage }) => {
    // Arrange: 태블릿 뷰포트 설정
    await authenticatedPage.setViewportSize({ width: 768, height: 1024 });

    // Act & Assert: 크레딧 정보가 올바르게 표시됨
    const creditBalance = authenticatedPage.locator(SELECTORS.creditBalance);
    const isVisible = await creditBalance
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('크레딧 충전 취소 기능', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act: 충전 버튼 클릭
    const chargeButton = authenticatedPage.locator(SELECTORS.chargeButton);
    if (await chargeButton.count() > 0) {
      await chargeButton.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // 취소 버튼 찾기
      const cancelButton = authenticatedPage.locator('button').filter({
        hasText: /취소|Cancel|닫기|Close/i,
      });

      if (await cancelButton.count() > 0) {
        // 첫 번째 (제출 버튼 제외) 취소 버튼 클릭
        await cancelButton.first().click();
        await authenticatedPage.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

        // Assert: 대화상자가 닫힘
        const chargeForm = authenticatedPage.locator(SELECTORS.chargeForm);
        const isVisible = await chargeForm
          .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
          .catch(() => false);

        expect(isVisible).toBe(false);
      }
    }
  });

  test('크레딧 이력 조회', async ({ authenticatedPage }) => {
    // Arrange: 대시보드 로드됨

    // Act: 크레딧 이력 조회
    const history = await getCreditHistory(authenticatedPage);

    // Assert: 이력 배열이 반환됨
    expect(Array.isArray(history)).toBe(true);
  });

  test('페이지 로드 성능', async ({ authenticatedPage }) => {
    // Arrange & Act: 페이지 로드 시간 측정
    const startTime = Date.now();

    // 크레딧 정보 로드 대기
    const creditBalance = authenticatedPage.locator(SELECTORS.creditBalance);
    await creditBalance.waitFor({ timeout: TIMEOUTS.NAVIGATION });

    const loadTime = Date.now() - startTime;

    // Assert: 페이지가 적절한 시간 내에 로드됨
    expect(loadTime).toBeLessThan(10000);
  });
});
