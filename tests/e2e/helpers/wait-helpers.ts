import { Page, expect } from '@playwright/test';

/**
 * 테스트 대기 헬퍼 함수들
 *
 * 목표: 안정적인 요소 검색과 타임아웃 처리 제공
 */

/**
 * DOM이 로드될 때까지 대기하되, networkidle은 기다리지 않음
 *
 * 사용: VINTEE 홈페이지 같이 외부 API 호출이 있는 경우
 *
 * @param page Playwright Page 객체
 * @param maxWait 최대 대기 시간 (ms)
 */
export async function waitForPageReady(page: Page, maxWait = 15000): Promise<void> {
  const startTime = Date.now();

  try {
    await page.waitForLoadState('domcontentloaded', { timeout: maxWait });

    // 추가 대기: 주요 콘텐츠 렌더링 완료
    await page.waitForTimeout(500);
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.warn(`Page not ready within ${elapsed}ms, continuing anyway`);
  }
}

/**
 * 특정 요소가 보일 때까지 대기
 *
 * 사용: 비동기로 렌더링되는 요소들
 *
 * @param page Playwright Page 객체
 * @param selector CSS 선택자
 * @param timeout 타임아웃 (ms)
 * @returns 요소가 보이면 true, 타임아웃이면 false
 */
export async function waitForElementVisible(
  page: Page,
  selector: string,
  timeout = 8000
): Promise<boolean> {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * 여러 선택자 중 하나라도 보일 때까지 대기 (폴백)
 *
 * 사용: 페이지 구조가 변할 수 있는 경우
 *
 * @param page Playwright Page 객체
 * @param selectors CSS 선택자 배열
 * @param timeout 타임아웃 (ms)
 * @returns 보인 요소의 선택자, 모두 실패하면 null
 */
export async function waitForAnyElementVisible(
  page: Page,
  selectors: string[],
  timeout = 5000
): Promise<string | null> {
  const timeoutPerSelector = timeout / selectors.length;

  for (const selector of selectors) {
    const isVisible = await waitForElementVisible(
      page,
      selector,
      Math.max(timeoutPerSelector, 1000)
    );

    if (isVisible) {
      return selector;
    }
  }

  return null;
}

/**
 * 요소가 보일 때까지 대기하고, 타임아웃 시 로깅
 *
 * 사용: 필수 요소 (실패해도 테스트는 계속)
 *
 * @param page Playwright Page 객체
 * @param selector CSS 선택자
 * @param elementName 요소 이름 (로깅용)
 * @param timeout 타임아웃 (ms)
 * @returns 요소가 보이면 true, 아니면 false
 */
export async function waitForElementVisibleWithLog(
  page: Page,
  selector: string,
  elementName: string,
  timeout = 5000
): Promise<boolean> {
  try {
    const isVisible = await waitForElementVisible(page, selector, timeout);

    if (!isVisible) {
      console.log(`⚠️  ${elementName} 찾을 수 없음 (타임아웃: ${timeout}ms)`);
    }

    return isVisible;
  } catch (error) {
    console.error(`❌ ${elementName} 대기 중 오류:`, error);
    return false;
  }
}

/**
 * 페이지 스크롤 후 요소 대기
 *
 * 사용: 스크롤이 필요한 요소 (푸터 등)
 *
 * @param page Playwright Page 객체
 * @param selector CSS 선택자
 * @param scrollDirection 'down' | 'up'
 * @param timeout 타임아웃 (ms)
 * @returns 요소가 보이면 true, 아니면 false
 */
export async function waitForElementAfterScroll(
  page: Page,
  selector: string,
  scrollDirection: 'down' | 'up' = 'down',
  timeout = 5000
): Promise<boolean> {
  try {
    // 스크롤
    if (scrollDirection === 'down') {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    } else {
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // 렌더링 시간 확보
    await page.waitForTimeout(500);

    // 요소 대기
    return await waitForElementVisible(page, selector, timeout);
  } catch {
    return false;
  }
}

/**
 * 네비게이션 후 로드 완료까지 대기
 *
 * 사용: 링크 클릭 후 새 페이지 로드
 *
 * @param page Playwright Page 객체
 * @param url 대상 URL
 * @param timeout 타임아웃 (ms)
 */
export async function navigateTo(
  page: Page,
  url: string,
  timeout = 30000
): Promise<void> {
  const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout });
  await page.goto(url);

  try {
    await navigationPromise;
  } catch {
    // 네비게이션이 실패해도 현재 상태로 계속
    console.warn(`Navigation to ${url} timed out, continuing`);
  }
}

/**
 * 특정 요소가 사라질 때까지 대기
 *
 * 사용: 로딩 스피너 사라질 때까지 대기
 *
 * @param page Playwright Page 객체
 * @param selector CSS 선택자
 * @param timeout 타임아웃 (ms)
 * @returns 요소가 사라지면 true, 타임아웃이면 false
 */
export async function waitForElementHidden(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<boolean> {
  try {
    await page.locator(selector).first().waitFor({ state: 'hidden', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * API 응답 모킹 설정
 *
 * 사용: 외부 API에 의존하지 않는 테스트
 *
 * @param page Playwright Page 객체
 * @param urlPattern URL 패턴
 * @param responseData 응답 데이터
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: unknown
): Promise<void> {
  await page.route(urlPattern, (route) => {
    route.abort('blockedclient');
  });
}

/**
 * 성능 메트릭 측정
 *
 * 사용: 페이지 로드 성능 확인
 *
 * @param page Playwright Page 객体
 * @returns 성능 메트릭 객체
 */
export async function getPerformanceMetrics(page: Page): Promise<{
  navigationTiming?: PerformanceTiming;
  paintTiming?: PerformanceEntryList;
  resourceTiming?: PerformanceEntryList;
}> {
  try {
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: timing?.domContentLoadedEventEnd ?? 0,
        loadComplete: timing?.loadEventEnd ?? 0,
        domInteractive: timing?.domInteractive ?? 0,
      };
    });

    const paintTiming = await page.evaluate(() => {
      return performance.getEntriesByType('paint');
    });

    return {
      navigationTiming: navigationTiming as PerformanceTiming,
      paintTiming: paintTiming as PerformanceEntryList,
    };
  } catch (error) {
    console.warn('Failed to get performance metrics:', error);
    return {};
  }
}

/**
 * 요소 존재 확인 (보이지 않아도 OK)
 *
 * 사용: 요소가 DOM에 있는지만 확인
 *
 * @param page Playwright Page 객체
 * @param selector CSS 선택자
 * @returns 요소가 존재하면 true
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    const count = await page.locator(selector).count();
    return count > 0;
  } catch {
    return false;
  }
}

/**
 * 텍스트 포함 요소 대기
 *
 * 사용: 동적 텍스트를 가진 요소 검색
 *
 * @param page Playwright Page 객체
 * @param text 검색 텍스트
 * @param timeout 타임아웃 (ms)
 * @returns 요소가 보이면 true
 */
export async function waitForTextVisible(
  page: Page,
  text: string | RegExp,
  timeout = 5000
): Promise<boolean> {
  try {
    const locator = typeof text === 'string'
      ? page.locator(`text=${text}`)
      : page.locator(`:has-text(${text})`);

    await locator.first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}
