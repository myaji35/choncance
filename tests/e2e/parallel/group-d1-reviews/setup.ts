/**
 * Group D1 리뷰 시스템 테스트 - 공유 설정
 *
 * 테스트 계정 및 환경 설정
 * - 테스트 리뷰어: test_reviewer_1@vintee.test
 * - 테스트 숙소: test_property_1
 * - 테스트 예약: test_booking_1
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
    await loginAsTestReviewer(page, TEST_REVIEWER.email);

    // 테스트에서 사용
    await use(page);

    // 정리: 로그아웃
    await logoutUser(page);
  },
});

/**
 * 테스트 리뷰어로 로그인
 * @param page Playwright Page 객체
 * @param email 사용자 이메일
 */
export async function loginAsTestReviewer(page: Page, email: string) {
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
        hasText: /다음|계속|Sign in|Next|Continue/i,
      });

      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(1000);
      }

      // 비밀번호 입력 필드가 있을 경우
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.count() > 0) {
        // 테스트 환경 비밀번호
        await passwordInput.fill(TEST_REVIEWER.password);
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
    console.error(`리뷰어 로그인 실패: ${email}`, error);
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
    // 로그아웃 실패는 치명적이지 않으므로 무시
  }
}

/**
 * 리뷰 API 응답 모킹
 * @param page Playwright Page 객체
 */
export async function setupReviewAPIMock(page: Page) {
  try {
    // 리뷰 생성 API 모킹
    await page.route('**/api/reviews', async (route) => {
      const request = route.request();
      const method = request.method();

      if (method === 'POST') {
        // 리뷰 생성 응답
        await route.continue();
      } else if (method === 'GET') {
        // 리뷰 목록 조회 응답
        await route.continue();
      }
    });
  } catch (error) {
    console.warn('리뷰 API 모킹 설정 실패:', error);
  }
}

/**
 * 테스트 리뷰어 정보
 */
export const TEST_REVIEWER = {
  email: 'test_reviewer_1@vintee.test',
  password: 'TestPassword123!',
  name: '테스트 리뷰어',
  phone: '010-5555-6666',
};

/**
 * 테스트 숙소 정보
 */
export const TEST_PROPERTY = {
  id: 'test_property_1',
  name: '테스트 시골 펜션',
  pricePerNight: 150000,
  location: '강원도 강릉시',
  maxGuests: 6,
};

/**
 * 테스트 예약 정보
 */
export const TEST_BOOKING = {
  id: 'test_booking_1',
  bookingNumber: 'BOOK-20240101-001',
  checkInDate: '2024-01-05',
  checkOutDate: '2024-01-07',
  status: 'COMPLETED',
};

/**
 * 테스트 리뷰 데이터
 */
export const TEST_REVIEW_DATA = {
  rating: 5,
  title: '최고의 숙소 경험입니다!',
  content:
    '너무 좋았습니다. 주인분도 친절하고 시설도 깨끗했습니다. 다시 방문하고 싶습니다.',
  highlightedPoints: ['청결함', '친절함', '좋은 위치'],
  tags: ['#반려동물동반', '#아궁이체험'],
  photoCount: 3, // 업로드할 사진 수
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
  IMAGE_UPLOAD: 5000,
  REVIEW_DISPLAY: 2000,
};

/**
 * 선택자 상수
 */
export const SELECTORS = {
  // 리뷰 작성 폼
  reviewForm: '[data-testid="review-form"], form[name*="review"]',
  ratingInput: 'input[name="rating"]',
  ratingButton: 'button[data-rating]',
  titleInput: 'input[name="title"], input[placeholder*="제목"]',
  contentTextarea: 'textarea[name="content"], textarea[placeholder*="내용"]',
  tagCheckbox: 'input[type="checkbox"][name*="tag"]',
  submitReviewButton: 'button:has-text("리뷰 등록"), button:has-text("제출")',

  // 리뷰 이미지 업로드
  imageUploadInput: 'input[type="file"]',
  imageUploadButton: 'button:has-text("사진 추가"), button:has-text("업로드")',
  imagePreview: '[data-testid="image-preview"], img[alt*="미리보기"]',
  removeImageButton: 'button:has-text("제거"), button:has-text("삭제")',

  // 리뷰 목록
  reviewList: '[data-testid="review-list"]',
  reviewCard: '[data-testid="review-card"], [class*="review"]',
  reviewRating: '[data-testid="review-rating"], [class*="rating"]',
  reviewTitle: '[data-testid="review-title"], h3, h4',
  reviewContent: '[data-testid="review-content"], p',
  reviewAuthor: '[data-testid="review-author"]',
  reviewDate: '[data-testid="review-date"]',
  reviewImage: 'img[alt*="리뷰"], img[alt*="review"]',

  // 리뷰 상호작용
  likeButton: 'button:has-text("좋아요"), button[aria-label*="좋아요"]',
  dislikeButton: 'button:has-text("별로예요"), button[aria-label*="별로"]',
  helpfulCount: '[data-testid="helpful-count"]',
  reportButton: 'button:has-text("신고"), button[aria-label*="신고"]',

  // 평점 통계
  averageRating: '[data-testid="average-rating"]',
  ratingDistribution: '[data-testid="rating-distribution"]',
  reviewCount: '[data-testid="review-count"]',

  // 공통
  loadingSpinner: '[role="status"], [aria-busy="true"]',
  errorMessage: '[role="alert"]:has-text("오류"), [role="alert"]:has-text("실패")',
  successAlert: '[role="alert"]:has-text("성공"), [role="alert"]:has-text("완료")',
};

