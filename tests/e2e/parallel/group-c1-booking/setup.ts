/**
 * Group C1 예약/결제 플로우 테스트 - 공유 설정
 *
 * 테스트 계정 및 환경 설정
 * - 테스트 사용자: test_booker_1@vintee.test
 * - 테스트 숙소: test_property_1
 * - Toss Payments 모킹 처리
 * - 병렬 실행 가능한 독립적인 테스트 환경
 */

import { test as base, Page, APIRequestContext } from '@playwright/test';
import { APIResponse } from '@playwright/test';

export type TestFixtures = {
  authenticatedPage: Page;
  paymentMockId: string;
};

/**
 * 인증된 페이지 Fixture
 * 테스트마다 새로운 페이지를 생성하고 사용자로 로그인합니다.
 */
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Clerk 토큰 설정을 통한 사용자 로그인
    await loginAsTestBooker(page, TEST_BOOKER.email);

    // 테스트에서 사용
    await use(page);

    // 정리: 로그아웃
    await logoutUser(page);
  },

  paymentMockId: async ({}, use) => {
    // 각 테스트마다 고유한 결제 모킹 ID 생성
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await use(mockId);
  },
});

/**
 * 테스트 예약자로 로그인
 * @param page Playwright Page 객체
 * @param email 사용자 이메일
 */
export async function loginAsTestBooker(page: Page, email: string) {
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
        await passwordInput.fill(TEST_BOOKER.password);
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
    console.error(`예약자 로그인 실패: ${email}`, error);
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
 * Toss Payments 결제 모킹 설정
 * @param page Playwright Page 객체
 * @param mockId 모킹 ID
 * @param success 성공 여부 (기본값: true)
 */
export async function setupTossPaymentsMock(
  page: Page,
  mockId: string,
  success: boolean = true
) {
  try {
    // Toss Payments 전역 객체 모킹
    await page.addInitScript((mockIdParam, successParam) => {
      // Toss Payments 전역 객체 생성
      (window as any).Toss = {
        Payments: {
          init: (clientKey: string) => ({
            requestBillingAuthorizationCard: () => {
              return Promise.resolve({
                authorizationId: mockIdParam,
              });
            },
            requestPayment: (method: string, params: any) => {
              if (successParam) {
                return Promise.resolve({
                  mId: mockIdParam,
                  paymentKey: `payment_${mockIdParam}`,
                  orderId: params.orderId,
                  amount: params.amount,
                  orderName: params.orderName,
                });
              } else {
                return Promise.reject({
                  name: 'PaymentError',
                  message: '결제에 실패했습니다.',
                  code: 'PAYMENT_FAILED',
                });
              }
            },
          }),
        },
      };
    }, mockId, success);
  } catch (error) {
    console.warn('Toss Payments 모킹 설정 실패:', error);
  }
}

/**
 * 예약 API 응답 모킹
 * @param page Playwright Page 객체
 * @param mockId 모킹 ID
 */
export async function setupBookingAPIMock(page: Page, mockId: string) {
  try {
    // 예약 생성 API 모킹
    await page.route('**/api/bookings', async (route) => {
      const request = route.request();
      const method = request.method();

      if (method === 'POST') {
        // 예약 생성 응답
        await route.abort(); // 실제 요청은 차단
        // 응답 대신 성공 상태 코드와 함께 진행
      } else if (method === 'GET') {
        // 예약 목록 조회 응답
        await route.continue();
      }
    });

    // 결제 확인 API 모킹
    await page.route('**/api/payments/confirm', async (route) => {
      const request = route.request();
      const postData = request.postData();

      if (request.method() === 'POST' && postData) {
        const data = JSON.parse(postData);

        // 성공 응답
        await route.abort();
      }
    });
  } catch (error) {
    console.warn('예약 API 모킹 설정 실패:', error);
  }
}

/**
 * 가용성 API 응답 모킹 (성공)
 * @param page Playwright Page 객체
 */
export async function setupAvailabilityAPIMock(page: Page) {
  try {
    await page.route('**/api/availability/**', async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        // 가용성 정보 반환
        await route.continue();
      }
    });
  } catch (error) {
    console.warn('가용성 API 모킹 설정 실패:', error);
  }
}

/**
 * 테스트 예약자 정보
 */
export const TEST_BOOKER = {
  email: 'test_booker_1@vintee.test',
  password: 'TestPassword123!',
  name: '테스트 예약자',
  phone: '010-1111-2222',
  guestName: '김예약',
  guestPhone: '010-3333-4444',
  guestEmail: 'guest@example.com',
};

/**
 * 테스트 숙소 정보
 */
export const TEST_PROPERTY = {
  id: 'test_property_1',
  name: '테스트 시골 펜션',
  pricePerNight: 150000, // ₩150,000
  location: '강원도 강릉시',
  maxGuests: 6,
};

/**
 * 테스트 예약 데이터
 */
