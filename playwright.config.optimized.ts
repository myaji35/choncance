import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 최적화 설정
 *
 * 특징:
 * - Chromium과 Mobile Chrome만 테스트 (Firefox/WebKit 제외)
 * - 더 현실적인 타임아웃 설정
 * - 향상된 성능 메트릭
 * - CI/CD 친화적 설정
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* 테스트 병렬 실행 */
  fullyParallel: true,

  /* CI에서 test.only 방지 */
  forbidOnly: !!process.env.CI,

  /* CI에서만 재시도 */
  retries: process.env.CI ? 2 : 0,

  /* CI에서는 순차 실행 (메모리 절약) */
  workers: process.env.CI ? 1 : undefined,

  /* 더 현실적인 타임아웃 설정 */
  timeout: 60 * 1000, // 60초 (기본 30초에서 증가)

  /* 리포터 설정 */
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  /* 공유 설정 */
  use: {
    /* Base URL */
    baseURL: 'http://localhost:3010',

    /* 추적 설정 */
    trace: 'on-first-retry',

    /* 스크린샷 설정 */
    screenshot: 'only-on-failure',

    /* 비디오 설정 */
    video: 'retain-on-failure',

    /* 네비게이션 타임아웃 */
    navigationTimeout: 30 * 1000,

    /* 액션 타임아웃 */
    actionTimeout: 10 * 1000,
  },

  /* 프로젝트 설정 (Chromium과 Mobile Chrome만) */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        /* Chromium 특화 설정 */
        launchArgs: [
          '--disable-blink-features=AutomationControlled',
        ],
      },
    },

    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        /* 모바일 크롬 특화 설정 */
        isMobile: true,
        hasTouch: true,
      },
    },

    /**
     * Firefox/WebKit은 다음 설정 후 활성화:
     * npx playwright install
     *
     * {
     *   name: 'firefox',
     *   use: { ...devices['Desktop Firefox'] },
     * },
     *
     * {
     *   name: 'webkit',
     *   use: { ...devices['Desktop Safari'] },
     * },
     */
  ],

  /* 로컬 개발 서버 설정 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3010',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  /* 웹 서버 환경 변수 */
  env: {
    // 필요한 환경 변수 설정
    NODE_ENV: 'test',
  },

  /**
   * 글로벌 설정
   */
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),
});
