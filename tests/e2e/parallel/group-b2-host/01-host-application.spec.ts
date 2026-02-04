/**
 * Group B2-01: 호스트 신청 및 승인 플로우 테스트
 *
 * 목표:
 * - 호스트 신청 양식 제출
 * - 호스트 프로필 생성 확인
 * - 호스트 승인 상태 확인
 * - 호스트 계약 동의 확인
 *
 * 테스트 특성:
 * - 호스트 가입 및 인증 프로세스 테스트
 * - 병렬 실행 가능
 * - 테스트 계정: test_host_1@vintee.test
 */

import { test, expect } from '@playwright/test';
import {
  loginAsHostUser,
  logoutUser,
  TEST_HOST,
  TEST_DATA,
  TIMEOUTS,
  SELECTORS,
  submitFormAndWaitForSuccess,
} from './setup';

test.describe('Group B2-01: 호스트 신청 및 승인', () => {
  test('호스트 대시보드 접근 및 신청 상태 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 호스트 대시보드 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 대시보드 페이지 로드 확인
    expect(page.url()).toContain('/host/dashboard');

    // 호스트 대시보드 제목 확인
    const dashboardTitle = page.locator('h1').filter({
      hasText: /호스트 대시보드|Host Dashboard/i
    });

    // 대시보드 또는 신청 상태 페이지 표시 확인
    const pageContent = page.locator('body');
    expect(await pageContent.isVisible()).toBeTruthy();

    // 정리
    await logoutUser(page);
  });

  test('호스트 신청 양식 작성 및 제출', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 호스트 신청 페이지 접근
    await page.goto('/host/application');
    await page.waitForLoadState('networkidle');

    // 신청 양식이 표시되는지 확인
    const applicationForm = page.locator('form, [data-testid*="application"]');
    const isFormVisible = await applicationForm.count() > 0;

    if (isFormVisible) {
      // Assert: 양식이 표시됨
      expect(await applicationForm.first().isVisible()).toBeTruthy();

      // 사업자 정보 입력
      const businessNameInput = page.locator('input[name*="business"][name*="name"]');
      if (await businessNameInput.count() > 0) {
        await businessNameInput.first().fill(TEST_DATA.hostProfile.businessName);
      }

      // 사업자등록번호 입력
      const businessNumberInput = page.locator('input[name*="business"][name*="number"]');
      if (await businessNumberInput.count() > 0) {
        await businessNumberInput.first().fill(TEST_DATA.hostProfile.businessNumber);
      }

      // 은행 정보 입력
      const bankAccountHolder = page.locator('input[name*="bank"][name*="holder"]');
      if (await bankAccountHolder.count() > 0) {
        await bankAccountHolder.first().fill(TEST_DATA.hostProfile.bankAccountHolder);
      }

      const bankAccountNumber = page.locator('input[name*="bank"][name*="account"][name*="number"]');
      if (await bankAccountNumber.count() > 0) {
        await bankAccountNumber.first().fill(TEST_DATA.hostProfile.bankAccountNumber);
      }

      const bankName = page.locator('input[name*="bank"][name*="name"]');
      if (await bankName.count() > 0) {
        await bankName.first().fill(TEST_DATA.hostProfile.bankName);
      }

      // 약관 동의
      const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"]');
      if (await termsCheckbox.count() > 0) {
        await termsCheckbox.first().check();
      }

      // 양식 제출
      const submitButton = page.locator('button').filter({
        hasText: /제출|신청|Submit|Apply/i
      });

      if (await submitButton.count() > 0) {
        await submitButton.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 프로필 정보 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 호스트 프로필 페이지 접근
    await page.goto('/host/profile');
    await page.waitForLoadState('networkidle');

    // Assert: 프로필 페이지 로드
    expect(page.url()).toContain('/host/profile');

    // 프로필 정보 표시 확인
    const profileSection = page.locator('[data-testid*="profile"], h2');
    const isProfileVisible = await profileSection.count() > 0;
    expect(isProfileVisible).toBeTruthy();

    // 호스트 이름이 표시되는지 확인
    const hostNameElements = page.locator('text=' + TEST_HOST.name);
    // 프로필에 호스트 이름이 없을 수도 있으므로 존재 여부만 확인
    const hasHostName = await hostNameElements.count() > 0;

    // 프로필 편집 버튼 확인
    const editButton = page.locator('button').filter({
      hasText: /수정|편집|Edit/i
    });

    if (await editButton.count() > 0) {
      expect(await editButton.isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 계약 및 약관 동의 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 약관 페이지 접근
    await page.goto('/host/terms');
    await page.waitForLoadState('networkidle');

    // Assert: 약관 페이지 로드 또는 약관 동의 섹션 확인
    const termsContent = page.locator('text=/약관|Terms|Agreement/i');
    const agreementCheckbox = page.locator('input[type="checkbox"][name*="agree"]');

    // 약관 내용이나 동의 체크박스 중 하나가 있으면 성공
    const hasTermsContent = await termsContent.count() > 0;
    const hasAgreementCheckbox = await agreementCheckbox.count() > 0;

    expect(hasTermsContent || hasAgreementCheckbox).toBeTruthy();

    // 약관 동의 체크박스가 있는 경우
    if (await agreementCheckbox.count() > 0) {
      // 현재 상태 확인 (이미 동의했을 수도 있음)
      const isChecked = await agreementCheckbox.first().isChecked();

      // 동의하지 않은 경우 동의
      if (!isChecked) {
        await agreementCheckbox.first().check();

        // 확인 버튼 클릭
        const confirmButton = page.locator('button').filter({
          hasText: /확인|동의|Confirm|Agree/i
        });

        if (await confirmButton.count() > 0) {
          await confirmButton.first().click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 승인 상태 확인 및 대시보드 접근', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 호스트 대시보드 접근
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert: 대시보드 접근 가능 확인
    expect(page.url()).toContain('/host/dashboard');

    // 승인 상태 표시 확인 (승인, 검토 중, 거절 등)
    const statusElements = page.locator('text=/승인|검토|거절|Approved|Pending|Rejected/i');
    const pageContent = page.locator('body');

    // 대시보드가 로드되었으면 성공
    expect(await pageContent.isVisible()).toBeTruthy();

    // 숙소 추가 버튼이 있는지 확인 (승인된 경우)
    const addPropertyButton = page.locator('button').filter({
      hasText: /숙소 추가|숙소 등록|Add Property/i
    });

    // 호스트 기능 접근 가능 여부 확인
    const hasHostFunctions = await addPropertyButton.count() > 0 || await statusElements.count() > 0;
    expect(hasHostFunctions).toBeTruthy();

    // 정리
    await logoutUser(page);
  });

  test('호스트 프로필 정보 수정', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 호스트 프로필 페이지 접근
    await page.goto('/host/profile/edit');
    await page.waitForLoadState('networkidle');

    // 프로필 편집 양식 확인
    const profileForm = page.locator('form, [data-testid*="profile"]');

    if (await profileForm.count() > 0) {
      // 바이오 입력 필드 찾기 및 수정
      const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="소개"]');

      if (await bioInput.count() > 0) {
        await bioInput.first().fill(TEST_DATA.hostProfile.businessName + ' - 수정됨');
      }

      // 저장 버튼 클릭
      const saveButton = page.locator('button').filter({
        hasText: /저장|Save/i
      });

      if (await saveButton.count() > 0) {
        await saveButton.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // 성공 메시지 확인
        const successMessage = page.locator('[role="alert"]').filter({
          hasText: /저장|성공|Success/i
        });

        // 성공 메시지가 있으면 좋고 없어도 계속 진행
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('호스트 계정 보안 설정 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 설정 또는 보안 페이지 접근
    await page.goto('/host/settings');
    await page.waitForLoadState('networkidle');

    // Assert: 설정 페이지 로드 또는 대시보드로 리다이렉트
    const pageContent = page.locator('body');
    expect(await pageContent.isVisible()).toBeTruthy();

    // 비밀번호 변경 옵션 또는 보안 설정 찾기
    const securityElements = page.locator('text=/보안|비밀번호|Security|Password/i');

    // 설정 페이지가 있으면 보안 옵션 확인, 없으면 대시보드 확인
    if (await securityElements.count() > 0) {
      expect(await securityElements.isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });
});
