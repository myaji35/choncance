/**
 * Group D2 AI 챗봇 테스트 - 공유 설정
 *
 * 테스트 계정 및 환경 설정
 * - 테스트 사용자: test_chatbot_user@vintee.test
 * - Gemini API 모킹
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
    await loginAsTestUser(page, TEST_CHATBOT_USER.email);

    // 테스트에서 사용
    await use(page);

    // 정리: 로그아웃
    await logoutUser(page);
  },
});

/**
 * 테스트 사용자로 로그인
 * @param page Playwright Page 객체
 * @param email 사용자 이메일
 */
export async function loginAsTestUser(page: Page, email: string) {
  try {
    // 로그인 페이지 접근
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Clerk 로그인 UI 로딩 대기
    await page.waitForTimeout(2000);

    // 이메일 입력
    const emailInput = page.locator('input[type="email"]');

    if (await emailInput.count() > 0) {
      await emailInput.fill(email);
      await page.waitForTimeout(500);

      // 다음 버튼 클릭
      const nextButton = page.locator('button').filter({
        hasText: /다음|계속|Sign in|Next|Continue/i,
      });

      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(1000);
      }

      // 비밀번호 입력
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(TEST_CHATBOT_USER.password);
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
    console.error(`사용자 로그인 실패: ${email}`, error);
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
  }
}

/**
 * Gemini API 모킹 설정
 * @param page Playwright Page 객체
 * @param responseMessage Gemini 응답 메시지
 */
export async function setupGeminiAPIMock(page: Page, responseMessage: string = '안녕하세요! 무엇을 도와드릴까요?') {
  try {
    // Gemini API 응답 모킹
    await page.route('**/api/gemini/**', async (route) => {
      const request = route.request();

      if (request.method() === 'POST') {
        // Gemini 응답
        await route.abort();
      } else if (request.method() === 'GET') {
        await route.continue();
      }
    });

    // 전역 Gemini 객체 모킹
    await page.addInitScript((msg) => {
      (window as any).__GEMINI_MOCK__ = {
        generateContent: async (message: string) => {
          return {
            response: {
              text: () => msg,
            },
          };
        },
      };
    }, responseMessage);
  } catch (error) {
    console.warn('Gemini API 모킹 설정 실패:', error);
  }
}

/**
 * 테스트 챗봇 사용자 정보
 */
export const TEST_CHATBOT_USER = {
  email: 'test_chatbot_user@vintee.test',
  password: 'TestPassword123!',
  name: '테스트 챗봇 사용자',
};

/**
 * 테스트 챗봇 메시지
 */
export const TEST_CHATBOT_MESSAGES = {
  greeting: '안녕하세요! VINTEE에 어서오세요.',
  propertyQuestion: '강원도의 숙소를 추천해주세요.',
  experienceQuestion: '반려동물 동반 가능한 숙소가 있나요?',
  bookingQuestion: '예약 절차는 어떻게 되나요?',
  priceQuestion: '가장 저렴한 숙소는?',
  availabilityQuestion: '내년 1월에 가능한 숙소를 찾고 있습니다.',
  errorMessage: '미안합니다. 이해하지 못했습니다. 다시 말씀해주세요.',
  suggestions: ['숙소 검색', '경험 추천', '예약 도움', '가격 비교'],
};

/**
 * 타이밍 상수
 */
export const TIMEOUTS = {
  NETWORK_IDLE: 3000,
  DIALOG_APPEAR: 2000,
  ANIMATION: 500,
  MESSAGE_SEND: 2000,
  RESPONSE_WAIT: 5000,
  NAVIGATION: 3000,
  TYPING: 3000,
};

/**
 * 선택자 상수
 */
