/**
 * Group B3 관리자 플로우 테스트 - 공유 설정
 *
 * 관리자 계정 및 환경 설정
 * - 테스트 관리자: test_admin@vintee.test
 * - Clerk 인증 시스템 사용
 * - 관리자 전용 기능 테스트 (호스트 승인, 숙소 검토, 시스템 설정)
 * - 병렬 실행 가능한 독립적인 테스트 계정
 */

import { test as base, Page } from '@playwright/test';

export type TestFixtures = {
  authenticatedAdminPage: Page;
};

/**
 * 관리자 인증된 페이지 Fixture
 * 테스트마다 새로운 페이지를 생성하고 관리자 계정으로 로그인합니다.
 */
export const test = base.extend<TestFixtures>({
  authenticatedAdminPage: async ({ page }, use) => {
    // 관리자로 로그인
    await loginAsAdminUser(page, 'test_admin@vintee.test');

    // 관리자 대시보드에 접근 가능한지 확인
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 테스트에서 사용
    await use(page);

    // 정리: 로그아웃
    await logoutUser(page);
  },
});

/**
 * 관리자 사용자로 로그인
 * @param page Playwright Page 객체
 * @param email 관리자 이메일
 */
export async function loginAsAdminUser(page: Page, email: string) {
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
        await passwordInput.fill('AdminPassword123!');
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
    console.error(`관리자 로그인 실패: ${email}`, error);
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
 * 테스트 관리자 정보
 */
export const TEST_ADMIN = {
  email: 'test_admin@vintee.test',
  password: 'AdminPassword123!',
  name: '테스트 관리자',
  phone: '010-1234-5678',
};

/**
 * 테스트 데이터
 */
export const TEST_DATA = {
  // 호스트 승인 테스트용 데이터
  hostApplication: {
    hostEmail: 'test_host_apply@vintee.test',
    hostName: '테스트 호스트 신청자',
    businessName: '테스트 사업체',
    businessNumber: '123-45-67890',
    bankName: '국민은행',
    bankAccountNumber: '1234567890',
    bankAccountHolder: '테스트 호스트',
  },

  // 호스트 거절 테스트용 데이터
  rejectReason: '사업자등록증 미확인',

  // 숙소 검토 테스트용 데이터
  propertyReview: {
    propertyName: '검토 대기 중인 숙소',
    hostEmail: 'test_host_property@vintee.test',
    address: '서울시 강남구 테스트로 456',
    price: 120000,
    maxGuests: 4,
    issues: ['이미지 품질 낮음', '설명 부족'],
  },

  // 거절 사유
  rejectionReason: '숙소 설명이 불충분합니다. 더 자세한 정보와 고품질 이미지를 업로드해주세요.',

  // 사용자 정지 테스트
  bannedUser: {
    email: 'test_banned@vintee.test',
    name: '테스트 사용자',
    reason: '약관 위반',
  },

  // 시스템 설정 테스트
  systemSettings: {
    maintenanceMode: false,
    maxProperties: 50,
    maxExperiences: 100,
    minReviewRating: 1,
    maxReviewRating: 5,
  },

  // SNS 계정 테스트
  snsAccounts: {
    instagramHandle: '@vintee_official',
    facebookUrl: 'https://facebook.com/vintee',
    naverBlogUrl: 'https://blog.naver.com/vintee',
  },

  // 챗봇 설정 테스트
  chatbotSettings: {
    enabled: true,
    welcomeMessage: 'VINTEE 챗봇입니다. 무엇을 도와드릴까요?',
    responseTimeout: 5000,
  },
};

/**
 * 타이밍 상수 (관리자 플로우는 복잡한 폼과 승인 로직을 포함)
 */
export const TIMEOUTS = {
  NETWORK_IDLE: 3000,
  DIALOG_APPEAR: 2000,
  ANIMATION: 500,
  FORM_SUBMIT: 3000,
  NAVIGATION: 3000,
  FILE_UPLOAD: 5000,
  IMAGE_LOAD: 4000,
  APPROVAL_PROCESS: 5000,
};

/**
 * 선택자 상수
 */
export const SELECTORS = {
  // 관리자 대시보드
  adminDashboard: '[data-testid="admin-dashboard"]',
  dashboardTitle: 'h1:has-text("관리자 대시보드")',

  // 호스트 승인 관리
  hostApplicationList: '[data-testid="host-applications-list"]',
  hostApplicationCard: '[data-testid="host-application-card"]',
  hostApplicationDetail: '[data-testid="host-application-detail"]',
  approveHostButton: 'button:has-text("승인"), button:has-text("허용")',
  rejectHostButton: 'button:has-text("거절"), button:has-text("거부")',
  rejectionReasonInput: 'textarea[name="rejectionReason"], textarea[placeholder*="거절"]',

  // 숙소 검토
  propertyReviewList: '[data-testid="property-reviews-list"]',
  propertyReviewCard: '[data-testid="property-review-card"]',
  propertyReviewDetail: '[data-testid="property-review-detail"]',
  approvePropertyButton: 'button:has-text("승인"), button:has-text("허용")',
  rejectPropertyButton: 'button:has-text("거절"), button:has-text("거부")',
  propertyIssueList: '[data-testid="property-issues"]',
  propertyIssueItem: '[data-testid="issue-item"]',

  // 사용자 관리
  usersList: '[data-testid="users-list"]',
  userCard: '[data-testid="user-card"]',
  userSearchInput: 'input[placeholder*="검색"], input[placeholder*="Search"]',
  banUserButton: 'button:has-text("정지"), button:has-text("차단")',
  unbanUserButton: 'button:has-text("해제"), button:has-text("복구")',

  // 통계/대시보드
  statsSection: '[data-testid="stats-section"]',
  totalUsersCount: '[data-testid="total-users"]',
  totalHostsCount: '[data-testid="total-hosts"]',
  totalPropertiesCount: '[data-testid="total-properties"]',
  pendingApprovalsCount: '[data-testid="pending-approvals"]',
  revenueChart: '[data-testid="revenue-chart"]',

  // 시스템 설정
  systemSettings: '[data-testid="system-settings"]',
  maintenanceModeToggle: 'input[type="checkbox"][name="maintenanceMode"]',
  settingsForm: '[data-testid="settings-form"]',

  // SNS 계정 관리
  snsSection: '[data-testid="sns-settings"]',
  instagramInput: 'input[name="instagram"], input[placeholder*="Instagram"]',
  facebookInput: 'input[name="facebook"], input[placeholder*="Facebook"]',
  naverBlogInput: 'input[name="naverBlog"], input[placeholder*="Naver"]',

  // 챗봇 설정
  chatbotSection: '[data-testid="chatbot-settings"]',
  chatbotEnabledToggle: 'input[type="checkbox"][name="chatbotEnabled"]',
  chatbotMessageInput: 'textarea[name="welcomeMessage"]',
  chatbotTimeoutInput: 'input[type="number"][name="responseTimeout"]',

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

  // 네비게이션
  adminNav: '[data-testid="admin-navigation"]',
  dashboardLink: 'a:has-text("대시보드"), a:has-text("Dashboard")',
  hostApprovalsLink: 'a:has-text("호스트 승인"), a:has-text("Host Approvals")',
  propertyReviewLink: 'a:has-text("숙소 검토"), a:has-text("Property Reviews")',
  usersManagementLink: 'a:has-text("사용자 관리"), a:has-text("User Management")',
  settingsLink: 'a:has-text("설정"), a:has-text("Settings")',
};

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // 관리자 관련 API
  adminDashboard: '/api/admin/dashboard',
  adminStats: '/api/admin/stats',

  // 호스트 승인 API
  hostApplications: '/api/admin/host-applications',
  hostApplicationById: (id: string) => `/api/admin/host-applications/${id}`,
  approveHostApplication: (id: string) => `/api/admin/host-applications/${id}/approve`,
  rejectHostApplication: (id: string) => `/api/admin/host-applications/${id}/reject`,

  // 숙소 검토 API
  propertyReviews: '/api/admin/property-reviews',
  propertyReviewById: (id: string) => `/api/admin/property-reviews/${id}`,
  approveProperty: (id: string) => `/api/admin/property-reviews/${id}/approve`,
  rejectProperty: (id: string) => `/api/admin/property-reviews/${id}/reject`,

  // 사용자 관리 API
  users: '/api/admin/users',
  userById: (id: string) => `/api/admin/users/${id}`,
  banUser: (id: string) => `/api/admin/users/${id}/ban`,
  unbanUser: (id: string) => `/api/admin/users/${id}/unban`,

  // 시스템 설정 API
  settings: '/api/admin/settings',
  updateSettings: '/api/admin/settings',

  // SNS 설정 API
  snsSettings: '/api/admin/sns-settings',
  updateSnsSettings: '/api/admin/sns-settings',

  // 챗봇 설정 API
  chatbotSettings: '/api/admin/chatbot-settings',
  updateChatbotSettings: '/api/admin/chatbot-settings',
};

