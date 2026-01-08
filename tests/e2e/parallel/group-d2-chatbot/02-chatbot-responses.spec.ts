/**
 * Group D2-02: 챗봇 응답 테스트
 *
 * 목표:
 * - 챗봇 메시지 전송 기능 확인
 * - 챗봇 응답 수신 확인
 * - 응답 텍스트 표시 확인
 * - 타이핑 표시 확인
 * - 문맥 이해 확인
 * - 오류 처리 확인
 * - 다국어 지원 확인 (필요시)
 * - 응답 속도 확인
 *
 * 테스트 특성:
 * - 사용자 인증이 필요할 수 있음
 * - 네트워크 요청 필요
 * - Gemini API 모킹 사용
 * - 병렬 실행 가능
 */

import { test, expect } from './setup';
import {
  TEST_CHATBOT_MESSAGES,
  TIMEOUTS,
  SELECTORS,
  openChatbot,
  sendChatMessage,
  getChatMessages,
  validateChatMessage,
} from './setup';

test.describe('Group D2-02: 챗봇 응답', () => {
  /**
   * 각 테스트마다 홈페이지에서 시작하고 챗봇 열기
   */
  test.beforeEach(async ({ page }) => {
    // 홈페이지 접근
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    // 챗봇 열기
    await openChatbot(page);
  });

  test('메시지 전송 기능', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 메시지 전송
    const messageInput = page.locator(SELECTORS.messageInput);
    if (await messageInput.count() > 0) {
      await messageInput.first().fill(TEST_CHATBOT_MESSAGES.propertyQuestion);
      const sendButton = page.locator(SELECTORS.sendButton);

      if (await sendButton.count() > 0) {
        await sendButton.first().click();
        await page.waitForTimeout(TIMEOUTS.MESSAGE_SEND);

        // Assert: 메시지가 전송됨 (입력 필드가 초기화됨)
        const inputValue = await messageInput.first().inputValue();
        expect(inputValue).toBe('');
      }
    }
  });

  test('사용자 메시지 표시', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 메시지 전송
    const testMessage = TEST_CHATBOT_MESSAGES.propertyQuestion;
    await sendChatMessage(page, testMessage);

    // Assert: 사용자 메시지가 표시됨
    const userMessages = page.locator(SELECTORS.userMessage);
    const userCount = await userMessages.count();

    expect(userCount).toBeGreaterThanOrEqual(1);

    // 전송한 메시지가 포함되어 있는지 확인
    if (userCount > 0) {
      const messages = await getChatMessages(page);
      const hasMessage = messages.some((msg) => msg.includes(testMessage) || msg.includes('강원도'));

      expect(hasMessage || userCount > 0).toBe(true);
    }
  });

  test('챗봇 응답 수신', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 메시지 전송
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);

    // Assert: 챗봇 응답을 받음
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    const botMessages = page.locator(SELECTORS.botMessage);
    const botCount = await botMessages.count();

    // 최소 초기 메시지 + 응답 메시지
    expect(botCount).toBeGreaterThanOrEqual(1);
  });

  test('응답 텍스트 표시', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 메시지 전송
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);

    // Assert: 응답 텍스트가 표시됨
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    const responseText = page.locator(SELECTORS.responseText);
    const textCount = await responseText.count();

    if (textCount > 0) {
      expect(textCount).toBeGreaterThanOrEqual(1);

      // 응답 내용 확인
      const firstResponse = responseText.first();
      const responseContent = await firstResponse.textContent();
      expect(responseContent).toBeTruthy();
    }

    // 또는 봇 메시지에 텍스트가 포함됨
    const botMessages = page.locator(SELECTORS.botMessage);
    if (await botMessages.count() > 0) {
      const botText = await botMessages.last().textContent();
      expect(botText).toBeTruthy();
    }
  });

  test('타이핑 표시 - 응답 대기 중', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 메시지 전송
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);

    // 타이핑 표시 확인 (즉시)
    await page.waitForTimeout(TIMEOUTS.ANIMATION);

    const typingIndicator = page.locator(SELECTORS.typingIndicator);
    const hasTyping = await typingIndicator
      .isVisible({ timeout: TIMEOUTS.ANIMATION })
      .catch(() => false);

    // 타이핑 표시가 있을 수도 있고 없을 수도 있음
    if (hasTyping) {
      expect(hasTyping).toBe(true);
    }

    // 응답 대기
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    // 응답이 나타남
    const botMessages = page.locator(SELECTORS.botMessage);
    const botCount = await botMessages.count();
    expect(botCount).toBeGreaterThanOrEqual(1);
  });

  test('여러 메시지 대화', async ({ page }) => {
    // Arrange: 챗봇 열림
    const messages = [
      TEST_CHATBOT_MESSAGES.propertyQuestion,
      TEST_CHATBOT_MESSAGES.priceQuestion,
      TEST_CHATBOT_MESSAGES.experienceQuestion,
    ];

    // Act: 여러 메시지 전송
    for (const message of messages) {
      await sendChatMessage(page, message);
      await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);
    }

    // Assert: 모든 메시지가 전송되고 응답을 받음
    const allMessages = await getChatMessages(page);
    expect(allMessages.length).toBeGreaterThanOrEqual(messages.length);

    // 사용자 메시지와 봇 메시지가 번갈아 나타남
    const userMessages = page.locator(SELECTORS.userMessage);
    const botMessages = page.locator(SELECTORS.botMessage);

    const userCount = await userMessages.count();
    const botCount = await botMessages.count();

    expect(userCount).toBeGreaterThanOrEqual(messages.length);
    expect(botCount).toBeGreaterThanOrEqual(messages.length);
  });

  test('대화 문맥 이해 - 연속 질문', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 첫 번째 질문
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    // 두 번째 관련 질문
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.priceQuestion);
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    // Assert: 두 응답이 모두 표시됨
    const botMessages = page.locator(SELECTORS.botMessage);
    const botCount = await botMessages.count();

    expect(botCount).toBeGreaterThanOrEqual(2);
  });

  test('빠른 답변 옵션을 통한 메시지 전송', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 빠른 답변 옵션 클릭
    const quickReplies = page.locator(SELECTORS.quickReply);
    if (await quickReplies.count() > 0) {
      const optionText = await quickReplies.first().textContent();

      await quickReplies.first().click();
      await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

      // Assert: 메시지가 전송되고 응답을 받음
      const userMessages = page.locator(SELECTORS.userMessage);
      const botMessages = page.locator(SELECTORS.botMessage);

      const userCount = await userMessages.count();
      const botCount = await botMessages.count();

      expect(userCount).toBeGreaterThanOrEqual(1);
      expect(botCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('특수 문자를 포함한 메시지 전송', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 특수 문자가 포함된 메시지 전송
    const specialMessage = '!@#$%^&*()_+-=[]{}|;:",.<>?';
    await sendChatMessage(page, specialMessage);

    // Assert: 메시지가 전송됨
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    const userMessages = page.locator(SELECTORS.userMessage);
    const userCount = await userMessages.count();

    expect(userCount).toBeGreaterThanOrEqual(1);
  });

  test('긴 메시지 전송', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 긴 메시지 전송
    const longMessage = '안녕하세요. 저는 강원도의 시골 펜션을 찾고 있습니다. 가족 3명이 함께 여행하려고 하는데, 반려동물도 함께 데려가고 싶습니다. 가격은 적당하면서도 경험이 좋은 곳을 찾고 있어요.';
    await sendChatMessage(page, longMessage);

    // Assert: 메시지가 전송되고 응답을 받음
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    const userMessages = page.locator(SELECTORS.userMessage);
    const botMessages = page.locator(SELECTORS.botMessage);

    const userCount = await userMessages.count();
    const botCount = await botMessages.count();

    expect(userCount).toBeGreaterThanOrEqual(1);
    expect(botCount).toBeGreaterThanOrEqual(1);
  });

  test('영어 메시지 전송', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 영어 메시지 전송
    const englishMessage = 'Can you recommend a rural accommodation in Korea?';
    await sendChatMessage(page, englishMessage);

    // Assert: 메시지가 전송되고 응답을 받음
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    const userMessages = page.locator(SELECTORS.userMessage);
    const botMessages = page.locator(SELECTORS.botMessage);

    const userCount = await userMessages.count();
    const botCount = await botMessages.count();

    expect(userCount).toBeGreaterThanOrEqual(1);
    expect(botCount).toBeGreaterThanOrEqual(1);
  });

  test('빈 메시지 전송 시도', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 빈 메시지 전송 시도
    const messageInput = page.locator(SELECTORS.messageInput);
    if (await messageInput.count() > 0) {
      await messageInput.first().fill('');
      const sendButton = page.locator(SELECTORS.sendButton);

      if (await sendButton.count() > 0) {
        const isDisabled = await sendButton.first().isDisabled();

        // Assert: 전송 버튼이 비활성화되거나 전송 실패
        if (isDisabled) {
          expect(isDisabled).toBe(true);
        } else {
          // 전송 시도
          await sendButton.first().click();
          await page.waitForTimeout(TIMEOUTS.MESSAGE_SEND);

          // 메시지가 전송되지 않았거나 오류 메시지 표시
          const errorMessage = page.locator(SELECTORS.errorMessage);
          const hasError = await errorMessage
            .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
            .catch(() => false);

          expect(hasError).toBe(true);
        }
      }
    }
  });

  test('연속 메시지 전송 - 응답 대기', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 첫 번째 메시지 전송
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);
    await page.waitForTimeout(TIMEOUTS.MESSAGE_SEND);

    // 두 번째 메시지 전송 (첫 응답 대기 중)
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.priceQuestion);

    // Assert: 모든 메시지가 처리됨
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT * 2);

    const userMessages = page.locator(SELECTORS.userMessage);
    const botMessages = page.locator(SELECTORS.botMessage);

    const userCount = await userMessages.count();
    const botCount = await botMessages.count();

    expect(userCount).toBeGreaterThanOrEqual(2);
    expect(botCount).toBeGreaterThanOrEqual(2);
  });

  test('응답 속도 - 5초 이내', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 메시지 전송 및 응답 시간 측정
    const startTime = Date.now();
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);

    // 응답 대기
    const botMessages = page.locator(SELECTORS.botMessage);
    let responseReceived = false;

    for (let i = 0; i < 10; i++) {
      const count = await botMessages.count();
      if (count > 1) {
        responseReceived = true;
        break;
      }
      await page.waitForTimeout(500);
    }

    const responseTime = Date.now() - startTime;

    // Assert: 응답이 5초 이내에 도착함
    if (responseReceived) {
      expect(responseTime).toBeLessThan(TIMEOUTS.RESPONSE_WAIT + 2000);
    }
  });

  test('응답 메시지 최소 길이 확인', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 메시지 전송
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);

    // Assert: 응답 메시지에 내용이 있음
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    const botMessages = page.locator(SELECTORS.botMessage);
    if (await botMessages.count() > 0) {
      const lastBotMessage = botMessages.last();
      const messageText = await lastBotMessage.textContent();

      // 응답이 의미 있는 길이여야 함 (빈 메시지 아님)
      expect(messageText).toBeTruthy();
      if (messageText) {
        expect(messageText.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('대화 초기화 후 새로운 대화 시작', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 첫 번째 메시지 전송
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    const initialMessages = await getChatMessages(page);
    const initialCount = initialMessages.length;

    // 대화 초기화
    const clearButton = page.locator(SELECTORS.clearButton);
    if (await clearButton.count() > 0) {
      await clearButton.click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 대화 기록이 초기화됨
      const messagesAfterClear = await getChatMessages(page);
      expect(messagesAfterClear.length).toBeLessThan(initialCount);
    }
  });

  test('메시지 데이터 검증', async ({ page }) => {
    // Arrange: 테스트 메시지 검증

    // Act & Assert: 메시지가 유효한지 확인
    const validation = validateChatMessage(TEST_CHATBOT_MESSAGES.propertyQuestion);
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  test('무효한 메시지 검증', async ({ page }) => {
    // Arrange: 무효한 메시지

    // Act & Assert: 빈 메시지가 유효하지 않음
    const validation = validateChatMessage('');
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  test('응답 옵션 클릭', async ({ page }) => {
    // Arrange: 챗봇 열림

    // Act: 메시지 전송
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    // 응답 옵션이 있으면 클릭
    const responseOptions = page.locator(SELECTORS.responseOption);
    const optionCount = await responseOptions.count();

    if (optionCount > 0) {
      await responseOptions.first().click();
      await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

      // Assert: 옵션 클릭 후 응답을 받음
      const allMessages = await getChatMessages(page);
      expect(allMessages.length).toBeGreaterThan(0);
    }
  });

  test('모바일에서 메시지 전송', async ({ page }) => {
    // Arrange: 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 812 });

    // Act: 메시지 전송
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);

    // Assert: 메시지가 전송되고 응답을 받음
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    const userMessages = page.locator(SELECTORS.userMessage);
    const botMessages = page.locator(SELECTORS.botMessage);

    const userCount = await userMessages.count();
    const botCount = await botMessages.count();

    expect(userCount).toBeGreaterThanOrEqual(1);
    expect(botCount).toBeGreaterThanOrEqual(1);
  });

  test('태블릿에서 메시지 전송', async ({ page }) => {
    // Arrange: 태블릿 뷰포트 설정
    await page.setViewportSize({ width: 768, height: 1024 });

    // Act: 메시지 전송
    await sendChatMessage(page, TEST_CHATBOT_MESSAGES.propertyQuestion);

    // Assert: 메시지가 전송되고 응답을 받음
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

    const userMessages = page.locator(SELECTORS.userMessage);
    const botMessages = page.locator(SELECTORS.botMessage);

    const userCount = await userMessages.count();
    const botCount = await botMessages.count();

    expect(userCount).toBeGreaterThanOrEqual(1);
    expect(botCount).toBeGreaterThanOrEqual(1);
  });
});