export const SELECTORS = {
  // 챗봇 위젯
  chatbotWidget: '[data-testid="chatbot-widget"], [class*="chatbot"]',
  chatbotButton: 'button[data-testid="chatbot-button"], button[class*="chatbot-btn"]',
  chatbotContainer: '[data-testid="chatbot-container"], [class*="chat-container"]',

  // 메시지
  messageInput: 'input[placeholder*="메시지"], input[placeholder*="message"], textarea[placeholder*="메시지"]',
  sendButton: 'button:has-text("전송"), button:has-text("보내기"), button:has-text("Send"), button[aria-label*="전송"]',
  messageList: '[data-testid="message-list"], [class*="message-list"]',
  messageItem: '[data-testid="message"], [class*="message"], [role="listitem"]',
  userMessage: '[data-testid="user-message"], [class*="user-message"]',
  botMessage: '[data-testid="bot-message"], [class*="bot-message"], [class*="assistant-message"]',
  typingIndicator: '[data-testid="typing-indicator"], [class*="typing"]',

  // 응답
  responseText: '[data-testid="response-text"], [class*="response-text"]',
  responseOption: '[data-testid="option"], button[class*="suggestion"]',
  quickReply: '[data-testid="quick-reply"], button[class*="quick-reply"]',

  // 대화 컨트롤
  clearButton: 'button:has-text("초기화"), button:has-text("지우기"), button:has-text("Clear")',
  closeButton: 'button:has-text("닫기"), button:has-text("Close"), button[aria-label*="닫기"]',
  minimizeButton: 'button:has-text("최소화"), button[aria-label*="최소화"]',

  // 공통
  loadingSpinner: '[role="status"], [aria-busy="true"]',
  errorMessage: '[role="alert"]:has-text("오류"), [role="alert"]:has-text("실패")',
};

/**
 * API 엔드포인트
 */
export const API_ENDPOINTS = {
  chatMessage: '/api/chatbot/message',
  chatHistory: '/api/chatbot/history',
  gemini: '/api/gemini/generate',
};

/**
 * 유틸리티 함수: 메시지 전송
 * @param page Playwright Page 객체
 * @param message 전송할 메시지
 */
export async function sendChatMessage(page: Page, message: string) {
  const messageInput = page.locator(SELECTORS.messageInput);

  if (await messageInput.count() > 0) {
    // 입력 필드에 메시지 입력
    await messageInput.first().fill(message);
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // 전송 버튼 클릭
    const sendButton = page.locator(SELECTORS.sendButton);
    if (await sendButton.count() > 0) {
      await sendButton.first().click();
      await page.waitForTimeout(TIMEOUTS.MESSAGE_SEND);
    } else {
      // 엔터 키로 전송
      await messageInput.first().press('Enter');
      await page.waitForTimeout(TIMEOUTS.MESSAGE_SEND);
    }
  }
}

/**
 * 유틸리티 함수: 챗봇 열기
 * @param page Playwright Page 객체
 */
export async function openChatbot(page: Page) {
  const chatbotButton = page.locator(SELECTORS.chatbotButton);

  if (await chatbotButton.count() > 0) {
    await chatbotButton.click();
    await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);
  }
}

/**
 * 유틸리티 함수: 챗봇 닫기
 * @param page Playwright Page 객체
 */
export async function closeChatbot(page: Page) {
  const closeButton = page.locator(SELECTORS.closeButton);

  if (await closeButton.count() > 0) {
    await closeButton.click();
    await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);
  }
}

/**
 * 유틸리티 함수: 대화 내용 조회
 * @param page Playwright Page 객체
 * @returns 메시지 배열
 */
export async function getChatMessages(page: Page): Promise<string[]> {
  const messages = page.locator(SELECTORS.messageItem);
  const count = await messages.count();
  const messageTexts: string[] = [];

  for (let i = 0; i < count; i++) {
    const text = await messages.nth(i).textContent();
    if (text) {
      messageTexts.push(text.trim());
    }
  }

  return messageTexts;
}

/**
 * 유틸리티 함수: 빠른 답변 클릭
 * @param page Playwright Page 객체
 * @param optionIndex 옵션 인덱스
 */
export async function clickQuickReply(page: Page, optionIndex: number = 0) {
  const options = page.locator(SELECTORS.quickReply);

  if (await options.count() > optionIndex) {
    await options.nth(optionIndex).click();
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);
  }
}

/**
 * 유틸리티 함수: 챗봇 메시지 검증
 * @param message 메시지
 * @returns 유효성 검사 결과
 */
export function validateChatMessage(message: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!message || message.trim().length === 0) {
    errors.push('메시지를 입력해주세요.');
  } else if (message.length > 1000) {
    errors.push('메시지는 1000자 이하여야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
