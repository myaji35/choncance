/**
 * Group B2 호스트 플로우 테스트 - 공유 설정
 *
 * 호스트 계정 및 환경 설정
 * - 테스트 호스트: test_host_1@vintee.test
 * - Clerk 인증 시스템 사용
 * - 호스트 전용 기능 테스트 (숙소 관리, 체험 관리, 호스트 프로필)
 * - 병렬 실행 가능한 독립적인 테스트 계정
 */

import { test as base, Page } from '@playwright/test';

export type TestFixtures = {
  authenticatedHostPage: Page;
};

/**
 * 호스트 인증된 페이지 Fixture
 * 테스트마다 새로운 페이지를 생성하고 호스트 계정으로 로그인합니다.
 */
export const test = base.extend<TestFixtures>({
  authenticatedHostPage: async ({ page }, use) => {
    // 호스트로 로그인
    await loginAsHostUser(page, 'test_host_1@vintee.test');

    // 호스트 대시보드에 접근 가능한지 확인
    await page.goto('/host/dashboard');
    await page.waitForLoadState('networkidle');

    // 테스트에서 사용
    await use(page);

    // 정리: 로그아웃
    await logoutUser(page);
  },
});

/**
 * 호스트 사용자로 로그인
 * @param page Playwright Page 객체
 * @param email 호스트 이메일
 */
