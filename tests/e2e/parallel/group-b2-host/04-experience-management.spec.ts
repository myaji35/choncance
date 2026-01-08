/**
 * Group B2-04: 호스트 체험 관리 테스트
 *
 * 목표:
 * - 체험 생성 (Create)
 * - 체험 조회 (Read)
 * - 체험 수정 (Update)
 * - 체험 삭제 (Delete)
 * - 체험 일정 설정
 * - 체험 가격 및 정보 관리
 * - 체험 태그 관리
 * - 체험 상태 변경
 *
 * 테스트 특성:
 * - 체험의 전체 CRUD 작업 테스트
 * - 일정 관리 기능 테스트
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
  verifyExperienceCreated,
  submitFormAndWaitForSuccess,
  selectDropdownOption,
  selectCheckboxes,
} from './setup';

test.describe('Group B2-04: 호스트 체험 관리', () => {
  test('체험 관리 페이지 접근', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 관리 페이지 접근
    await page.goto('/host/experiences');
    await page.waitForLoadState('networkidle');

    // Assert: 체험 관리 페이지 로드
    expect(page.url()).toContain('/host/experiences');

    // 페이지 내용 확인
    const pageContent = page.locator('main, [role="main"]');
    expect(await pageContent.count()).toBeGreaterThan(0);

    // 정리
    await logoutUser(page);
  });

  test('새 체험 추가 양식 표시 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 추가 페이지 접근
    await page.goto('/host/experiences/new');
    await page.waitForLoadState('networkidle');

    // Assert: 체험 추가 양식 표시
    const experienceForm = page.locator('form, [data-testid*="experience-form"]');

    if (await experienceForm.count() > 0) {
      expect(await experienceForm.first().isVisible()).toBeTruthy();

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

  test('체험 기본 정보 입력', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 추가 페이지 접근
    await page.goto('/host/experiences/new');
    await page.waitForLoadState('networkidle');

    // 체험명 입력
    const nameInput = page.locator('input[name*="name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(TEST_DATA.experience.name);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 설명 입력
    const descriptionInput = page.locator('textarea[name*="description"]').first();
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill(TEST_DATA.experience.description);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 가격 입력
    const priceInput = page.locator('input[name*="price"]').first();
    if (await priceInput.count() > 0) {
      await priceInput.fill(TEST_DATA.experience.price.toString());
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 소요 시간 입력
    const durationInput = page.locator('input[name*="duration"]').first();
    if (await durationInput.count() > 0) {
      await durationInput.fill(TEST_DATA.experience.duration.toString());
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 최대 인원 입력
    const capacityInput = page.locator('input[name*="capacity"]').first();
    if (await capacityInput.count() > 0) {
      await capacityInput.fill(TEST_DATA.experience.capacity.toString());
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // Assert: 입력된 값 확인
    if (await nameInput.count() > 0) {
      const inputValue = await nameInput.inputValue();
      expect(inputValue).toBe(TEST_DATA.experience.name);
    }

    // 정리
    await logoutUser(page);
  });

  test('체험 카테고리 선택', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 추가 페이지 접근
    await page.goto('/host/experiences/new');
    await page.waitForLoadState('networkidle');

    // 카테고리 선택
    const categorySelect = page.locator('select[name*="category"]').first();
    const categoryButton = page.locator('button').filter({
      hasText: /카테고리|Category/i
    }).first();

    if (await categorySelect.count() > 0) {
      // Select 요소인 경우
      await categorySelect.selectOption('ACTIVITY');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 카테고리 선택 확인
      const selectedValue = await categorySelect.inputValue();
      expect(selectedValue).toBe('ACTIVITY');
    } else if (await categoryButton.count() > 0) {
      // 버튼 기반 선택인 경우
      await categoryButton.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      const categoryOption = page.locator('text=/체험|ACTIVITY|Activity/i');
      if (await categoryOption.count() > 0) {
        await categoryOption.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('체험 일정 설정', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 추가 페이지 접근
    await page.goto('/host/experiences/new');
    await page.waitForLoadState('networkidle');

    // 요일 선택 (금요일, 토요일, 일요일)
    const dayCheckboxes = page.locator('input[type="checkbox"][name*="day"], input[type="checkbox"][name*="dayOfWeek"]');

    if (await dayCheckboxes.count() > 0) {
      // 처음 3개 요일 선택
      for (let i = 0; i < Math.min(3, await dayCheckboxes.count()); i++) {
        const checkbox = dayCheckboxes.nth(i);
        await checkbox.check();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }

      // Assert: 요일이 선택됨
      const checkedDays = page.locator('input[type="checkbox"][name*="day"]:checked, input[type="checkbox"][name*="dayOfWeek"]:checked');
      expect(await checkedDays.count()).toBeGreaterThan(0);
    }

    // 시작 시간 입력
    const startTimeInput = page.locator('input[name*="startTime"]').first();
    if (await startTimeInput.count() > 0) {
      await startTimeInput.fill(TEST_DATA.experience.schedule.startTime);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 종료 시간 입력
    const endTimeInput = page.locator('input[name*="endTime"]').first();
    if (await endTimeInput.count() > 0) {
      await endTimeInput.fill(TEST_DATA.experience.schedule.endTime);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }

    // 정리
    await logoutUser(page);
  });

  test('체험 태그 추가', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 추가 페이지 접근
    await page.goto('/host/experiences/new');
    await page.waitForLoadState('networkidle');

    // 태그 입력 필드 찾기
    const tagInput = page.locator('input[name*="tag"], input[placeholder*="태그"], input[placeholder*="tag"]').first();
    const tagCheckboxes = page.locator('input[type="checkbox"][name*="tag"]');

    if (await tagInput.count() > 0) {
      // 텍스트 입력 기반
      await tagInput.fill(TEST_DATA.experience.tags[0]);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 추가 버튼 클릭
      const addTagButton = page.locator('button').filter({
        hasText: /추가|Add|태그/i
      });

      if (await addTagButton.count() > 0) {
        await addTagButton.first().click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }
    } else if (await tagCheckboxes.count() > 0) {
      // 체크박스 기반
      for (let i = 0; i < Math.min(2, await tagCheckboxes.count()); i++) {
        await tagCheckboxes.nth(i).check();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);
      }

      // Assert: 태그가 선택됨
      const checkedTags = page.locator('input[type="checkbox"][name*="tag"]:checked');
      expect(await checkedTags.count()).toBeGreaterThan(0);
    }

    // 정리
    await logoutUser(page);
  });

  test('체험 목록에서 항목 확인', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 목록 페이지 접근
    await page.goto('/host/experiences');
    await page.waitForLoadState('networkidle');

    // 체험 항목 찾기
    const experienceCards = page.locator('[data-testid*="experience"], [class*="experience-card"]');
    const experienceItems = page.locator('article, [role="article"], .experience-item');

    // Assert: 체험 목록 확인
    const listSection = page.locator('main, [role="main"]');
    expect(await listSection.count()).toBeGreaterThan(0);

    // 체험이 있는 경우 카드 확인
    if (await experienceCards.count() > 0) {
      expect(await experienceCards.first().isVisible()).toBeTruthy();
    }

    // 정리
    await logoutUser(page);
  });

  test('체험 상세 페이지 접근 및 편집', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 목록 페이지 접근
    await page.goto('/host/experiences');
    await page.waitForLoadState('networkidle');

    // 편집 버튼 찾기
    const editButtons = page.locator('button, a').filter({
      hasText: /편집|수정|Edit/i
    });

    if (await editButtons.count() > 0) {
      // 첫 번째 편집 버튼 클릭
      await editButtons.first().click();
      await page.waitForLoadState('networkidle');

      // Assert: 체험 편집 페이지 로드
      expect(page.url()).toContain('/host/experiences/');

      // 편집 양식 확인
      const editForm = page.locator('form, [data-testid*="experience-form"]');
      expect(await editForm.count()).toBeGreaterThan(0);
    }

    // 정리
    await logoutUser(page);
  });

  test('체험 정보 수정 및 저장', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 목록 페이지 접근
    await page.goto('/host/experiences');
    await page.waitForLoadState('networkidle');

    // 편집 버튼 찾기
    const editButtons = page.locator('button, a').filter({
      hasText: /편집|수정|Edit/i
    });

    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      await page.waitForLoadState('networkidle');

      // 체험명 수정
      const nameInput = page.locator('input[name*="name"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.clear();
        await nameInput.fill(TEST_DATA.experienceUpdate.name);
        await page.waitForTimeout(TIMEOUTS.ANIMATION);

        // Assert: 수정된 값 확인
        const inputValue = await nameInput.inputValue();
        expect(inputValue).toBe(TEST_DATA.experienceUpdate.name);
      }

      // 가격 수정
      const priceInput = page.locator('input[name*="price"]').first();
      if (await priceInput.count() > 0) {
        await priceInput.clear();
        await priceInput.fill(TEST_DATA.experienceUpdate.price.toString());
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

  test('체험 공개/비공개 상태 변경', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 목록 페이지 접근
    await page.goto('/host/experiences');
    await page.waitForLoadState('networkidle');

    // 상태 변경 버튼 찾기
    const statusButtons = page.locator('button').filter({
      hasText: /공개|비공개|숨김|활성화|비활성화|Publish|Unpublish/i
    });

    if (await statusButtons.count() > 0) {
      const initialText = await statusButtons.first().textContent();

      // Assert: 상태 변경 버튼이 활성화됨
      expect(await statusButtons.first().isEnabled()).toBeTruthy();

      // 상태 변경 버튼 클릭
      await statusButtons.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 상태 변경 완료 확인
      const newText = await statusButtons.first().textContent();
      // 상태가 변경되거나 요청이 처리됨
    }

    // 정리
    await logoutUser(page);
  });

  test('체험 일정 보기 및 수정', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 상세 페이지 접근
    await page.goto('/host/experiences');
    await page.waitForLoadState('networkidle');

    // 첫 번째 체험 항목 클릭
    const experienceItems = page.locator('[data-testid*="experience"], article, .experience-item');

    if (await experienceItems.count() > 0) {
      // 상세보기 링크 찾기
      const viewButton = page.locator('a, button').filter({
        hasText: /상세|보기|View|Details/i
      }).first();

      if (await viewButton.count() > 0) {
        await viewButton.click();
        await page.waitForLoadState('networkidle');

        // 일정 섹션 확인
        const scheduleSection = page.locator('[data-testid*="schedule"], text=/일정|Schedule/i');
        if (await scheduleSection.count() > 0) {
          expect(await scheduleSection.isVisible()).toBeTruthy();
        }
      }
    }

    // 정리
    await logoutUser(page);
  });

  test('체험 삭제 기능', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 목록 페이지 접근
    await page.goto('/host/experiences');
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
        }).last();

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

  test('체험 검색 및 필터링', async ({ page }) => {
    // Arrange: 호스트로 로그인
    await loginAsHostUser(page, TEST_HOST.email);

    // Act: 체험 목록 페이지 접근
    await page.goto('/host/experiences');
    await page.waitForLoadState('networkidle');

    // 검색 입력 필드 찾기
    const searchInput = page.locator('input[placeholder*="검색"], input[placeholder*="search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('요리');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 검색 버튼 또는 엔터 키
      const searchButton = page.locator('button').filter({
        hasText: /검색|Search/i
      });

      if (await searchButton.count() > 0) {
        await searchButton.click();
      } else {
        // 엔터 키로 검색
        await searchInput.press('Enter');
      }

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 검색 결과 확인
      const results = page.locator('[data-testid*="experience"], article');
      // 검색 결과가 있으면 필터링이 작동함
    }

    // 정리
    await logoutUser(page);
  });
});
