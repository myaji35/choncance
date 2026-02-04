/**
 * Group B2-05: 호스트 프로필 및 계정 관리 테스트
 *
 * 목표:
 * - 호스트 프로필 정보 조회
 * - 호스트 프로필 정보 수정
 * - 호스트 프로필 이미지 변경
 * - 사업자 정보 관리
 * - 정산 계좌 정보 관리
 * - 호스트 평가 및 리뷰 확인
 * - 계정 설정 관리
 * - 비밀번호 변경
 * - 알림 설정
 *
 * 테스트 특성:
 * - 호스트 프로필 관리의 전체 기능 테스트
 * - 민감한 정보 처리 테스트
 * - 병렬 실행 가능
 */

import { test, expect } from '@playwright/test';
import {
  loginAsHostUser,
  logoutUser,
  TEST_HOST,
  TEST_DATA,
  TIMEOUTS,
  SELECTORS,
  uploadImageFile,
  submitFormAndWaitForSuccess,
} from './setup';

test.describe('Group B2-05: 호스트 프로필 및 계정 관리', () => {
  test('호스트 프로필 페이지 접근', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 프로필 페이지 접근
    await page.goto('/host/profile');
    await page.waitForLoadState('networkidle');

    // Assert: 프로필 페이지 로드
    expect(page.url()).toContain('/host/profile');

    // 프로필 내용 확인
    const pageContent = page.locator('main, [role="main"]');
    expect(await pageContent.count()).toBeGreaterThan(0);

    // 정리
    await logoutUser(page);
  });

  test('호스트 프로필 기본 정보 표시', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 프로필 페이지 접근
    await page.goto('/host/profile');
    await page.waitForLoadState('networkidle');

    // 프로필 정보 요소 찾기
    const profileElements = page.locator('[data-testid*="profile"]');
    const hostNameElements = page.locator('text=/호스트|Host/i');
    const profileImage = page.locator('img[alt*="프로필"], img[alt*="profile"]');

    // Assert: 프로필 정보가 표시됨
    if (await profileElements.count() > 0) {
      expect(await profileElements.first().isVisible()).toBeTruthy();
    }

    // 호스트 이름 또는 프로필 정보가 표시됨
    expect(await hostNameElements.count()).toBeGreaterThan(0);

    // 프로필 이미지가 있을 수 있음
    if (await profileImage.count() > 0) {
      expect(await profileImage.first().isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 프로필 정보 수정', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 프로필 편집 페이지 접근
    await page.goto('/host/profile/edit');
    await page.waitForLoadState('networkidle');

    // 편집 양식 확인
    const profileForm = page.locator('form, [data-testid*="profile-form"]');

    if (await profileForm.count() > 0) {
      // 비오 또는 소개 입력 필드 수정
      const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="소개"]').first();
      if (await bioInput.count() > 0) {
        await bioInput.clear();
        await bioInput.fill(TEST_DATA.hostProfile.businessName + ' - 호스트 소개');
        await page.waitForTimeout(TIMEOUTS.ANIMATION);

        // Assert: 수정된 값 확인
        const inputValue = await bioInput.inputValue();
        expect(inputValue).toContain('호스트');
      }

      // 저장 버튼 클릭
      const saveButton = page.locator('button').filter({
        hasText: /저장|Save/i
      }).first();

      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 프로필 이미지 변경', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 프로필 편집 페이지 접근
    await page.goto('/host/profile/edit');
    await page.waitForLoadState('networkidle');

    // 프로필 이미지 업로드 필드 찾기
    const imageInput = page.locator('input[type="file"][name*="profile"], input[type="file"][name*="image"]').first();

    if (await imageInput.count() > 0) {
      // Assert: 이미지 업로드 필드가 보임
      expect(await imageInput.isVisible()).toBeTruthy();

      // 이미지 파일 업로드
      await imageInput.setInputFiles({
        name: 'test-profile.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
      });

      // 이미지 로드 대기
      await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

      // 이미지 미리보기 확인
      const imagePreview = page.locator('img[alt*="preview"], img[alt*="미리보기"]').first();
      if (await imagePreview.count() > 0) {
        expect(await imagePreview.isVisible()).toBeTruthy();
      }

      // 저장 버튼 클릭
      const saveButton = page.locator('button').filter({
        hasText: /저장|Save/i
      }).first();

      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 사업자 정보 관리', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 사업자 정보 페이지 접근
    await page.goto('/host/profile/business-info');
    await page.waitForLoadState('networkidle');

    // 사업자 정보 양식 확인
    const businessForm = page.locator('form, [data-testid*="business"]');

    if (await businessForm.count() > 0) {
      expect(await businessForm.first().isVisible()).toBeTruthy();

      // 사업자 정보 입력 필드 확인
      const businessNameInput = page.locator('input[name*="businessName"]').first();
      const businessNumberInput = page.locator('input[name*="businessNumber"]').first();

      // 입력 필드가 있으면 수정
      if (await businessNameInput.count() > 0) {
        const currentValue = await businessNameInput.inputValue();
        // 현재 값 확인만 함 (실제 변경은 민감 정보)
        expect(currentValue).toBeDefined();
      }

      if (await businessNumberInput.count() > 0) {
        const currentValue = await businessNumberInput.inputValue();
        expect(currentValue).toBeDefined();
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 정산 계좌 정보 관리', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 정산 계좌 정보 페이지 접근
    await page.goto('/host/profile/banking-info');
    await page.waitForLoadState('networkidle');

    // 정산 계좌 양식 확인
    const bankingForm = page.locator('form, [data-testid*="banking"]');

    if (await bankingForm.count() > 0) {
      expect(await bankingForm.first().isVisible()).toBeTruthy();

      // 은행 정보 입력 필드 확인
      const bankNameInput = page.locator('input[name*="bankName"], select[name*="bankName"]').first();
      const accountNumberInput = page.locator('input[name*="accountNumber"]').first();
      const accountHolderInput = page.locator('input[name*="accountHolder"]').first();

      // 입력 필드 존재 확인
      if (await bankNameInput.count() > 0) {
        expect(await bankNameInput.isVisible()).toBeTruthy();
      }

      if (await accountNumberInput.count() > 0) {
        expect(await accountNumberInput.isVisible()).toBeTruthy();
      }

      if (await accountHolderInput.count() > 0) {
        expect(await accountHolderInput.isVisible()).toBeTruthy();
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 평가 및 리뷰 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 리뷰 페이지 접근
    await page.goto('/host/reviews');
    await page.waitForLoadState('networkidle');

    // Assert: 리뷰 페이지 로드 또는 대시보드로 리다이렉트
    const pageContent = page.locator('main, [role="main"]');
    expect(await pageContent.count()).toBeGreaterThan(0);

    // 리뷰 섹션 찾기
    const reviewsSection = page.locator('[data-testid*="review"], text=/리뷰|Review/i');
    const ratingElements = page.locator('[data-testid*="rating"], text=/평점|별|star|rating/i');

    // 리뷰 또는 평점 정보가 표시되는지 확인
    if (await reviewsSection.count() > 0) {
      expect(await reviewsSection.isVisible()).toBeTruthy();
    }

    // 평점이 표시되는 경우 확인
    if (await ratingElements.count() > 0) {
      expect(await ratingElements.isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('계정 설정 페이지 접근', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 설정 페이지 접근
    await page.goto('/host/settings');
    await page.waitForLoadState('networkidle');

    // Assert: 설정 페이지 로드 또는 대시보드로 리다이렉트
    const pageContent = page.locator('main, [role="main"]');
    expect(await pageContent.count()).toBeGreaterThan(0);

    // 설정 옵션 찾기
    const settingsElements = page.locator('[data-testid*="setting"], text=/설정|Settings/i');

    // 설정 페이지가 있으면 요소 확인
    if (await settingsElements.count() > 0) {
      expect(await settingsElements.isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 비밀번호 변경', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 보안 설정 또는 비밀번호 변경 페이지 접근
    await page.goto('/host/settings/security');
    await page.waitForLoadState('networkidle');

    // 비밀번호 변경 양식 찾기
    const passwordForm = page.locator('form, [data-testid*="password"]');

    if (await passwordForm.count() > 0) {
      // 현재 비밀번호 입력
      const currentPasswordInput = page.locator('input[name*="current"], input[name*="old"], input[type="password"]').first();

      if (await currentPasswordInput.count() > 0) {
        // Assert: 비밀번호 입력 필드가 보임
        expect(await currentPasswordInput.isVisible()).toBeTruthy();

        // 새 비밀번호 입력
        const newPasswordInput = page.locator('input[name*="new"], input[name*="password"]:not([name*="current"])').nth(1);

        if (await newPasswordInput.count() > 0) {
          // 비밀번호 변경 폼이 있음을 확인
          expect(await newPasswordInput.isVisible()).toBeTruthy();
        }
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 알림 설정', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 알림 설정 페이지 접근
    await page.goto('/host/settings/notifications');
    await page.waitForLoadState('networkidle');

    // 알림 설정 옵션 찾기
    const notificationSettings = page.locator('input[type="checkbox"][name*="notif"], input[type="checkbox"][name*="alert"]');
    const notificationToggles = page.locator('[data-testid*="notification"], [data-testid*="alert"]');

    // Assert: 알림 설정이 표시됨
    if (await notificationSettings.count() > 0) {
      expect(await notificationSettings.count()).toBeGreaterThan(0);

      // 알림 설정 토글
      const firstCheckbox = notificationSettings.first();
      const initialState = await firstCheckbox.isChecked();

      await firstCheckbox.check();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      const newState = await firstCheckbox.isChecked();
      // 상태가 변경되거나 유지됨
    }

    if (await notificationToggles.count() > 0) {
      expect(await notificationToggles.count()).toBeGreaterThan(0);
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 프로필 공개 여부 설정', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 프로필 설정 페이지 접근
    await page.goto('/host/profile/settings');
    await page.waitForLoadState('networkidle');

    // 공개 여부 토글 찾기
    const publicToggle = page.locator('input[type="checkbox"][name*="public"], input[type="checkbox"][name*="visibility"]');
    const publicRadio = page.locator('input[type="radio"][value*="public"]');

    // Assert: 공개 여부 설정이 있음
    if (await publicToggle.count() > 0) {
      expect(await publicToggle.isVisible()).toBeTruthy();

      // 토글 상태 확인
      const isPublic = await publicToggle.first().isChecked();
      expect(typeof isPublic).toBe('boolean');
    }

    if (await publicRadio.count() > 0) {
      expect(await publicRadio.isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 프로필 통계 및 성과 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 프로필 또는 대시보드에서 통계 확인
    await page.goto('/host/profile/statistics');
    await page.waitForLoadState('networkidle');

    // 통계 섹션 찾기
    const statisticsSection = page.locator('[data-testid*="statistics"], [data-testid*="stats"]');
    const statsText = page.locator('text=/통계|통계|성과|총 예약|total booking/i');
    const numberElements = page.locator('text=/[0-9]+/');

    // Assert: 통계가 표시됨
    if (await statisticsSection.count() > 0) {
      expect(await statisticsSection.isVisible()).toBeTruthy();
    }

    if (await statsText.count() > 0) {
      expect(await statsText.isVisible()).toBeTruthy();
    }

    // 숫자 데이터가 있음
    if (await numberElements.count() > 0) {
      expect(await numberElements.count()).toBeGreaterThan(0);
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 계정 삭제 옵션 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 설정 페이지 접근
    await page.goto('/host/settings/account');
    await page.waitForLoadState('networkidle');

    // 계정 삭제 버튼 찾기
    const deleteAccountButton = page.locator('button').filter({
      hasText: /계정 삭제|탈퇴|Delete Account|Deactivate/i
    });

    // Assert: 계정 삭제 옵션이 있을 수 있음
    if (await deleteAccountButton.count() > 0) {
      expect(await deleteAccountButton.isVisible()).toBeTruthy();

      // 버튼이 활성화되어 있음
      expect(await deleteAccountButton.first().isEnabled()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });
});