/**
 * 관리자 플로우 헬퍼 함수들
 */

/**
 * 호스트 신청이 목록에 있는지 확인
 * @param page Playwright Page 객체
 * @param hostEmail 호스트 이메일
 */
export async function verifyHostApplicationExists(page: Page, hostEmail: string) {
  const applicationElement = page.locator(SELECTORS.hostApplicationCard).filter({
    hasText: hostEmail
  });

  return await applicationElement.count() > 0;
}

/**
 * 숙소 검토가 목록에 있는지 확인
 * @param page Playwright Page 객체
 * @param propertyName 숙소 이름
 */
export async function verifyPropertyReviewExists(page: Page, propertyName: string) {
  const reviewElement = page.locator(SELECTORS.propertyReviewCard).filter({
    hasText: propertyName
  });

  return await reviewElement.count() > 0;
}

/**
 * 호스트 신청 상세 보기 열기
 * @param page Playwright Page 객체
 * @param hostEmail 호스트 이메일
 */
export async function openHostApplicationDetail(page: Page, hostEmail: string) {
  const applicationCard = page.locator(SELECTORS.hostApplicationCard).filter({
    hasText: hostEmail
  });

  if (await applicationCard.count() > 0) {
    await applicationCard.first().click();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);
    await page.waitForSelector(SELECTORS.hostApplicationDetail, {
      timeout: TIMEOUTS.DIALOG_APPEAR
    });
  }
}