export async function loginAsHostUser(page: Page, email: string) {
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
        hasText: /다음|계속|Sign in|Next|Continue/i
      });

      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(1000);
      }

      // 비밀번호 입력 필드가 있을 경우
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.count() > 0) {
        // 테스트 환경 비밀번호 (프로젝트 설정에 따라 변경)
        await passwordInput.fill('HostPassword123!');
        await page.waitForTimeout(500);

        // 로그인 버튼 클릭
        const submitButton = page.locator('button').filter({
          hasText: /로그인|Sign in|Login|제출/i
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
    console.error(`호스트 로그인 실패: ${email}`, error);
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
      hasText: /프로필|계정|로그아웃|Sign out|Logout/i
    });

    if (await userMenu.count() > 0) {
      await userMenu.first().click();
      await page.waitForTimeout(500);

      // 로그아웃 버튼 클릭
      const logoutButton = page.locator('button, a').filter({
        hasText: /로그아웃|Sign out|Logout/i
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
 * 테스트 호스트 정보
 */
export const TEST_HOST = {
  email: 'test_host_1@vintee.test',
  password: 'HostPassword123!',
  name: '테스트 호스트',
  phone: '010-5678-1234',
  bio: '시골 숙박 및 체험을 제공하는 호스트입니다.',
};

/**
 * 테스트 데이터
 */
export const TEST_DATA = {
  // 숙소 생성 테스트용 데이터
  property: {
    name: '테스트 펜션 - 자동화 테스트',
    description: '자동화 테스트를 위한 테스트 펜션입니다. 실제 예약 불가능한 테스트 숙소입니다.',
    address: '서울시 강남구 테스트로 123',
    detailedAddress: '테스트 빌딩 5층',
    price: 150000,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', '에어컨', '냉장고', '침대'],
    rules: '반려동물 동반 불가, 흡연 금지',
    checkInTime: '15:00',
    checkOutTime: '11:00',
  },

  // 숙소 수정용 테스트 데이터
  propertyUpdate: {
    name: '수정된 테스트 펜션',
    description: '수정된 설명입니다.',
    price: 180000,
    maxGuests: 6,
    amenities: ['WiFi', '에어컨', '냉장고', '침대', '세탁기'],
  },

  // 체험 생성 테스트용 데이터
  experience: {
    name: '시골 요리 체험',
    description: '지역 음식 재료를 사용한 전통 요리 체험입니다.',
    category: 'ACTIVITY',
    duration: 120, // 분
    price: 50000,
    capacity: 6,
    tags: ['요리', '전통', '문화'],
    schedule: {
      dayOfWeek: ['금요일', '토요일', '일요일'],
      startTime: '10:00',
      endTime: '12:00',
    },
  },

  // 체험 수정용 테스트 데이터
  experienceUpdate: {
    name: '수정된 요리 체험',
    description: '수정된 체험 설명입니다.',
    price: 60000,
    capacity: 8,
  },

  // 호스트 프로필 업데이트 테스트 데이터
  hostProfile: {
    businessName: '테스트 호스트 사업자',
    businessNumber: '123-45-67890',
    bankAccountHolder: '테스트 호스트',
    bankAccountNumber: '1234567890',
    bankName: '국민은행',
  },

  // 달력 설정 테스트용 데이터
  calendar: {
    availableDates: [
      {
        start: '2026-02-01',
        end: '2026-02-15',
      },
      {
        start: '2026-03-01',
        end: '2026-03-31',
      },
    ],
    blockedDates: [
      {
        start: '2026-02-20',
        end: '2026-02-25',
        reason: '호스트 개인일정',
      },
    ],
  },
};

/**
 * 타이밍 상수 (호스트 플로우는 더 복잡한 폼을 포함하므로 타임아웃 증가)
 */
export const TIMEOUTS = {
  NETWORK_IDLE: 3000,
  DIALOG_APPEAR: 2000,
  ANIMATION: 500,
  FORM_SUBMIT: 3000,
  NAVIGATION: 3000,
  FILE_UPLOAD: 5000,
  IMAGE_LOAD: 4000,
};

/**
 * 선택자 상수
 */
export const SELECTORS = {
  // 호스트 대시보드
  hostDashboard: '[data-testid="host-dashboard"]',
  dashboardTitle: 'h1:has-text("호스트 대시보드")',
  propertyCard: '[data-testid="property-card"]',
  experienceCard: '[data-testid="experience-card"]',

  // 숙소 관리
  propertyForm: '[data-testid="property-form"]',
  addPropertyButton: 'button:has-text("숙소 추가"), button:has-text("새 숙소")',
  propertyNameInput: 'input[name="name"]',
  propertyDescriptionInput: 'textarea[name="description"]',
  propertyPriceInput: 'input[name="price"]',
  propertyMaxGuestsInput: 'input[name="maxGuests"]',
  propertyAddressInput: 'input[name="address"]',
  propertyDetailedAddressInput: 'input[name="detailedAddress"]',
  propertyBedroomsInput: 'input[name="bedrooms"]',
  propertyBathroomsInput: 'input[name="bathrooms"]',
  propertyCheckInTimeInput: 'input[name="checkInTime"]',
  propertyCheckOutTimeInput: 'input[name="checkOutTime"]',
  amenitiesCheckbox: 'input[name*="amenities"]',
  rulesInput: 'textarea[name="rules"]',
  propertyImageUpload: 'input[type="file"][name*="image"]',

  // 체험 관리
  experienceForm: '[data-testid="experience-form"]',
  addExperienceButton: 'button:has-text("체험 추가"), button:has-text("새 체험")',
  experienceNameInput: 'input[name="name"]',
  experienceDescriptionInput: 'textarea[name="description"]',
  experienceDurationInput: 'input[name="duration"]',
  experiencePriceInput: 'input[name="price"]',
  experienceCapacityInput: 'input[name="capacity"]',
  experienceCategorySelect: 'select[name="category"]',
  experienceTagsInput: 'input[name="tags"]',
  experienceScheduleInput: 'input[name="schedule"]',

  // 호스트 프로필
  hostProfileForm: '[data-testid="host-profile-form"]',
  businessNameInput: 'input[name="businessName"]',
  businessNumberInput: 'input[name="businessNumber"]',
  bankAccountHolderInput: 'input[name="bankAccountHolder"]',
  bankAccountNumberInput: 'input[name="bankAccountNumber"]',
  bankNameInput: 'input[name="bankName"]',
  profileBioInput: 'textarea[name="bio"]',
  profileImageUpload: 'input[type="file"][name="profileImage"]',

  // 달력 관리
  calendarView: '[data-testid="calendar-view"]',
  calendarDateCell: '[data-testid="calendar-date"]',
  markAvailableButton: 'button:has-text("사용 가능"), button:has-text("가능")',
  markUnavailableButton: 'button:has-text("사용 불가"), button:has-text("불가")',
  blockDatesButton: 'button:has-text("차단"), button:has-text("블록")',

  // 예약 관리
  bookingsList: '[data-testid="bookings-list"]',
  bookingCard: '[data-testid="booking-card"]',
  bookingDetailButton: 'button:has-text("상세보기"), button:has-text("보기")',
  approveBookingButton: 'button:has-text("승인"), button:has-text("확인")',
  rejectBookingButton: 'button:has-text("거절"), button:has-text("취소")',

  // 수익/통계
  revenueSection: '[data-testid="revenue-section"]',
  totalRevenueText: '[data-testid="total-revenue"]',
  bookingCountText: '[data-testid="booking-count"]',

  // 공통
  saveButton: 'button:has-text("저장"), button:has-text("완료")',
  deleteButton: 'button:has-text("삭제"), button:has-text("제거")',
  editButton: 'button:has-text("수정"), button:has-text("편집")',
  backButton: 'button:has-text("뒤로"), button:has-text("돌아가기")',
  loadingSpinner: '[role="status"], [aria-busy="true"]',
  successMessage: '[role="alert"]:has-text("성공"), [role="alert"]:has-text("완료")',
  errorMessage: '[role="alert"]:has-text("오류"), [role="alert"]:has-text("실패")',
  confirmDialog: '[role="dialog"]',
  confirmButton: 'button:has-text("확인"), button:has-text("예")',
  cancelButton: 'button:has-text("취소"), button:has-text("아니오")',
};

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // 호스트 관련 API
  hostProfile: '/api/host/profile',
  hostDashboard: '/api/host/dashboard',

  // 숙소 관련 API
  properties: '/api/host/properties',
  propertyById: (id: string) => `/api/host/properties/${id}`,
  propertyImages: (id: string) => `/api/host/properties/${id}/images`,

  // 체험 관련 API
  experiences: '/api/host/experiences',
  experienceById: (id: string) => `/api/host/experiences/${id}`,

  // 달력 관련 API
  calendar: (propertyId: string) => `/api/host/properties/${propertyId}/calendar`,
  availability: (propertyId: string) => `/api/host/properties/${propertyId}/availability`,

  // 예약 관련 API
  bookings: '/api/host/bookings',
  bookingById: (id: string) => `/api/host/bookings/${id}`,
};

/**
 * 호스트 플로우 헬퍼 함수들
 */

/**
 * 숙소가 생성되었는지 확인
 * @param page Playwright Page 객체
 * @param propertyName 숙소 이름
 */
export async function verifyPropertyCreated(page: Page, propertyName: string) {
  const propertyElement = page.locator(SELECTORS.propertyCard).filter({
    hasText: propertyName
  });

  return await propertyElement.count() > 0;
}

/**
 * 체험이 생성되었는지 확인
 * @param page Playwright Page 객체
 * @param experienceName 체험 이름
 */
export async function verifyExperienceCreated(page: Page, experienceName: string) {
  const experienceElement = page.locator(SELECTORS.experienceCard).filter({
    hasText: experienceName
  });

  return await experienceElement.count() > 0;
}

/**
 * 폼 제출 및 성공 메시지 확인
 * @param page Playwright Page 객체
 */
export async function submitFormAndWaitForSuccess(page: Page) {
  // 저장 버튼 클릭
  const saveButton = page.locator(SELECTORS.saveButton).first();
  await saveButton.click();

  // 로딩 스피너 대기
  await page.waitForSelector(SELECTORS.loadingSpinner, { timeout: TIMEOUTS.FORM_SUBMIT });

  // 로딩 완료 대기
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(TIMEOUTS.ANIMATION);
}

/**
 * 이미지 업로드 시뮬레이션
 * @param page Playwright Page 객체
 * @param selector 파일 입력 선택자
 * @param fileName 파일명
 */
export async function uploadImageFile(page: Page, selector: string, fileName: string = 'test-image.jpg') {
  const fileInput = page.locator(selector).first();

  // 파일 타입이 올바른지 확인하고 업로드
  await fileInput.setInputFiles({
    name: fileName,
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
  });

  // 이미지 로드 대기
  await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);
}

/**
 * 드롭다운 선택
 * @param page Playwright Page 객체
 * @param selector 선택자
 * @param value 선택값
 */
export async function selectDropdownOption(page: Page, selector: string, value: string) {
  const dropdown = page.locator(selector).first();
  await dropdown.selectOption(value);
  await page.waitForTimeout(TIMEOUTS.ANIMATION);
}

/**
 * 다중 선택 확인란 선택
 * @param page Playwright Page 객체
 * @param selectorPrefix 선택자 접두사
 * @param values 선택할 값 배열
 */
export async function selectCheckboxes(page: Page, selectorPrefix: string, values: string[]) {
  for (const value of values) {
    const checkbox = page.locator(`${selectorPrefix}[value="${value}"]`);
    if (await checkbox.count() > 0) {
      await checkbox.check();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);
    }
  }
}
