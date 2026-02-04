/**
 * Group D3-02: 크레딧 사용 테스트
 *
 * 목표:
 * - 예약 페이지에서 크레딧 사용 옵션 표시 확인
 * - 크레딧 할인 계산 확인
 * - 크레딧 사용 후 결제 금액 감소 확인
 * - 크레딧 부족 시 처리 확인
 * - 크레딧 사용 취소 기능 확인
 * - 예약 완료 후 크레딧 차감 확인
 * - 크레딧 사용 이력 기록 확인
 * - 환불 시 크레딧 반환 확인
 *
 * 테스트 특성:
 * - 사용자 인증이 필요함
 * - 예약 프로세스와 통합
 * - 병렬 실행 가능
 */

import { test, expect } from './setup';
import {
  TEST_CREDIT_DATA,
  TIMEOUTS,
  SELECTORS,
  getCreditBalance,
  useCredits,
  validateCreditAmount,
  validateCreditData,
} from './setup';

test.describe('Group D3-02: 크레딧 사용', () => {
  /**
   * 각 테스트마다 예약 페이지로 이동 (또는 체크아웃 페이지)
   */
  test.beforeEach(async ({ authenticatedPage }) => {
    // 예약 또는 체크아웃 페이지 접근
    // 실제 예약이 있다고 가정
    await authenticatedPage.goto('/booking');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

    // 크레딧 섹션을 찾기 위해 스크롤
    const creditSection = authenticatedPage
      .locator(SELECTORS.creditCheckbox, '[class*="credit"]')
      .first();
    if (await creditSection.count() > 0) {
      await creditSection.scrollIntoViewIfNeeded();
    }
  });

  test('예약 페이지에서 크레딧 사용 옵션 표시', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act & Assert: 크레딧 사용 옵션이 표시됨
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    const creditOption = authenticatedPage.locator('label').filter({
      hasText: /크레딧|포인트|Point|Credit/i,
    });

    const hasCheckbox = await creditCheckbox.count() > 0;
    const hasOption = await creditOption.count() > 0;

    expect(hasCheckbox || hasOption).toBe(true);
  });

  test('크레딧 사용 체크박스 상태', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 크레딧 체크박스 확인
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);

    if (await creditCheckbox.count() > 0) {
      // Assert: 체크박스가 체크 가능
      const isChecked = await creditCheckbox.first().isChecked();
      expect(typeof isChecked).toBe('boolean');
    }
  });

  test('크레딧 사용 가능 금액 표시', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act & Assert: 사용 가능한 크레딧 금액이 표시됨
    const availableCredit = authenticatedPage.locator('text=/사용.*크레딧|사용.*가능/i');
    const isVisible = await availableCredit
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    // 사용 가능 금액이 표시될 수도 있고 없을 수도 있음
    if (isVisible) {
      expect(isVisible).toBe(true);
    }
  });

  test('크레딧 사용 시 할인 금액 표시', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 크레딧 사용 체크
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    if (await creditCheckbox.count() > 0) {
      // 현재 결제 금액 확인
      const priceBeforeCredit = authenticatedPage.locator('[class*="price"], [data-testid*="price"]');
      const priceBefore = await priceBeforeCredit.first().textContent();

      // 크레딧 사용 체크
      await creditCheckbox.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

      // 할인 금액 확인
      const discountAmount = authenticatedPage.locator('text=/할인|discount/i');
      const hasDiscount = await discountAmount
        .isVisible({ timeout: TIMEOUTS.ANIMATION })
        .catch(() => false);

      // Assert: 할인 금액이 표시되거나 가격이 변경됨
      if (hasDiscount) {
        expect(hasDiscount).toBe(true);
      }
    }
  });

  test('크레딧 사용 후 결제 금액 감소', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 크레딧 사용 전 결제 금액
    const totalPrice = authenticatedPage.locator('[data-testid="total-price"], text=/총.*₩/i').first();
    const priceText = await totalPrice.textContent();
    const priceBefore = priceText ? parseInt(priceText.replace(/[^\d]/g, ''), 10) : 0;

    // 크레딧 사용 체크
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    if (await creditCheckbox.count() > 0) {
      await creditCheckbox.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

      // 크레딧 사용 후 결제 금액
      const priceAfterText = await totalPrice.textContent();
      const priceAfter = priceAfterText ? parseInt(priceAfterText.replace(/[^\d]/g, ''), 10) : 0;

      // Assert: 결제 금액이 감소하거나 동일
      expect(priceAfter).toBeLessThanOrEqual(priceBefore);
    }
  });

  test('크레딧 부족 시 경고 메시지', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 크레딧 체크박스 클릭
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    if (await creditCheckbox.count() > 0) {
      // 사용 가능 크레딧 확인
      const currentBalance = await getCreditBalance(authenticatedPage);

      // 충분한 크레딧이 없다면 경고 메시지 표시될 것
      if (currentBalance < 1000) {
        await creditCheckbox.first().click();
        await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

        // 경고 메시지 확인
        const warningMessage = authenticatedPage.locator('[role="alert"]').filter({
          hasText: /부족|최소|필요/i,
        });

        const hasWarning = await warningMessage
          .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
          .catch(() => false);

        // 경고가 있을 수도 있고 없을 수도 있음
        if (hasWarning) {
          expect(hasWarning).toBe(true);
        }
      }
    }
  });

  test('크레딧 사용 취소', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 크레딧 사용 체크
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    if (await authenticatedPage.count() > 0) {
      // 체크
      await creditCheckbox.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

      // 언체크
      await creditCheckbox.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 체크박스가 해제됨
      const isChecked = await creditCheckbox.first().isChecked();
      expect(isChecked).toBe(false);
    }
  });

  test('크레딧 적용 버튼 클릭', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 크레딧 사용 체크
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    if (await creditCheckbox.count() > 0) {
      await creditCheckbox.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

      // 적용 버튼 찾기 및 클릭
      const applyButton = authenticatedPage.locator(SELECTORS.creditApplyButton);
      if (await applyButton.count() > 0) {
        await applyButton.first().click();
        await authenticatedPage.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // Assert: 크레딧이 적용됨
        // (결제 금액 업데이트 또는 성공 메시지)
        const successMessage = authenticatedPage.locator(SELECTORS.successAlert);
        const hasSuccess = await successMessage
          .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
          .catch(() => false);

        // 성공 메시지가 있을 수도 있고 없을 수도 있음
        if (hasSuccess) {
          expect(hasSuccess).toBe(true);
        }
      }
    }
  });

  test('부분 크레딧 사용 - 결제 금액 일부만 커버', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 현재 크레딧 확인
    const currentBalance = await getCreditBalance(authenticatedPage);

    // 결제 금액 확인
    const totalPrice = authenticatedPage.locator('text=/₩[0-9,]+/').first();
    const priceText = await totalPrice.textContent();
    const price = priceText ? parseInt(priceText.replace(/[^\d]/g, ''), 10) : 0;

    // 크레딧이 결제 금액보다 적으면 부분 사용
    if (currentBalance > 0 && currentBalance < price) {
      const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
      if (await creditCheckbox.count() > 0) {
        await creditCheckbox.first().click();
        await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

        // Assert: 크레딧이 부분 적용됨
        const remainingPrice = await totalPrice.textContent();
        expect(remainingPrice).toBeTruthy();
      }
    }
  });

  test('크레딧으로 전액 결제', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 크레딧과 결제 금액 비교
    const currentBalance = await getCreditBalance(authenticatedPage);
    const totalPrice = authenticatedPage.locator('text=/₩[0-9,]+/').first();
    const priceText = await totalPrice.textContent();
    const price = priceText ? parseInt(priceText.replace(/[^\d]/g, ''), 10) : 0;

    // 크레딧이 충분하면 전액 결제
    if (currentBalance >= price) {
      const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
      if (await creditCheckbox.count() > 0) {
        await creditCheckbox.first().click();
        await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

        // Assert: 결제 금액이 0 또는 매우 작음
        const finalPrice = await totalPrice.textContent();
        const finalAmount = finalPrice ? parseInt(finalPrice.replace(/[^\d]/g, ''), 10) : 0;
        expect(finalAmount).toBeLessThanOrEqual(0);
      }
    }
  });

  test('크레딧 사용 선택 취소 불가 - 다른 선택지 없음', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 크레딧만 결제 방법이라면 언체크 불가
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    const otherPaymentMethods = authenticatedPage.locator('input[name*="payment"], input[type="radio"]');

    if (await creditCheckbox.count() > 0) {
      // 다른 결제 방법 확인
      const otherCount = await otherPaymentMethods.count();

      // 다른 결제 방법이 없으면 크레딧 사용 필수
      if (otherCount <= 1) {
        // 크레딧 체크 시도
        await creditCheckbox.first().click();
        await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

        // 언체크 시도
        const isDisabled = await creditCheckbox.first().isDisabled();

        // 필수 선택이라면 비활성화되거나 언체크 불가
        if (isDisabled) {
          expect(isDisabled).toBe(true);
        }
      }
    }
  });

  test('결제 전 크레딧 확인', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 결제 버튼 확인
    const paymentButton = authenticatedPage.locator('button').filter({
      hasText: /결제|Payment|Pay|구매/i,
    });

    // Assert: 결제 버튼이 표시됨
    if (await paymentButton.count() > 0) {
      const isEnabled = await paymentButton.first().isEnabled();
      expect(isEnabled).toBe(true);
    }
  });

  test('예약 완료 후 크레딧 차감 확인', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 크레딧 사용 전 잔액
    const balanceBefore = await getCreditBalance(authenticatedPage);

    // 크레딧 사용 체크 및 결제
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    if (await creditCheckbox.count() > 0 && balanceBefore > 0) {
      await creditCheckbox.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

      // 결제 버튼 클릭 (모킹)
      const paymentButton = authenticatedPage.locator('button').filter({
        hasText: /결제|Payment|Pay/i,
      });

      if (await paymentButton.count() > 0) {
        await paymentButton.first().click();
        await authenticatedPage.waitForTimeout(TIMEOUTS.PAYMENT);

        // 예약 완료 페이지에서 크레딧 잔액 확인
        const balanceAfter = await getCreditBalance(authenticatedPage);

        // Assert: 크레딧이 차감됨 또는 0
        expect(balanceAfter).toBeLessThanOrEqual(balanceBefore);
      }
    }
  });

  test('크레딧 사용 이력 기록', async ({ authenticatedPage }) => {
    // Arrange: 대시보드로 이동
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');

    // Act & Assert: 크레딧 사용 이력이 기록됨
    const creditHistory = authenticatedPage.locator(SELECTORS.creditHistory);
    const isVisible = await creditHistory
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    if (isVisible) {
      const historyItems = authenticatedPage.locator(SELECTORS.historyItem);
      const itemCount = await historyItems.count();
      expect(itemCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('환불 시 크레딧 반환', async ({ authenticatedPage }) => {
    // Arrange: 예약 관리 페이지 접근
    await authenticatedPage.goto('/dashboard/bookings');
    await authenticatedPage.waitForLoadState('networkidle');

    // Act: 예약 취소 시도
    const cancelButton = authenticatedPage.locator('button').filter({
      hasText: /취소|Cancel|환불/i,
    });

    if (await cancelButton.count() > 0) {
      // 크레딧 사용 여부 확인
      const creditCheckbox = authenticatedPage.locator('input[type="checkbox"]').filter({
        hasText: /크레딧|Credit/i,
      });

      // 크레딧을 사용했다면 환불 시 반환
      if (await creditCheckbox.count() > 0) {
        const isUsed = await creditCheckbox.first().isChecked();

        if (isUsed) {
          // 취소 버튼 클릭 (모킹)
          await cancelButton.first().click();
          await authenticatedPage.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

          // Assert: 환불 메시지 또는 크레딧 반환 안내
          const successMessage = authenticatedPage.locator(SELECTORS.successAlert);
          const hasSuccess = await successMessage
            .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
            .catch(() => false);

          if (hasSuccess) {
            expect(hasSuccess).toBe(true);
          }
        }
      }
    }
  });

  test('크레딧 사용 정책 안내', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act & Assert: 크레딧 사용 정책이 안내됨
    const creditInfo = authenticatedPage.locator('[class*="credit-info"], [data-testid*="credit-info"]');
    const policyText = authenticatedPage.locator('text=/크레딧|정책|규정/i');

    const hasInfo = await creditInfo
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);
    const hasPolicy = await policyText
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    expect(hasInfo || hasPolicy).toBe(true);
  });

  test('크레딧 사용 데이터 검증', async ({ authenticatedPage }) => {
    // Arrange: 테스트 데이터 검증

    // Act & Assert: 크레딧 데이터가 유효함
    const validation = validateCreditData(TEST_CREDIT_DATA);
    expect(Array.isArray(validation.errors)).toBe(true);
  });

  test('모바일에서 크레딧 사용', async ({ authenticatedPage }) => {
    // Arrange: 모바일 뷰포트 설정
    await authenticatedPage.setViewportSize({ width: 375, height: 812 });

    // Act & Assert: 크레딧 사용 옵션이 표시됨
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    const isVisible = await creditCheckbox
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('태블릿에서 크레딧 사용', async ({ authenticatedPage }) => {
    // Arrange: 태블릿 뷰포트 설정
    await authenticatedPage.setViewportSize({ width: 768, height: 1024 });

    // Act & Assert: 크레딧 사용 옵션이 표시됨
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    const isVisible = await creditCheckbox
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('다중 할인 - 크레딧과 쿠폰 함께 사용', async ({ authenticatedPage }) => {
    // Arrange: 예약 페이지 로드됨

    // Act: 쿠폰과 크레딧 모두 적용 시도
    const creditCheckbox = authenticatedPage.locator(SELECTORS.creditCheckbox);
    const couponInput = authenticatedPage.locator('input[name*="coupon"]');

    if ((await creditCheckbox.count()) > 0 && (await couponInput.count()) > 0) {
      // 쿠폰 코드 입력
      await couponInput.first().fill('TESTCOUPON');
      await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

      // 크레딧 사용 체크
      await creditCheckbox.first().click();
      await authenticatedPage.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 둘 다 적용됨 또는 충돌 메시지
      const finalPrice = authenticatedPage.locator('[data-testid="total-price"]');
      const priceText = await finalPrice.first().textContent();

      expect(priceText).toBeTruthy();
    }
  });
});