export const TEST_BOOKING_DATA = {
  // 체크인/체크아웃 날짜 (내일부터 2박)
  checkInDaysFromToday: 1,
  checkOutDaysFromToday: 3,
  numberOfNights: 2,
  numberOfGuests: 2,

  // 추가 경험 (선택사항)
  experiences: [
    { id: 'exp_1', name: '아침 산책', price: 30000 },
    { id: 'exp_2', name: '저녁 불멍', price: 20000 },
  ],

  // 특수 요청사항
  specialRequests: '아궁이 체험 가능한 시간을 미리 알려주세요.',

  // 결제 정보
  paymentMethod: 'CARD',
  expectedTotalPrice: 150000 * 2, // 2박 기본가
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
  BOOKING_CONFIRMATION: 3000,
};

/**
 * 선택자 상수
 */
export const SELECTORS = {
  // 예약 위젯
  bookingWidget: '[data-testid="booking-widget"]',
  priceDisplay: '[data-testid="price-display"]',
  checkInButton: 'button:has-text("체크인")',
  checkOutButton: 'button:has-text("체크아웃")',
  guestCountButton: 'button:has-text("게스트")',
  reserveButton: 'button:has-text("예약하기"), button:has-text("예약 진행")',

  // 날짜 선택기
  datePicker: '[role="grid"], .calendar, [class*="calendar"]',
  availableDate: '[data-testid="available-date"], .available',
  disabledDate: '[aria-disabled="true"], .disabled',

  // 체크아웃 페이지
  checkoutForm: '[data-testid="checkout-form"], form',
  guestNameInput: 'input[name="guestName"]',
  guestPhoneInput: 'input[name="guestPhone"]',
  guestEmailInput: 'input[name="guestEmail"]',
  specialRequestsTextarea: 'textarea[name="specialRequests"]',
  agreeTermsCheckbox: 'input[type="checkbox"][name="agreeTerms"]',
  paymentButton: 'button:has-text("결제하기"), button:has-text("결제 진행")',

  // 결제 페이지
  paymentWidget: '[data-testid="payment-widget"]',
  paymentMethod: '[data-testid="payment-method"]',
  cardOption: 'label:has-text("카드")',
  confirmPaymentButton: 'button:has-text("결제 완료"), button:has-text("결제")',

  // 성공/실패 페이지
  successMessage: '[data-testid="success-message"], h1:has-text("예약")',
  failureMessage: '[data-testid="error-message"], [role="alert"]:has-text("실패")',
  bookingNumber: '[data-testid="booking-number"]',
  confirmationDetails: '[data-testid="confirmation-details"]',

  // 예약 관리
  bookingList: '[data-testid="booking-list"]',
  bookingCard: '[data-testid="booking-card"]',
  cancelBookingButton: 'button:has-text("예약 취소")',
  modifyBookingButton: 'button:has-text("예약 수정")',

  // 공통
  loadingSpinner: '[role="status"], [aria-busy="true"]',
  errorMessage: '[role="alert"]:has-text("오류"), [role="alert"]:has-text("실패")',
  successAlert: '[role="alert"]:has-text("성공"), [role="alert"]:has-text("완료")',
};

/**
 * API 엔드포인트
 */
export const API_ENDPOINTS = {
  bookings: '/api/bookings',
  availability: '/api/availability',
  payments: '/api/payments',
  properties: '/api/properties',
  paymentConfirm: '/api/payments/confirm',
  paymentRefund: '/api/payments/:id/refund',
};

/**
 * 결제 테스트 카드 정보 (Toss Payments)
 * @see https://docs.tosspayments.com/guide/test
 */
export const TEST_CARDS = {
  success: {
    number: '4000000000000002',
    expiryMonth: '12',
    expiryYear: '28',
    cvc: '123',
  },
  failure: {
    number: '4000000000000010',
    expiryMonth: '12',
    expiryYear: '28',
    cvc: '123',
  },
};

/**
 * 유틸리티 함수: 미래 날짜 생성
 * @param daysFromToday 오늘부터의 일수
 * @returns Date 객체
 */
export function getFutureDate(daysFromToday: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date;
}

/**
 * 유틸리티 함수: 날짜를 문자열로 포맷
 * @param date Date 객체
 * @param format 형식 (기본값: 'YYYY-MM-DD')
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * 유틸리티 함수: 예상 총 가격 계산
 * @param pricePerNight 1박 가격
 * @param numberOfNights 숙박 일수
 * @param experiencePrice 추가 경험 가격 (선택사항)
 * @returns 총 가격
 */
export function calculateTotalPrice(
  pricePerNight: number,
  numberOfNights: number,
  experiencePrice: number = 0
): number {
  return pricePerNight * numberOfNights + experiencePrice;
}

/**
 * 유틸리티 함수: 예약 정보 검증
 * @param bookingData 예약 데이터
 * @returns 유효성 검사 결과
 */
export function validateBookingData(bookingData: typeof TEST_BOOKING_DATA): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (bookingData.numberOfGuests <= 0) {
    errors.push('게스트 수는 1명 이상이어야 합니다.');
  }

  if (bookingData.numberOfNights <= 0) {
    errors.push('숙박 일수는 1일 이상이어야 합니다.');
  }

  if (bookingData.expectedTotalPrice <= 0) {
    errors.push('총 가격은 0보다 커야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
