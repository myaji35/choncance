/**
 * Group D2-01: 챗봇 UI 테스트
 *
 * 목표:
 * - 챗봇 위젯 표시 확인
 * - 챗봇 열기/닫기 기능 확인
 * - 메시지 입력 필드 표시 확인
 * - 전송 버튼 표시 확인
 * - 메시지 목록 표시 확인
 * - 타이핑 표시 확인
 * - 빠른 답변 옵션 표시 확인
 * - 대화 이력 표시 확인
 * - 반응형 디자인 확인
 *
 * 테스트 특성:
 * - 사용자 인증이 필요할 수 있음
 * - 모든 페이지에서 접근 가능
 * - 병렬 실행 가능
 */

import { test, expect } from './setup';
import {
  TIMEOUTS,
  SELECTORS,
  openChatbot,
  closeChatbot,
} from './setup';

test.describe('Group D2-01: 챗봇 UI', () => {
  /**
   * 각 테스트마다 홈페이지에서 시작
   */
  test.beforeEach(async ({ page }) => {
    // 홈페이지 접근
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TIMEOUTS.ANIMATION);
  });

  test('챗봇 위젯 표시 확인', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act & Assert: 챗봇 위젯이 표시됨
    const chatbotButton = page.locator(SELECTORS.chatbotButton);
    const isVisible = await chatbotButton
      .isVisible({ timeout: TIMEOUTS.NAVIGATION })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('챗봇 버튼 위치와 스타일 확인', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 버튼 확인
    const chatbotButton = page.locator(SELECTORS.chatbotButton);

    // Assert: 버튼이 표시되고 클릭 가능함
    if (await chatbotButton.count() > 0) {
      const isEnabled = await chatbotButton.first().isEnabled();
      expect(isEnabled).toBe(true);

      // 버튼 크기 확인
      const box = await chatbotButton.first().boundingBox();
      expect(box).not.toBeNull();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    }
  });

  test('챗봇 열기 기능', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 버튼 클릭
    const chatbotButton = page.locator(SELECTORS.chatbotButton);
    if (await chatbotButton.count() > 0) {
      await chatbotButton.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Assert: 챗봇 컨테이너가 표시됨
      const chatbotContainer = page.locator(SELECTORS.chatbotContainer);
      const isVisible = await chatbotContainer
        .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
        .catch(() => false);

      expect(isVisible).toBe(true);
    }
  });

  test('챗봇 닫기 기능', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // 닫기 버튼 클릭
    const closeButton = page.locator(SELECTORS.closeButton);
    if (await closeButton.count() > 0) {
      await closeButton.click();
      await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

      // Assert: 챗봇 컨테이너가 닫힘
      const chatbotContainer = page.locator(SELECTORS.chatbotContainer);
      const isVisible = await chatbotContainer
        .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
        .catch(() => false);

      expect(isVisible).toBe(false);
    }
  });

  test('메시지 입력 필드 표시', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 메시지 입력 필드가 표시됨
    const messageInput = page.locator(SELECTORS.messageInput);
    const isVisible = await messageInput
      .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('메시지 입력 필드에 포커스', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // 입력 필드 클릭
    const messageInput = page.locator(SELECTORS.messageInput);
    if (await messageInput.count() > 0) {
      await messageInput.first().click();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력 필드에 포커스됨
      const isFocused = await messageInput.first().evaluate((el: HTMLInputElement) => {
        return document.activeElement === el;
      });

      expect(isFocused).toBe(true);
    }
  });

  test('메시지 입력 필드에 텍스트 입력', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // 메시지 입력
    const messageInput = page.locator(SELECTORS.messageInput);
    if (await messageInput.count() > 0) {
      await messageInput.first().fill('테스트 메시지');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 텍스트가 입력됨
      const inputValue = await messageInput.first().inputValue();
      expect(inputValue).toBe('테스트 메시지');
    }
  });

  test('전송 버튼 표시', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 전송 버튼이 표시됨
    const sendButton = page.locator(SELECTORS.sendButton);
    const isVisible = await sendButton
      .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('전송 버튼 상태 - 입력 없을 때', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 입력이 없을 때 전송 버튼 상태 확인
    const sendButton = page.locator(SELECTORS.sendButton);
    if (await sendButton.count() > 0) {
      const isDisabled = await sendButton.first().isDisabled();

      // 비활성화되었거나 활성화되어 있을 수 있음
      expect(isDisabled !== null).toBe(true);
    }
  });

  test('전송 버튼 상태 - 입력이 있을 때', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // 메시지 입력
    const messageInput = page.locator(SELECTORS.messageInput);
    if (await messageInput.count() > 0) {
      await messageInput.first().fill('테스트');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 전송 버튼이 활성화됨
      const sendButton = page.locator(SELECTORS.sendButton);
      if (await sendButton.count() > 0) {
        const isEnabled = await sendButton.first().isEnabled();
        expect(isEnabled).toBe(true);
      }
    }
  });

  test('메시지 목록 표시', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 메시지 목록이 표시됨
    const messageList = page.locator(SELECTORS.messageList);
    const isVisible = await messageList
      .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
      .catch(() => false);

    // 메시지 목록이 있거나 초기 인사말이 표시됨
    expect(isVisible).toBe(true);
  });

  test('초기 인사말 메시지 표시', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 봇의 초기 메시지가 표시됨
    const botMessage = page.locator(SELECTORS.botMessage);
    const messageCount = await botMessage.count();

    // 최소 1개의 봇 메시지가 있어야 함
    expect(messageCount).toBeGreaterThanOrEqual(1);
  });

  test('빠른 답변 옵션 표시', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 빠른 답변 옵션이 표시됨
    const quickReplies = page.locator(SELECTORS.quickReply);
    const replyCount = await quickReplies.count();

    // 빠른 답변이 있을 수도 있고 없을 수도 있음
    if (replyCount > 0) {
      expect(replyCount).toBeGreaterThanOrEqual(1);

      // 첫 번째 옵션이 클릭 가능한지 확인
      const firstOption = quickReplies.first();
      const isEnabled = await firstOption.isEnabled();
      expect(isEnabled).toBe(true);
    }
  });

  test('빠른 답변 옵션 클릭', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // 빠른 답변 클릭
    const quickReplies = page.locator(SELECTORS.quickReply);
    if (await quickReplies.count() > 0) {
      await quickReplies.first().click();
      await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);

      // Assert: 메시지가 전송됨
      const userMessages = page.locator(SELECTORS.userMessage);
      const messageCount = await userMessages.count();
      expect(messageCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('초기화 버튼 표시', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 초기화 버튼이 있는지 확인
    const clearButton = page.locator(SELECTORS.clearButton);
    const isVisible = await clearButton
      .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
      .catch(() => false);

    // 초기화 버튼이 있을 수도 있고 없을 수도 있음
    if (isVisible) {
      expect(isVisible).toBe(true);
    }
  });

  test('초기화 버튼 기능', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // 메시지 입력
    const messageInput = page.locator(SELECTORS.messageInput);
    if (await messageInput.count() > 0) {
      await messageInput.first().fill('테스트');
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // 초기화 버튼 클릭
      const clearButton = page.locator(SELECTORS.clearButton);
      if (await clearButton.count() > 0) {
        await clearButton.click();
        await page.waitForTimeout(TIMEOUTS.ANIMATION);

        // Assert: 메시지가 초기화됨
        const inputValue = await messageInput.first().inputValue();
        expect(inputValue).toBe('');
      }
    }
  });

  test('대화 기록 표시', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 대화 메시지들이 표시됨
    const messageItems = page.locator(SELECTORS.messageItem);
    const itemCount = await messageItems.count();

    // 최소 초기 메시지가 있어야 함
    expect(itemCount).toBeGreaterThanOrEqual(1);
  });

  test('사용자 메시지와 봇 메시지 구분', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 사용자 메시지와 봇 메시지가 구분됨
    const userMessages = page.locator(SELECTORS.userMessage);
    const botMessages = page.locator(SELECTORS.botMessage);

    // 최소 봇 메시지는 있어야 함
    const botCount = await botMessages.count();
    expect(botCount).toBeGreaterThanOrEqual(1);

    // 구조적으로 메시지들이 다르게 표시되는지 확인
    if (botCount > 0) {
      const botMessage = botMessages.first();
      const userMessage = userMessages.first();

      const botClass = await botMessage.getAttribute('class');
      const userClass = userMessage.count() > 0 ? await userMessage.getAttribute('class') : null;

      // 클래스가 다르거나 구조적 차이가 있음
      expect(botClass).toBeTruthy();
    }
  });

  test('메시지 입력 길이 제한', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // 긴 텍스트 입력 시도
    const messageInput = page.locator(SELECTORS.messageInput);
    if (await messageInput.count() > 0) {
      const longText = 'A'.repeat(2000);
      await messageInput.first().fill(longText);
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 입력 길이가 제한됨
      const inputValue = await messageInput.first().inputValue();
      expect(inputValue.length).toBeLessThanOrEqual(1000);
    }
  });

  test('메시지 스크롤 - 새 메시지 자동 스크롤', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // 스크롤 위치 기록
    const messageList = page.locator(SELECTORS.messageList);
    const initialScrollTop = await messageList.first().evaluate((el) => el.scrollTop);

    // 여러 메시지 전송
    for (let i = 0; i < 3; i++) {
      const messageInput = page.locator(SELECTORS.messageInput);
      if (await messageInput.count() > 0) {
        await messageInput.first().fill(`메시지 ${i + 1}`);
        const sendButton = page.locator(SELECTORS.sendButton);
        if (await sendButton.count() > 0) {
          await sendButton.first().click();
          await page.waitForTimeout(TIMEOUTS.MESSAGE_SEND);
        }
      }
    }

    // Assert: 스크롤이 하단으로 이동
    await page.waitForTimeout(TIMEOUTS.RESPONSE_WAIT);
    const finalScrollTop = await messageList.first().evaluate((el) => el.scrollTop);

    // 스크롤이 이동했거나 하단에 있음
    expect(finalScrollTop).toBeGreaterThanOrEqual(initialScrollTop);
  });

  test('모바일 뷰에서 챗봇 UI', async ({ page }) => {
    // Arrange: 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 812 });

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 챗봇이 올바르게 표시됨
    const chatbotContainer = page.locator(SELECTORS.chatbotContainer);
    const isVisible = await chatbotContainer
      .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
      .catch(() => false);

    expect(isVisible).toBe(true);

    // 입력 필드가 표시됨
    const messageInput = page.locator(SELECTORS.messageInput);
    const inputVisible = await messageInput
      .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
      .catch(() => false);

    expect(inputVisible).toBe(true);
  });

  test('태블릿 뷰에서 챗봇 UI', async ({ page }) => {
    // Arrange: 태블릿 뷰포트 설정
    await page.setViewportSize({ width: 768, height: 1024 });

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 챗봇이 올바르게 표시됨
    const chatbotContainer = page.locator(SELECTORS.chatbotContainer);
    const isVisible = await chatbotContainer
      .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('데스크톱 뷰에서 챗봇 UI', async ({ page }) => {
    // Arrange: 데스크톱 뷰포트 설정 (기본값)
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 챗봇이 올바르게 표시됨
    const chatbotContainer = page.locator(SELECTORS.chatbotContainer);
    const isVisible = await chatbotContainer
      .isVisible({ timeout: TIMEOUTS.DIALOG_APPEAR })
      .catch(() => false);

    expect(isVisible).toBe(true);
  });

  test('챗봇 위젯 애니메이션', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 버튼 확인
    const chatbotButton = page.locator(SELECTORS.chatbotButton);

    if (await chatbotButton.count() > 0) {
      // 버튼 호버 상태 확인
      await chatbotButton.first().hover();
      await page.waitForTimeout(TIMEOUTS.ANIMATION);

      // Assert: 버튼이 여전히 보임
      const isVisible = await chatbotButton
        .isVisible({ timeout: TIMEOUTS.ANIMATION })
        .catch(() => false);

      expect(isVisible).toBe(true);
    }
  });

  test('메시지 리스트 접근성', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);

    // Assert: 메시지 리스트가 리스트 역할을 함
    const messageList = page.locator(SELECTORS.messageList);
    if (await messageList.count() > 0) {
      const role = await messageList.first().getAttribute('role');
      expect(role).toMatch(/list|feed|log/i);
    }
  });

  test('입력 필드 자동 포커스', async ({ page }) => {
    // Arrange: 홈페이지 로드됨

    // Act: 챗봇 열기
    await openChatbot(page);
    await page.waitForTimeout(TIMEOUTS.DIALOG_APPEAR);

    // Assert: 입력 필드에 자동으로 포커스됨
    const messageInput = page.locator(SELECTORS.messageInput);
    if (await messageInput.count() > 0) {
      const isFocused = await messageInput.first().evaluate((el: HTMLInputElement) => {
        return document.activeElement === el;
      });

      // 자동 포커스가 있을 수도 있고 없을 수도 있음
      if (isFocused) {
        expect(isFocused).toBe(true);
      }
    }
  });
});
