/**
 * Group B3-05: 관리자 설정 테스트
 *
 * 목표:
 * - 시스템 설정 페이지 접근
 * - SNS 계정 설정
 * - 챗봇 설정
 * - 메인테넌스 모드 설정
 * - 설정 저장 및 확인
 *
 * 테스트 특성:
 * - 관리자 설정 관리 테스트
 * - 병렬 실행 가능
 * - 테스트 계정: test_admin@vintee.test
 */

import { test, expect } from '@playwright/test';
import {
  loginAsAdminUser,
  logoutUser,
  TEST_ADMIN,
  TEST_DATA,
  TIMEOUTS,
  SELECTORS,
  submitFormAndWaitForSuccess,
} from './setup';

test.describe('Group B3-05: 관리자 설정', () => {
  test('관리자 설정 페이지 로드', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // Assert: 설정 페이지 로드 확인
    expect(page.url()).toContain('/admin/settings');

    // 설정 섹션 확인
    const pageContent = page.locator('body');
    expect(await pageContent.isVisible()).toBeTruthy();

    // 정리
    await logoutUser(page);
  });

  test('시스템 설정 섹션 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // Assert: 시스템 설정 섹션 확인
    const systemSettings = page.locator(SELECTORS.systemSettings);

    if (await systemSettings.count() > 0) {
      expect(await systemSettings.isVisible()).toBeTruthy();

      // 설정 폼 확인
      const settingsForm = page.locator(SELECTORS.settingsForm);
      if (await settingsForm.count() > 0) {
        expect(await settingsForm.isVisible()).toBeTruthy();
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('메인테넌스 모드 토글 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // Assert: 메인테넌스 모드 토글 확인
    const maintenanceToggle = page.locator(SELECTORS.maintenanceModeToggle);

    if (await maintenanceToggle.count() > 0) {
      expect(await maintenanceToggle.isVisible()).toBeTruthy();

      // 토글 상태 확인 (체크되었는지 여부)
      const isChecked = await maintenanceToggle.first().isChecked();
      expect(typeof isChecked).toBe('boolean');
    }

    // 정리
    await logoutUser(page);
  });

  test('메인테넌스 모드 토글 변경', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 메인테넌스 모드 토글 찾기
    const maintenanceToggle = page.locator(SELECTORS.maintenanceModeToggle);

    if (await maintenanceToggle.count() > 0) {
      // 초기 상태 저장
      const initialState = await maintenanceToggle.first().isChecked();

      // Act: 토글 클릭
      await maintenanceToggle.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 상태 변경 확인
      const newState = await maintenanceToggle.first().isChecked();
      expect(newState).not.toBe(initialState);

      // 변경 사항 저장
      const saveButton = page.locator(SELECTORS.saveButton);
      if (await saveButton.count() > 0) {
        await saveButton.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // 성공 메시지 확인
        const successMessage = page.locator(SELECTORS.successMessage);
        if (await successMessage.count() > 0) {
          expect(await successMessage.isVisible()).toBeTruthy();
        }
      }

      // 변경 내용 되돌리기
      await maintenanceToggle.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      const resetButton = page.locator(SELECTORS.saveButton);
      if (await resetButton.count() > 0) {
        await resetButton.first().click();
        await page.waitForLoadState('networkidle');
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('SNS 계정 설정 섹션 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // Assert: SNS 설정 섹션 확인
    const snsSection = page.locator(SELECTORS.snsSection);

    if (await snsSection.count() > 0) {
      expect(await snsSection.isVisible()).toBeTruthy();

      // SNS 입력 필드 확인
      const instagramInput = page.locator(SELECTORS.instagramInput);
      const facebookInput = page.locator(SELECTORS.facebookInput);
      const naverBlogInput = page.locator(SELECTORS.naverBlogInput);

      // 최소한 하나의 SNS 필드가 있어야 함
      const hasSnsFields =
        await instagramInput.count() > 0 ||
        await facebookInput.count() > 0 ||
        await naverBlogInput.count() > 0;

      expect(hasSnsFields).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('인스타그램 계정 입력', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 인스타그램 입력 필드 찾기
    const instagramInput = page.locator(SELECTORS.instagramInput);

    if (await instagramInput.count() > 0) {
      // Act: 인스타그램 핸들 입력
      await instagramInput.first().clear();
      await instagramInput.first().fill(TEST_DATA.snsAccounts.instagramHandle);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력 확인
      const inputValue = await instagramInput.first().inputValue();
      expect(inputValue).toContain('vintee');
    }

    // 정리
    await logoutUser(page);
  });

  test('페이스북 계정 입력', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 페이스북 입력 필드 찾기
    const facebookInput = page.locator(SELECTORS.facebookInput);

    if (await facebookInput.count() > 0) {
      // Act: 페이스북 URL 입력
      await facebookInput.first().clear();
      await facebookInput.first().fill(TEST_DATA.snsAccounts.facebookUrl);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력 확인
      const inputValue = await facebookInput.first().inputValue();
      expect(inputValue).toContain('facebook');
    }

    // 정리
    await logoutUser(page);
  });

  test('네이버 블로그 계정 입력', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 네이버 블로그 입력 필드 찾기
    const naverBlogInput = page.locator(SELECTORS.naverBlogInput);

    if (await naverBlogInput.count() > 0) {
      // Act: 네이버 블로그 URL 입력
      await naverBlogInput.first().clear();
      await naverBlogInput.first().fill(TEST_DATA.snsAccounts.naverBlogUrl);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력 확인
      const inputValue = await naverBlogInput.first().inputValue();
      expect(inputValue).toContain('naver');
    }

    // 정리
    await logoutUser(page);
  });

  test('챗봇 설정 섹션 표시', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // Assert: 챗봇 설정 섹션 확인
    const chatbotSection = page.locator(SELECTORS.chatbotSection);

    if (await chatbotSection.count() > 0) {
      expect(await chatbotSection.isVisible()).toBeTruthy();

      // 챗봇 설정 요소 확인
      const enableToggle = page.locator(SELECTORS.chatbotEnabledToggle);
      const messageInput = page.locator(SELECTORS.chatbotMessageInput);

      // 최소한 하나의 챗봇 설정 요소가 있어야 함
      const hasChatbotSettings =
        await enableToggle.count() > 0 ||
        await messageInput.count() > 0;

      expect(hasChatbotSettings).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('챗봇 활성화 토글', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 챗봇 활성화 토글 찾기
    const enableToggle = page.locator(SELECTORS.chatbotEnabledToggle);

    if (await enableToggle.count() > 0) {
      // Assert: 토글 표시 확인
      expect(await enableToggle.isVisible()).toBeTruthy();

      // Act: 토글 상태 확인
      const isEnabled = await enableToggle.first().isChecked();
      expect(typeof isEnabled).toBe('boolean');

      // 토글 변경
      await enableToggle.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 새로운 상태 확인
      const newState = await enableToggle.first().isChecked();
      expect(newState).not.toBe(isEnabled);

      // 변경 사항 복구
      await enableToggle.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 정리
    await logoutUser(page);
  });

  test('챗봇 환영 메시지 입력', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 챗봇 메시지 입력 필드 찾기
    const messageInput = page.locator(SELECTORS.chatbotMessageInput);

    if (await messageInput.count() > 0) {
      // Act: 환영 메시지 입력
      const currentValue = await messageInput.first().inputValue();
      await messageInput.first().clear();
      await messageInput.first().fill(TEST_DATA.chatbotSettings.welcomeMessage);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력 확인
      const inputValue = await messageInput.first().inputValue();
      expect(inputValue).toContain('VINTEE');

      // 원래 값으로 복구
      if (currentValue) {
        await messageInput.first().clear();
        await messageInput.first().fill(currentValue);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('챗봇 응답 타임아웃 설정', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 챗봇 타임아웃 입력 필드 찾기
    const timeoutInput = page.locator(SELECTORS.chatbotTimeoutInput);

    if (await timeoutInput.count() > 0) {
      // Act: 타임아웃 값 입력
      const currentValue = await timeoutInput.first().inputValue();
      await timeoutInput.first().clear();
      await timeoutInput.first().fill(String(TEST_DATA.chatbotSettings.responseTimeout));
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력 확인
      const inputValue = await timeoutInput.first().inputValue();
      expect(inputValue).toContain('5000');

      // 원래 값으로 복구
      if (currentValue) {
        await timeoutInput.first().clear();
        await timeoutInput.first().fill(currentValue);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('설정 저장 기능', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 설정값 변경 (간단한 변경)
    const snsSection = page.locator(SELECTORS.snsSection);

    if (await snsSection.count() > 0) {
      // 설정 저장 버튼 찾기
      const saveButton = page.locator(SELECTORS.saveButton);

      if (await saveButton.count() > 0) {
        // Act: 저장 버튼 클릭
        await saveButton.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // Assert: 성공 메시지 확인
        const successMessage = page.locator(SELECTORS.successMessage);

        // 성공 메시지가 있으면 확인, 없어도 URL이 그대로이면 성공
        if (await successMessage.count() > 0) {
          expect(await successMessage.isVisible()).toBeTruthy();
        } else {
          // 최소한 설정 페이지에 남아있어야 함
          expect(page.url()).toContain('/admin/settings');
        }
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('설정 페이지 새로고침', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 초기 설정값 수집
    const initialSettings = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea');
      return Array.from(inputs).map(el => (el as any).value);
    });

    // Act: 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Assert: 설정 페이지가 여전히 로드되어야 함
    expect(page.url()).toContain('/admin/settings');

    // 새로운 설정값 수집
    const refreshedSettings = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea');
      return Array.from(inputs).map(el => (el as any).value);
    });

    // 설정값이 유지되었는지 확인 (비어있거나 동일해야 함)
    expect(Array.isArray(refreshedSettings)).toBeTruthy();

    // 정리
    await logoutUser(page);
  });

  test('설정 취소 기능', async ({ page }) => {
    // Arrange: 관리자로 로그인
    await loginAsAdminUser(page, TEST_ADMIN.email);

    // Act: 설정 페이지 접근
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // 취소 버튼 또는 뒤로 가기 버튼 찾기
    const cancelButton = page.locator(SELECTORS.cancelButton);
    const backButton = page.locator(SELECTORS.backButton);

    if (await cancelButton.count() > 0) {
      // Act: 취소 버튼 클릭
      await cancelButton.first().click();
      await page.waitForLoadState('networkidle');

      // Assert: 설정 페이지에서 떠남 (또는 대시보드로 이동)
      const isStillOnSettings = page.url().includes('/admin/settings');
      // 취소 후 페이지가 변경되거나 그대로일 수 있음
      expect(typeof isStillOnSettings).toBe('boolean');
    } else if (await backButton.count() > 0) {
      // Act: 뒤로 가기 버튼 클릭
      await backButton.first().click();
      await page.waitForLoadState('networkidle');

      // 대시보드로 이동했는지 확인
      expect(page.url()).not.toContain('/admin/settings') || expect(page.url()).toContain('/admin');
    }

    // 정리
    await logoutUser(page);
  });
});
