import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// 테스트 환경 변수 로드
dotenv.config({ path: '.env.test' });

/**
 * VINTEE Playwright E2E 테스트 병렬 실행 설정
 *
 * 테스트 그룹:
 * - Group A: 읽기 전용 테스트 (완전 병렬)
 * - Group B: 사용자별 격리 테스트 (병렬)
 * - Group C: 예약/결제 플로우 (병렬)
 * - Group D: 기능별 독립 테스트 (병렬)
 * - Group E: 순차 실행 필요 테스트
 * - Group F: 성능/접근성 테스트
 */
export default defineConfig({
  testDir: './tests/e2e',

  // 전역 타임아웃 설정
  timeout: 30 * 1000, // 각 테스트 30초
  expect: {
    timeout: 10 * 1000, // expect 10초
  },

  // 병렬 실행 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // CI에서는 .only() 금지
  retries: process.env.CI ? 2 : 0, // CI에서만 재시도
  workers: process.env.CI ? 4 : 8, // CI: 4워커, 로컬: 8워커

  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env.CI ? ['github'] : null,
  ].filter(Boolean) as any,

  // 공통 설정
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3010',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    viewport: { width: 1280, height: 720 },

    // 테스트 메타데이터
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  // 프로젝트 (테스트 그룹) 정의
  projects: [
    // ========== Group A: 읽기 전용 테스트 (병렬) ==========
    {
      name: 'group-a1-public',
      testMatch: /parallel\/group-a1-public\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined, // 인증 불필요
      },
    },
    {
      name: 'group-a2-components',
      testMatch: /parallel\/group-a2-components\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined,
      },
    },

    // ========== Group B: 사용자별 격리 테스트 (병렬) ==========
    {
      name: 'group-b1-user',
      testMatch: /parallel\/group-b1-user\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user1.json', // 사용자 1 인증
      },
      dependencies: ['setup-user1'],
    },
    {
      name: 'group-b2-host',
      testMatch: /parallel\/group-b2-host\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/host1.json', // 호스트 1 인증
      },
      dependencies: ['setup-host1'],
    },
    {
      name: 'group-b3-admin',
      testMatch: /parallel\/group-b3-admin\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json', // 관리자 인증
      },
      dependencies: ['setup-admin'],
    },

    // ========== Group C: 예약/결제 플로우 (병렬) ==========
    {
      name: 'group-c1-booking',
      testMatch: /parallel\/group-c1-booking\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/booker1.json',
        // Toss Payments 테스트 모드
        extraHTTPHeaders: {
          'X-Test-Mode': 'true',
        },
      },
      dependencies: ['setup-booker1'],
    },
    {
      name: 'group-c2-booking-alt',
      testMatch: /parallel\/group-c2-booking-alt\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/booker2.json',
        extraHTTPHeaders: {
          'X-Test-Mode': 'true',
        },
      },
      dependencies: ['setup-booker2'],
    },
    {
      name: 'group-c3-host-bookings',
      testMatch: /parallel\/group-c3-host-bookings\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/host2.json',
      },
      dependencies: ['setup-host2'],
    },

    // ========== Group D: 기능별 독립 테스트 (병렬) ==========
    {
      name: 'group-d1-reviews',
      testMatch: /parallel\/group-d1-reviews\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/reviewer.json',
      },
      dependencies: ['setup-reviewer'],
    },
    {
      name: 'group-d2-chatbot',
      testMatch: /parallel\/group-d2-chatbot\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user2.json',
      },
      dependencies: ['setup-user2'],
    },
    {
      name: 'group-d3-credits',
      testMatch: /parallel\/group-d3-credits\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/credit-user.json',
      },
      dependencies: ['setup-credit-user'],
    },

    // ========== Group E: 순차 실행 필요 테스트 ==========
    {
      name: 'group-e1-journey',
      testMatch: /sequential\/group-e1-journey\/.*\.spec\.ts/,
      fullyParallel: false, // 순차 실행
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'group-e2-dependencies',
      testMatch: /sequential\/group-e2-dependencies\/.*\.spec\.ts/,
      fullyParallel: false, // 순차 실행
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // ========== Group F: 성능/접근성 테스트 ==========
    {
      name: 'performance',
      testMatch: /performance\/.*\.spec\.ts/,
      fullyParallel: false,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-gpu-benchmarking',
            '--enable-automation',
            '--no-sandbox',
          ],
        },
      },
    },
    {
      name: 'accessibility',
      testMatch: /accessibility\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // ========== 모바일 테스트 ==========
    {
      name: 'mobile-ios',
      testMatch: /parallel\/group-a1-public\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'mobile-android',
      testMatch: /parallel\/group-a1-public\/.*\.spec\.ts/,
      fullyParallel: true,
      use: {
        ...devices['Pixel 5'],
      },
    },

    // ========== Setup Projects (인증 상태 저장) ==========
    {
      name: 'setup-user1',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: '.',
      use: {
        testIdAttribute: 'data-user-type',
        testId: 'user1',
      },
    },
    {
      name: 'setup-host1',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: '.',
      use: {
        testIdAttribute: 'data-user-type',
        testId: 'host1',
      },
    },
    {
      name: 'setup-admin',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: '.',
      use: {
        testIdAttribute: 'data-user-type',
        testId: 'admin',
      },
    },
    {
      name: 'setup-booker1',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: '.',
      use: {
        testIdAttribute: 'data-user-type',
        testId: 'booker1',
      },
    },
    {
      name: 'setup-booker2',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: '.',
      use: {
        testIdAttribute: 'data-user-type',
        testId: 'booker2',
      },
    },
    {
      name: 'setup-host2',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: '.',
      use: {
        testIdAttribute: 'data-user-type',
        testId: 'host2',
      },
    },
    {
      name: 'setup-reviewer',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: '.',
      use: {
        testIdAttribute: 'data-user-type',
        testId: 'reviewer',
      },
    },
    {
      name: 'setup-user2',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: '.',
      use: {
        testIdAttribute: 'data-user-type',
        testId: 'user2',
      },
    },
    {
      name: 'setup-credit-user',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: '.',
      use: {
        testIdAttribute: 'data-user-type',
        testId: 'credit-user',
      },
    },
  ],

  // 로컬 개발 서버 설정
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3010',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_TEST_MODE: 'true',
    },
  },

  // 출력 디렉토리
  outputDir: 'test-results/',
});

// 환경별 워커 수 최적화
export function getOptimalWorkerCount(): number {
  const cpuCount = require('os').cpus().length;

  if (process.env.CI) {
    // CI 환경: 안정성 우선
    return Math.min(4, cpuCount);
  }

  // 로컬 환경: 성능 우선
  return Math.min(8, Math.max(1, cpuCount - 1));
}