/**
 * 호스트 신청 승인
 * @param page Playwright Page 객체
 */
export async function approveHostApplication(page: Page) {
  const approveButton = page.locator(SELECTORS.approveHostButton).first();

  if (await approveButton.count() > 0) {
    await approveButton.click();
    await page.waitForTimeout(TIMEOUTS.APPROVAL_PROCESS);
    await page.waitForLoadState('networkidle');
  }
}

/**
 * 호스트 신청 거절
 * @param page Playwright Page 객체
 * @param reason 거절 사유
 */
export async function rejectHostApplication(page: Page, reason: string) {
  const rejectButton = page.locator(SELECTORS.rejectHostButton).first();

  if (await rejectButton.count() > 0) {
    await rejectButton.click();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // 거절 사유 입력
    const reasonInput = page.locator(SELECTORS.rejectionReasonInput);
    if (await reasonInput.count() > 0) {
      await reasonInput.first().fill(reason);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 확인 버튼 클릭
      const confirmButton = page.locator(SELECTORS.confirmButton).first();
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await page.waitForTimeout(TIMEOUTS.APPROVAL_PROCESS);
        await page.waitForLoadState('networkidle');
      }
    }
  }
}

/**
 * 숙소 검토 상세 보기 열기
 * @param page Playwright Page 객체
 * @param propertyName 숙소 이름
 */
export async function openPropertyReviewDetail(page: Page, propertyName: string) {
  const reviewCard = page.locator(SELECTORS.propertyReviewCard).filter({
    hasText: propertyName
  });

  if (await reviewCard.count() > 0) {
    await reviewCard.first().click();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);
    await page.waitForSelector(SELECTORS.propertyReviewDetail, {
      timeout: TIMEOUTS.DIALOG_APPEAR
    });
  }
}

/**
 * 숙소 승인
 * @param page Playwright Page 객체
 */
export async function approveProperty(page: Page) {
  const approveButton = page.locator(SELECTORS.approvePropertyButton).first();

  if (await approveButton.count() > 0) {
    await approveButton.click();
    await page.waitForTimeout(TIMEOUTS.APPROVAL_PROCESS);
    await page.waitForLoadState('networkidle');
  }
}

/**
 * 숙소 거절
 * @param page Playwright Page 객체
 * @param reason 거절 사유
 */
export async function rejectProperty(page: Page, reason: string) {
  const rejectButton = page.locator(SELECTORS.rejectPropertyButton).first();

  if (await rejectButton.count() > 0) {
    await rejectButton.click();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // 거절 사유 입력
    const reasonInput = page.locator(SELECTORS.rejectionReasonInput);
    if (await reasonInput.count() > 0) {
      await reasonInput.first().fill(reason);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 확인 버튼 클릭
      const confirmButton = page.locator(SELECTORS.confirmButton).first();
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await page.waitForTimeout(TIMEOUTS.APPROVAL_PROCESS);
        await page.waitForLoadState('networkidle');
      }
    }
  }
}

/**
 * 사용자 검색
 * @param page Playwright Page 객체
 * @param query 검색어 (이메일 또는 이름)
 */
export async function searchUser(page: Page, query: string) {
  const searchInput = page.locator(SELECTORS.userSearchInput);

  if (await searchInput.count() > 0) {
    await searchInput.first().clear();
    await searchInput.first().fill(query);
    await page.waitForTimeout(TIMEOUTS.ANIMATION);
    await page.waitForLoadState('networkidle');
  }
}

/**
 * 사용자 정지
 * @param page Playwright Page 객체
 */
export async function banUser(page: Page) {
  const banButton = page.locator(SELECTORS.banUserButton).first();

  if (await banButton.count() > 0) {
    await banButton.click();
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // 확인 버튼 클릭
    const confirmButton = page.locator(SELECTORS.confirmButton).first();
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
      await page.waitForTimeout(TIMEOUTS.APPROVAL_PROCESS);
      await page.waitForLoadState('networkidle');
    }
  }
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
 * 통계 데이터 확인
 * @param page Playwright Page 객체
 */
export async function getStatistics(page: Page) {
  const statsSection = page.locator(SELECTORS.statsSection);

  if (await statsSection.count() > 0) {
    const totalUsers = page.locator(SELECTORS.totalUsersCount);
    const totalHosts = page.locator(SELECTORS.totalHostsCount);
    const totalProperties = page.locator(SELECTORS.totalPropertiesCount);
    const pendingApprovals = page.locator(SELECTORS.pendingApprovalsCount);

    return {
      users: await totalUsers.count() > 0 ? await totalUsers.first().textContent() : null,
      hosts: await totalHosts.count() > 0 ? await totalHosts.first().textContent() : null,
      properties: await totalProperties.count() > 0 ? await totalProperties.first().textContent() : null,
      pendingApprovals: await pendingApprovals.count() > 0 ? await pendingApprovals.first().textContent() : null,
    };
  }

  return null;
}
