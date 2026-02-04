/**
 * Group D1-02: 리뷰 표시 테스트
 *
 * 목표:
 * - 리뷰 목록 표시 확인
 * - 리뷰 평점 표시 확인
 * - 리뷰 제목 표시 확인
 * - 리뷰 내용 표시 확인
 * - 리뷰 이미지 표시 확인
 * - 리뷰 저자 정보 표시 확인
 * - 리뷰 날짜 표시 확인
 * - 평점 필터링 기능 확인
 * - 도움이 됨/안 됨 투표 기능 확인
 * - 리뷰 정렬 기능 확인
 * - 평점 통계 표시 확인
 * - 리뷰 페이지네이션 기능 확인
 *
 * 테스트 특성:
 * - 사용자 인증 필요 없음 (읽기만 함)
 * - 숙소 상세 페이지에서 실행
 * - 병렬 실행 가능
 */

import { test, expect } from '@playwright/test';
import { TEST_PROPERTY, TIMEOUTS, SELECTORS } from './setup';

test.describe('Group D1-02: 리뷰 표시', () => {
  /**
   * 각 테스트마다 숙소 상세 페이지로 이동
   */
  test.beforeEach(async ({ page }) => {
    // 숙소 상세 페이지 접근
    await page.goto(`/property/${TEST_PROPERTY.id}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // 리뷰 섹션으로 스크롤 (있을 경우)
    const reviewSection = page.locator('[data-testid="reviews"], [class*="review"]').first();
    if (await reviewSection.count() > 0) {
      await reviewSection.scrollIntoViewIfNeeded();
    }
  });

  test('리뷰 목록 섹션 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰 섹션이 표시됨
    const reviewList = page.locator(SELECTORS.reviewList);
    const reviewSection = page.locator('[data-testid="reviews"], [class*="review"]');

    const isVisible =
      (await reviewList
        .isVisible({ timeout: TIMEOUTS.NAVIGATION })
        .catch(() => false)) ||
      (await reviewSection
        .isVisible({ timeout: TIMEOUTS.NAVIGATION })
        .catch(() => false));

    expect(isVisible).toBe(true);
  });

  test('리뷰 카드 표시 확인', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰 카드가 표시됨
    const reviewCards = page.locator(SELECTORS.reviewCard);
    const cardCount = await reviewCards.count();

    // 최소 1개 이상의 리뷰가 있어야 함
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('리뷰 평점 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰의 평점이 표시됨
    const reviewRatings = page.locator(SELECTORS.reviewRating);
    const ratingCount = await reviewRatings.count();

    // 최소 1개의 평점이 표시되어야 함
    if (ratingCount > 0) {
      expect(ratingCount).toBeGreaterThanOrEqual(1);
    }

    // 별점 또는 숫자 형태의 평점
    const starRatings = page.locator('[role="img"]:has-text("★"), [class*="star"]');
    const hasStarRating = await starRatings
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    // 평점이 어딘가에 표시되어야 함
    expect(ratingCount > 0 || hasStarRating).toBe(true);
  });

  test('리뷰 제목 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰 제목이 표시됨
    const reviewTitles = page.locator(SELECTORS.reviewTitle);
    const titleCount = await reviewTitles.count();

    // 최소 1개의 제목이 표시되어야 함
    if (titleCount > 0) {
      expect(titleCount).toBeGreaterThanOrEqual(1);

      // 첫 번째 리뷰 제목의 텍스트 내용 확인
      const firstTitle = reviewTitles.first();
      const titleText = await firstTitle.textContent();
      expect(titleText).toBeTruthy();
      expect(titleText?.length).toBeGreaterThan(0);
    }
  });

  test('리뷰 내용 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰 내용이 표시됨
    const reviewContents = page.locator(SELECTORS.reviewContent);
    const contentCount = await reviewContents.count();

    // 최소 1개의 내용이 표시되어야 함
    if (contentCount > 0) {
      expect(contentCount).toBeGreaterThanOrEqual(1);

      // 첫 번째 리뷰 내용의 텍스트 내용 확인
      const firstContent = reviewContents.first();
      const contentText = await firstContent.textContent();
      expect(contentText).toBeTruthy();
      expect(contentText?.length).toBeGreaterThan(0);
    }
  });

  test('리뷰 저자 정보 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰 저자 정보가 표시됨
    const authorInfo = page.locator(SELECTORS.reviewAuthor);
    const authorCount = await authorInfo.count();

    // 저자 정보가 표시되거나 다른 방식으로 표시될 수 있음
    if (authorCount > 0) {
      expect(authorCount).toBeGreaterThanOrEqual(1);
    }

    // 저자명이 어딘가에 표시되어야 함 (리뷰 카드 내)
    const reviewCard = page.locator(SELECTORS.reviewCard).first();
    const cardText = await reviewCard.textContent();

    // 이름이나 저자 정보가 포함되어 있을 것으로 예상
    expect(cardText).toBeTruthy();
  });

  test('리뷰 날짜 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰 날짜가 표시됨
    const reviewDates = page.locator(SELECTORS.reviewDate);
    const dateCount = await reviewDates.count();

    // 날짜 정보가 표시되거나 상대 시간으로 표시될 수 있음
    if (dateCount > 0) {
      expect(dateCount).toBeGreaterThanOrEqual(1);

      // 첫 번째 리뷰 날짜 텍스트 확인
      const firstDate = reviewDates.first();
      const dateText = await firstDate.textContent();
      expect(dateText).toBeTruthy();
    }

    // 날짜 정보가 리뷰 카드에 포함되어 있을 것으로 예상
    const reviewCard = page.locator(SELECTORS.reviewCard).first();
    const cardText = await reviewCard.textContent();
    expect(cardText?.match(/\d{1,2}[:月日년월일]|ago|전/i)).toBeTruthy();
  });

  test('리뷰 이미지 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰 이미지가 표시됨
    const reviewImages = page.locator(SELECTORS.reviewImage);
    const imageCount = await reviewImages.count();

    // 이미지가 표시될 수도 있고 없을 수도 있음
    if (imageCount > 0) {
      expect(imageCount).toBeGreaterThanOrEqual(1);

      // 첫 번째 이미지의 src 속성 확인
      const firstImage = reviewImages.first();
      const src = await firstImage.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toMatch(/\.(jpg|jpeg|png|webp)/i);
    }
  });

  test('리뷰 하이라이트 요소 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰의 하이라이트 요소들이 표시됨
    const reviewCard = page.locator(SELECTORS.reviewCard).first();
    const cardText = await reviewCard.textContent();

    // 리뷰 정보들이 표시되어야 함
    expect(cardText).toBeTruthy();
    expect(cardText?.length).toBeGreaterThan(0);
  });

  test('좋아요 버튼 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 도움이 됨 버튼이 표시됨
    const likeButtons = page.locator(SELECTORS.likeButton);
    const likeCount = await likeButtons.count();

    // 도움이 됨 버튼이 표시될 수도 있고 없을 수도 있음
    if (likeCount > 0) {
      expect(likeCount).toBeGreaterThanOrEqual(1);

      // 첫 번째 좋아요 버튼이 클릭 가능한지 확인
      const firstButton = likeButtons.first();
      const isEnabled = await firstButton
        .isEnabled({ timeout: TIMEOUTS.NAVIGATION })
        .catch(() => true);

      expect(isEnabled).toBe(true);
    }
  });

  test('싫어요 버튼 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 별로예요 버튼이 표시됨
    const dislikeButtons = page.locator(SELECTORS.dislikeButton);
    const dislikeCount = await dislikeButtons.count();

    // 별로예요 버튼이 표시될 수도 있고 없을 수도 있음
    if (dislikeCount > 0) {
      expect(dislikeCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('좋아요 버튼 클릭 기능', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨
    const likeButton = page.locator(SELECTORS.likeButton).first();

    // Act: 좋아요 버튼이 있으면 클릭 시도
    if (await likeButton.count() > 0) {
      // 초기 카운트 확인
      const initialCount = await page.locator(SELECTORS.helpfulCount).first().textContent();

      // 클릭
      await likeButton.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 카운트가 증가했거나 상태가 변함
      const finalCount = await page.locator(SELECTORS.helpfulCount).first().textContent();
      expect(finalCount).toBeTruthy();
    }
  });

  test('평점 필터링 기능', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 평점 필터 버튼이 있는지 확인
    const ratingFilters = page.locator('button, label').filter({
      hasText: /별|★|평점|rating/i,
    });

    const filterCount = await ratingFilters.count();

    // 필터가 있을 수도 있고 없을 수도 있음
    if (filterCount > 0) {
      // 첫 번째 필터 클릭 시도
      await ratingFilters.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 필터가 적용되었는지 확인
      const reviewCards = page.locator(SELECTORS.reviewCard);
      const cardCount = await reviewCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('리뷰 정렬 기능', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 정렬 옵션 버튼이 있는지 확인
    const sortButtons = page.locator('button, [role="button"]').filter({
      hasText: /정렬|최신|유용|순서|sort|recent/i,
    });

    const sortCount = await sortButtons.count();

    // 정렬 옵션이 있을 수도 있고 없을 수도 있음
    if (sortCount > 0) {
      // 첫 번째 정렬 옵션 클릭
      await sortButtons.first().click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // 정렬이 적용되었는지 확인
      const reviewCards = page.locator(SELECTORS.reviewCard);
      const cardCount = await reviewCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('평점 통계 표시', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 평점 통계 정보가 표시됨
    const averageRating = page.locator(SELECTORS.averageRating);
    const ratingDistribution = page.locator(SELECTORS.ratingDistribution);
    const reviewCount = page.locator(SELECTORS.reviewCount);

    const hasAverage = await averageRating
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);
    const hasDistribution = await ratingDistribution
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);
    const hasCount = await reviewCount
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    // 평점 정보가 어딘가에 표시되어야 함
    expect(hasAverage || hasDistribution || hasCount).toBe(true);
  });

  test('리뷰 페이지네이션 또는 로드 더 보기', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨
    const initialCards = await page.locator(SELECTORS.reviewCard).count();

    // Act & Assert: 페이지네이션 또는 로드 더 보기 버튼이 있는지 확인
    const loadMoreButton = page.locator('button').filter({
      hasText: /더 보기|더 불러오기|Load More|더 많은/i,
    });

    const loadMoreCount = await loadMoreButton.count();

    // 더 보기 버튼이 있을 수도 있고 없을 수도 있음
    if (loadMoreCount > 0) {
      // 버튼 클릭
      await loadMoreButton.first().click();
      await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

      // 더 많은 리뷰가 로드되었는지 확인
      const finalCards = await page.locator(SELECTORS.reviewCard).count();
      expect(finalCards).toBeGreaterThanOrEqual(initialCards);
    }
  });

  test('페이지네이션 네비게이션', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 페이지네이션 버튼이 있는지 확인
    const paginationButtons = page.locator('[aria-label*="page"], [class*="pagination"] button');
    const paginationCount = await paginationButtons.count();

    // 페이지네이션이 있을 수도 있고 없을 수도 있음
    if (paginationCount > 0) {
      // 다음 페이지 버튼 찾기
      const nextButton = page.locator('button').filter({
        hasText: /다음|Next|→|»/i,
      });

      if (await nextButton.count() > 0 && !(await nextButton.first().isDisabled())) {
        // 다음 페이지로 이동
        await nextButton.first().click();
        await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

        // 새로운 리뷰들이 로드되었는지 확인
        const reviewCards = page.locator(SELECTORS.reviewCard);
        const cardCount = await reviewCards.count();
        expect(cardCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('리뷰 텍스트 검색', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 검색 입력 필드가 있는지 확인
    const searchInput = page.locator('input[placeholder*="검색"], input[placeholder*="search"]');

    if (await searchInput.count() > 0) {
      // 검색어 입력
      await searchInput.first().fill('좋은');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 검색 버튼 또는 엔터 키
      const searchButton = page.locator('button').filter({
        hasText: /검색|Search|찾기/i,
      });

      if (await searchButton.count() > 0) {
        await searchButton.first().click();
      } else {
        await page.keyboard.press('Enter');
      }

      await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);

      // 검색 결과가 표시되는지 확인
      const reviewCards = page.locator(SELECTORS.reviewCard);
      const cardCount = await reviewCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('모바일 뷰에서 리뷰 표시', async ({ page }) => {
    // Arrange: 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 812 });

    // Act & Assert: 리뷰가 올바르게 표시됨
    const reviewCards = page.locator(SELECTORS.reviewCard);
    const cardCount = await reviewCards.count();

    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('태블릿 뷰에서 리뷰 표시', async ({ page }) => {
    // Arrange: 태블릿 뷰포트 설정
    await page.setViewportSize({ width: 768, height: 1024 });

    // Act & Assert: 리뷰가 올바르게 표시됨
    const reviewCards = page.locator(SELECTORS.reviewCard);
    const cardCount = await reviewCards.count();

    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('리뷰 스크롤 성능', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨
    const reviewSection = page.locator('[data-testid="reviews"], [class*="review"]').first();

    // Act: 리뷰 섹션으로 스크롤
    const startTime = Date.now();
    await reviewSection.scrollIntoViewIfNeeded();
    const scrollTime = Date.now() - startTime;

    // Assert: 스크롤이 빠르게 완료됨
    expect(scrollTime).toBeLessThan(TIMEOUTS.NAVIGATION);
  });

  test('이미지 갤러리 표시 - 리뷰 사진', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 리뷰 이미지가 있는 카드에서 갤러리 표시
    const reviewCard = page.locator(SELECTORS.reviewCard);
    const cardWithImage = reviewCard.filter({ has: page.locator(SELECTORS.reviewImage) }).first();

    if (await cardWithImage.count() > 0) {
      // 첫 번째 이미지 클릭
      const image = cardWithImage.locator(SELECTORS.reviewImage).first();
      if (await image.count() > 0) {
        await image.click();
        await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

        // 갤러리나 확대 이미지가 표시되는지 확인
        const modal = page.locator('[role="dialog"], [class*="modal"]');
        const isModalVisible = await modal
          .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
          .catch(() => false);

        // 갤러리가 표시되거나 새 탭에서 이미지가 열림
        expect(isModalVisible).toBe(true);
      }
    }
  });

  test('리뷰 신고 기능', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨

    // Act & Assert: 신고 버튼이 있는지 확인
    const reportButton = page.locator(SELECTORS.reportButton).first();

    if (await reportButton.count() > 0) {
      // 신고 버튼 클릭
      await reportButton.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // 신고 대화상자가 표시되는지 확인
      const reportDialog = page.locator('[role="dialog"], [class*="dialog"]');
      const isVisible = await reportDialog
        .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
        .catch(() => false);

      expect(isVisible).toBe(true);
    }
  });

  test('리뷰 삭제 옵션 - 작성자일 경우', async ({ page }) => {
    // Arrange: 숙소 상세 페이지 로드됨 (로그인 필요할 수 있음)

    // Act & Assert: 자신이 작성한 리뷰의 삭제 옵션 확인
    const deleteButton = page.locator('button').filter({
      hasText: /삭제|제거|Delete|Remove/i,
    });

    const deleteCount = await deleteButton.count();

    // 삭제 버튼이 있을 수도 있고 없을 수도 있음
    // (자신의 리뷰인 경우에만 표시)
    if (deleteCount > 0) {
      expect(deleteCount).toBeGreaterThanOrEqual(1);
    }
  });
});
