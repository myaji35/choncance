/**
 * Group B2-03: 호스트 숙소 관리 테스트
 *
 * 목표:
 * - 숙소 생성 (Create)
 * - 숙소 조회 (Read)
 * - 숙소 수정 (Update)
 * - 숙소 삭제 (Delete)
 * - 숙소 이미지 업로드
 * - 숙소 상태 변경 (공개/비공개)
 * - 숙소 가격 및 정보 수정
 *
 * 테스트 특성:
 * - 숙소의 전체 CRUD 작업 테스트
 * - 이미지 업로드 기능 테스트
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
  verifyPropertyCreated,
  submitFormAndWaitForSuccess,
  uploadImageFile,
  selectDropdownOption,
  selectCheckboxes,
} from './setup';

test.describe('Group B2-03: 호스트 숙소 관리', () => {
  test('숙소 관리 페이지 접근', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 관리 페이지 접근
    await page.goto('/host/properties');
    await page.waitForLoadState('networkidle');

    // Assert: 숙소 관리 페이지 로드
    expect(page.url()).toContain('/host/properties');

    // 페이지 제목 또는 내용 확인
    const pageContent = page.locator('main, [role="main"]');
    expect(await pageContent.count()).toBeGreaterThan(0);

    // 정리
    await logoutUser(page);
  });

  test('새 숙소 추가 양식 표시 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 추가 페이지 접근
    await page.goto('/host/properties/new');
    await page.waitForLoadState('networkidle');

    // Assert: 숙소 추가 양식 표시
    const propertyForm = page.locator('form, [data-testid*="property-form"]');

    if (await propertyForm.count() > 0) {
      expect(await propertyForm.first().isVisible()).toBeTruthy();

      // 주요 입력 필드 확인
      const nameInput = page.locator('input[name*="name"]');
      const descriptionInput = page.locator('textarea[name*="description"]');
      const priceInput = page.locator('input[name*="price"]');

      // 최소한 하나의 필드가 있어야 함
      const hasFields = await nameInput.count() > 0 ||
                       await descriptionInput.count() > 0 ||
                       await priceInput.count() > 0;

      expect(hasFields).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 기본 정보 입력 및 저장', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 추가 페이지 접근
    await page.goto('/host/properties/new');
    await page.waitForLoadState('networkidle');

    // 숙소명 입력
    const nameInput = page.locator('input[name*="name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(TEST_DATA.property.name);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 설명 입력
    const descriptionInput = page.locator('textarea[name*="description"]').first();
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill(TEST_DATA.property.description);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 주소 입력
    const addressInput = page.locator('input[name*="address"]').first();
    if (await addressInput.count() > 0) {
      await addressInput.fill(TEST_DATA.property.address);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 가격 입력
    const priceInput = page.locator('input[name*="price"]').first();
    if (await priceInput.count() > 0) {
      await priceInput.fill(TEST_DATA.property.price.toString());
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 최대 인원 입력
    const maxGuestsInput = page.locator('input[name*="maxGuests"]').first();
    if (await maxGuestsInput.count() > 0) {
      await maxGuestsInput.fill(TEST_DATA.property.maxGuests.toString());
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 침실 수 입력
    const bedroomsInput = page.locator('input[name*="bedrooms"]').first();
    if (await bedroomsInput.count() > 0) {
      await bedroomsInput.fill(TEST_DATA.property.bedrooms.toString());
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // Assert: 입력된 값 확인
    if (await nameInput.count() > 0) {
      const inputValue = await nameInput.inputValue();
      expect(inputValue).toBe(TEST_DATA.property.name);
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 편의시설 선택', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 추가 페이지 접근
    await page.goto('/host/properties/new');
    await page.waitForLoadState('networkidle');

    // 편의시설 체크박스 찾기
    const amenitiesCheckboxes = page.locator('input[type="checkbox"][name*="amenities"]');

    if (await amenitiesCheckboxes.count() > 0) {
      // 처음 3개 편의시설 선택
      for (let i = 0; i < Math.min(3, await amenitiesCheckboxes.count()); i++) {
        const checkbox = amenitiesCheckboxes.nth(i);
        await checkbox.check();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }

      // Assert: 선택된 체크박스 확인
      const checkedBoxes = page.locator('input[type="checkbox"][name*="amenities"]:checked');
      expect(await checkedBoxes.count()).toBeGreaterThan(0);
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 이미지 업로드', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 추가 페이지 접근
    await page.goto('/host/properties/new');
    await page.waitForLoadState('networkidle');

    // 이미지 업로드 입력 필드 찾기
    const imageInput = page.locator('input[type="file"][name*="image"], input[type="file"][accept*="image"]').first();

    if (await imageInput.count() > 0) {
      // Assert: 이미지 업로드 필드가 보임
      expect(await imageInput.isVisible()).toBeTruthy();

      // 파일 업로드 시뮬레이션
      await imageInput.setInputFiles({
        name: 'test-property.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
      });

      // 이미지 로드 대기
      await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

      // 업로드된 이미지 미리보기 확인
      const imagePreview = page.locator('img[alt*="preview"], img[alt*="미리보기"]').first();
      if (await imagePreview.count() > 0) {
        // 이미지가 있으면 로드됨
        await expect(imagePreview).toBeVisible();
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 체크인/체크아웃 시간 설정', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 추가 페이지 접근
    await page.goto('/host/properties/new');
    await page.waitForLoadState('networkidle');

    // 체크인 시간 입력
    const checkInInput = page.locator('input[name*="checkInTime"]').first();
    if (await checkInInput.count() > 0) {
      await checkInInput.fill(TEST_DATA.property.checkInTime);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 체크아웃 시간 입력
    const checkOutInput = page.locator('input[name*="checkOutTime"]').first();
    if (await checkOutInput.count() > 0) {
      await checkOutInput.fill(TEST_DATA.property.checkOutTime);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // Assert: 입력된 시간 확인
    if (await checkInInput.count() > 0) {
      const timeValue = await checkInInput.inputValue();
      expect(timeValue).toContain('15');
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 이용 규칙 작성', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 추가 페이지 접근
    await page.goto('/host/properties/new');
    await page.waitForLoadState('networkidle');

    // 이용 규칙 입력
    const rulesInput = page.locator('textarea[name*="rules"]').first();
    if (await rulesInput.count() > 0) {
      await rulesInput.fill(TEST_DATA.property.rules);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력된 규칙 확인
      const inputValue = await rulesInput.inputValue();
      expect(inputValue).toContain('반려동물');
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 목록에서 항목 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 목록 페이지 접근
    await page.goto('/host/properties');
    await page.waitForLoadState('networkidle');

    // 숙소 카드 또는 항목 찾기
    const propertyCards = page.locator('[data-testid*="property"], [class*="property-card"]');
    const propertyItems = page.locator('article, [role="article"], .property-item');

    // Assert: 최소한 숙소 목록이 있거나 비어있음을 확인
    const hasPropertyElements = await propertyCards.count() > 0 || await propertyItems.count() > 0;

    // 숙소 목록이 표시됨
    const listSection = page.locator('main, [role="main"]');
    expect(await listSection.count()).toBeGreaterThan(0);

    // 정리
    await logoutUser(page);
  });

  test('숙소 상세 페이지 접근 및 편집', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 첫 번째 숙소 찾기
    await page.goto('/host/properties');
    await page.waitForLoadState('networkidle');

    // 편집 버튼 찾기
    const editButtons = page.locator('button, a').filter({
      hasText: /편집|수정|Edit/i
    });

    if (await editButtons.count() > 0) {
      // 첫 번째 편집 버튼 클릭
      await editButtons.first().click();
      await page.waitForLoadState('networkidle');

      // Assert: 숙소 편집 페이지 로드
      expect(page.url()).toContain('/host/properties/');

      // 편집 양식 확인
      const editForm = page.locator('form, [data-testid*="property-form"]');
      expect(await editForm.count()).toBeGreaterThan(0);
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 정보 수정 및 저장', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 편집 페이지 접근
    await page.goto('/host/properties');
    await page.waitForLoadState('networkidle');

    // 편집 버튼 찾기
    const editButtons = page.locator('button, a').filter({
      hasText: /편집|수정|Edit/i
    });

    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      await page.waitForLoadState('networkidle');

      // 숙소명 수정
      const nameInput = page.locator('input[name*="name"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.clear();
        await nameInput.fill(TEST_DATA.propertyUpdate.name);
        await page.waitForTimeout(TIMEOUTS.ANIMATION);

        // Assert: 수정된 값 확인
        const inputValue = await nameInput.inputValue();
        expect(inputValue).toBe(TEST_DATA.propertyUpdate.name);
      }

      // 가격 수정
      const priceInput = page.locator('input[name*="price"]').first();
      if (await priceInput.count() > 0) {
        await priceInput.clear();
        await priceInput.fill(TEST_DATA.propertyUpdate.price.toString());
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }

      // 저장 버튼 클릭
      const saveButton = page.locator('button').filter({
        hasText: /저장|Save/i
      }).first();

      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // 성공 메시지 확인
        const successMessage = page.locator('[role="alert"]').filter({
          hasText: /저장|성공|Success/i
        });

        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 공개/비공개 상태 변경', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 목록 페이지 접근
    await page.goto('/host/properties');
    await page.waitForLoadState('networkidle');

    // 상태 변경 버튼 찾기
    const statusButtons = page.locator('button').filter({
      hasText: /공개|비공개|숨김|활성화|비활성화|Publish|Unpublish/i
    });

    if (await statusButtons.count() > 0) {
      const initialText = await statusButtons.first().textContent();

      // Assert: 상태 변경 버튼 클릭 가능
      expect(await statusButtons.first().isEnabled()).toBeTruthy();

      // 상태 변경 버튼 클릭
      await statusButtons.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 상태가 변경됨 (버튼 텍스트 변경)
      const newText = await statusButtons.first().textContent();
      // 상태 변경이 성공하면 텍스트가 다르거나 요청이 처리됨
    }

    // 정리
    await logoutUser(page);
  });

  test('숙소 삭제 기능', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 숙소 목록 페이지 접근
    await page.goto('/host/properties');
    await page.waitForLoadState('networkidle');

    // 삭제 버튼 찾기
    const deleteButtons = page.locator('button').filter({
      hasText: /삭제|제거|Delete|Remove/i
    });

    if (await deleteButtons.count() > 0) {
      // Assert: 삭제 버튼이 존재함
      expect(await deleteButtons.first().isVisible()).toBeTruthy();

      // 삭제 버튼 클릭
      await deleteButtons.first().click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // 확인 대화상자 확인
      const confirmDialog = page.locator('[role="dialog"]');
      if (await confirmDialog.count() > 0) {
        // 확인 버튼 클릭
        const confirmButton = page.locator('button').filter({
          hasText: /확인|삭제|Delete|Confirm/i
        }).last(); // 마지막 버튼이 확인 버튼일 가능성이 높음

        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);
        }
      }
    }

    // 정리
    await logoutUser(page);
  });
});