/**
 * API 엔드포인트
 */
export const API_ENDPOINTS = {
  reviews: '/api/reviews',
  properties: '/api/properties',
  bookings: '/api/bookings',
  uploadImage: '/api/reviews/images',
};

/**
 * 유틸리티 함수: 별 선택하기
 * @param page Playwright Page 객체
 * @param rating 평점 (1-5)
 */
export async function selectRating(page: Page, rating: number) {
  if (rating < 1 || rating > 5) {
    throw new Error('평점은 1-5 사이여야 합니다.');
  }

  // 별점 버튼 선택
  const ratingButtons = page.locator('button[data-rating]');
  if (await ratingButtons.count() > 0) {
    await ratingButtons.nth(rating - 1).click();
  } else {
    // 다른 방식의 평점 선택 (라디오 버튼 등)
    const radioButton = page.locator(`input[type="radio"][value="${rating}"]`);
    if (await radioButton.count() > 0) {
      await radioButton.click();
    }
  }

  await page.waitForTimeout(TIMEOUTS.ANIMATION);
}

/**
 * 유틸리티 함수: 태그 선택하기
 * @param page Playwright Page 객체
 * @param tags 선택할 태그 목록
 */
export async function selectTags(page: Page, tags: string[]) {
  for (const tag of tags) {
    const tagCheckbox = page.locator(
      `input[type="checkbox"][value="${tag}"], label:has-text("${tag}") input[type="checkbox"]`
    );

    if (await tagCheckbox.count() > 0) {
      await tagCheckbox.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }
  }
}

/**
 * 유틸리티 함수: 리뷰 작성하기
 * @param page Playwright Page 객체
 * @param reviewData 리뷰 데이터
 */
export async function submitReview(
  page: Page,
  reviewData: Partial<typeof TEST_REVIEW_DATA>
) {
  // 평점 선택
  if (reviewData.rating !== undefined) {
    await selectRating(page, reviewData.rating);
  }

  // 제목 입력
  if (reviewData.title) {
    const titleInput = page.locator(SELECTORS.titleInput);
    if (await titleInput.count() > 0) {
      await titleInput.first().fill(reviewData.title);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }
  }

  // 내용 입력
  if (reviewData.content) {
    const contentTextarea = page.locator(SELECTORS.contentTextarea);
    if (await contentTextarea.count() > 0) {
      await contentTextarea.first().fill(reviewData.content);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }
  }

  // 태그 선택
  if (reviewData.tags && reviewData.tags.length > 0) {
    await selectTags(page, reviewData.tags);
  }

  // 제출 버튼 클릭
  const submitButton = page.locator(SELECTORS.submitReviewButton);
  if (await submitButton.count() > 0) {
    await submitButton.first().click();
    await page.waitForTimeout(TIMEOUTS.FORM_SUBMIT);
  }
}

/**
 * 유틸리티 함수: 리뷰 검증
 * @param reviewData 리뷰 데이터
 * @returns 유효성 검사 결과
 */
export function validateReviewData(reviewData: typeof TEST_REVIEW_DATA): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('평점은 1-5 사이여야 합니다.');
  }

  if (!reviewData.title || reviewData.title.trim().length === 0) {
    errors.push('제목을 입력해주세요.');
  } else if (reviewData.title.length > 100) {
    errors.push('제목은 100자 이하여야 합니다.');
  }

  if (!reviewData.content || reviewData.content.trim().length === 0) {
    errors.push('내용을 입력해주세요.');
  } else if (reviewData.content.length < 10) {
    errors.push('내용은 최소 10자 이상이어야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
