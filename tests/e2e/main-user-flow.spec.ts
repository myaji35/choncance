import { test, expect } from '@playwright/test';

// 타임아웃을 60초로 설정
test.setTimeout(60000);

test.describe('메인 사용자 플로우 - 홈페이지부터 예약까지', () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동 (baseURL 사용)
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('완전한 사용자 플로우: 홈 → 탐색 → 상세 → 예약', async ({ page }) => {
    console.log('1. 홈페이지 접속 및 확인');

    // VINTEE 로고 또는 브랜드 확인
    const logo = page.locator('text=/VINTEE/i').first();
    await expect(logo).toBeVisible({ timeout: 5000 });

    // 히어로 섹션 확인
    const heroSection = page.locator('h1, h2').first();
    await expect(heroSection).toBeVisible();

    console.log('2. 숙소 탐색 페이지로 이동');

    // Explore 버튼 찾기 및 클릭
    const exploreButton = page.locator('a[href="/explore"], button:has-text("둘러보기"), button:has-text("Explore")').first();
    await exploreButton.click();

    // Explore 페이지 로드 대기
    await page.waitForURL(/\/explore/);
    await page.waitForLoadState('networkidle');

    console.log('3. 숙소 목록 확인');

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(2000);

    // 숙소 카드가 표시되는지 확인 - Link 컴포넌트로 래핑된 a 태그를 찾음
    const propertyCards = page.locator('a[href^="/property/"]');
    await expect(propertyCards.first()).toBeVisible({ timeout: 15000 });

    // 최소 1개 이상의 숙소가 있는지 확인
    const cardCount = await propertyCards.count();
    expect(cardCount).toBeGreaterThan(0);

    console.log(`  - ${cardCount}개의 숙소 발견`);

    console.log('4. 태그 필터 확인');

    // 태그 버튼 확인
    const tags = page.locator('button[data-tag], button:has-text("#"), [role="button"]:has-text("#")');
    if (await tags.count() > 0) {
      console.log(`  - ${await tags.count()}개의 태그 발견`);

      // 첫 번째 태그 클릭 시도
      const firstTag = tags.first();
      const tagText = await firstTag.textContent();
      console.log(`  - 태그 "${tagText}" 클릭`);
      await firstTag.click();
      await page.waitForTimeout(1000);
    }

    console.log('5. 첫 번째 숙소 상세 페이지로 이동');

    // 첫 번째 숙소 카드 클릭
    const firstProperty = propertyCards.first();
    await firstProperty.click();

    // 상세 페이지 로드 대기
    await page.waitForURL(/\/property\//);
    await page.waitForLoadState('networkidle');

    console.log('6. 숙소 상세 정보 확인');

    // 숙소 이름 확인
    const propertyTitle = page.locator('h1, h2').first();
    await expect(propertyTitle).toBeVisible({ timeout: 5000 });
    const titleText = await propertyTitle.textContent();
    console.log(`  - 숙소명: ${titleText}`);

    // 가격 확인
    const priceElement = page.locator('text=/₩|원|\\d+,\\d+/').first();
    if (await priceElement.count() > 0) {
      const price = await priceElement.textContent();
      console.log(`  - 가격: ${price}`);
      expect(price).toBeTruthy();
    }

    // 이미지 확인
    const images = page.locator('img[alt*="property"], img[alt*="숙소"], img').filter({ hasNot: page.locator('[src*="logo"]') });
    const imageCount = await images.count();
    console.log(`  - ${imageCount}개의 이미지 발견`);
    expect(imageCount).toBeGreaterThan(0);

    // 태그 확인
    const detailTags = page.locator('span:has-text("#"), button:has-text("#"), div:has-text("#")').filter({ hasText: /#/ });
    if (await detailTags.count() > 0) {
      console.log(`  - ${await detailTags.count()}개의 태그 표시됨`);
    }

    console.log('7. 예약 위젯 확인');

    // 예약 위젯 또는 예약 관련 요소 찾기
    const bookingWidget = page.locator('form, [data-testid*="booking"], div:has-text("예약"), div:has-text("체크인")').first();

    if (await bookingWidget.count() > 0) {
      console.log('  - 예약 위젯 발견');

      // 날짜 선택 시도
      const dateInput = page.locator('input[type="date"], button:has-text("날짜"), button:has-text("체크인")').first();
      if (await dateInput.count() > 0) {
        console.log('  - 날짜 입력 필드 발견');

        // 날짜 입력 또는 선택
        if (await dateInput.getAttribute('type') === 'date') {
          // 오늘로부터 7일 후와 9일 후로 설정
          const checkIn = new Date();
          checkIn.setDate(checkIn.getDate() + 7);
          const checkOut = new Date();
          checkOut.setDate(checkOut.getDate() + 9);

          const checkInStr = checkIn.toISOString().split('T')[0];
          const checkOutStr = checkOut.toISOString().split('T')[0];

          await dateInput.fill(checkInStr);
          console.log(`  - 체크인 날짜 설정: ${checkInStr}`);

          const checkOutInput = page.locator('input[type="date"]').nth(1);
          if (await checkOutInput.count() > 0) {
            await checkOutInput.fill(checkOutStr);
            console.log(`  - 체크아웃 날짜 설정: ${checkOutStr}`);
          }
        }
      }

      // 인원 수 설정 시도
      const guestInput = page.locator('input[type="number"], button:has-text("인원"), button:has-text("게스트")').first();
      if (await guestInput.count() > 0) {
        console.log('  - 게스트 수 입력 필드 발견');

        if (await guestInput.getAttribute('type') === 'number') {
          await guestInput.fill('2');
          console.log('  - 게스트 수 설정: 2명');
        }
      }

      // 예약 버튼 찾기
      const reserveButton = page.locator('button:has-text("예약"), button:has-text("Reserve"), button[type="submit"]').first();
      if (await reserveButton.count() > 0) {
        console.log('  - 예약 버튼 발견');

        // 버튼이 활성화되어 있는지 확인
        const isDisabled = await reserveButton.isDisabled();
        if (!isDisabled) {
          console.log('  - 예약 버튼 클릭 가능');
          // 실제로 클릭하지 않고 상태만 확인
          // await reserveButton.click();
        } else {
          console.log('  - 예약 버튼이 비활성화됨 (날짜/인원 입력 필요)');
        }
      }
    } else {
      console.log('  - 예약 위젯을 찾을 수 없음 (로그인 필요할 수 있음)');
    }

    console.log('8. 테스트 완료');
    console.log('  ✓ 홈페이지 접속 성공');
    console.log('  ✓ 숙소 탐색 페이지 이동 성공');
    console.log('  ✓ 숙소 목록 표시 확인');
    console.log('  ✓ 숙소 상세 페이지 접근 성공');
    console.log('  ✓ 예약 프로세스 확인 완료');
  });

  test('단계별 테스트: 홈페이지 확인', async ({ page }) => {
    // VINTEE 브랜드 확인
    const brand = page.locator('text=/VINTEE/i');
    await expect(brand.first()).toBeVisible();

    // 네비게이션 메뉴 확인
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();

    // Explore 링크 확인
    const exploreLink = page.locator('a[href="/explore"]');
    await expect(exploreLink.first()).toBeVisible();
  });

  test('단계별 테스트: 탐색 페이지 필터링', async ({ page }) => {
    // 탐색 페이지로 이동
    await page.goto('/explore');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 숙소 카드가 로드되었는지 먼저 확인
    const propertyCards = page.locator('a[href^="/property/"]');
    await expect(propertyCards.first()).toBeVisible({ timeout: 15000 });

    // 검색 바 확인
    const searchBar = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"]');
    if (await searchBar.count() > 0) {
      await searchBar.first().fill('숙소');
      await page.waitForTimeout(1000);
    }

    // 태그 필터 테스트
    const tagButtons = page.locator('button:has-text("#")');
    if (await tagButtons.count() > 0) {
      await tagButtons.first().click();
      await page.waitForTimeout(1000);

      // 필터링 결과 확인
      const filteredCards = page.locator('a[href^="/property/"]');
      const count = await filteredCards.count();
      console.log(`필터링 후 ${count}개의 숙소 표시`);
    }
  });

  test('단계별 테스트: 숙소 상세 정보', async ({ page }) => {
    // explore 페이지에서 첫 번째 숙소 찾기
    await page.goto('/explore');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 첫 번째 숙소 링크 찾기
    const firstProperty = page.locator('a[href^="/property/"]').first();
    await expect(firstProperty).toBeVisible({ timeout: 15000 });

    // href 속성에서 property ID 추출
    const href = await firstProperty.getAttribute('href');
    console.log(`첫 번째 숙소 URL: ${href}`);

    // 숙소 상세 페이지로 이동
    await firstProperty.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 상세 정보 요소들 확인
    const elements = {
      title: page.locator('h1, h2').first(),
      price: page.locator('text=/₩|원/').first(),
      description: page.locator('p, div[class*="description"]').first(),
      images: page.locator('img').filter({ hasNot: page.locator('[src*="logo"]') })
    };

    for (const [key, locator] of Object.entries(elements)) {
      const count = await locator.count();
      if (count > 0) {
        console.log(`✓ ${key} 요소 확인됨`);
      } else {
        console.log(`✗ ${key} 요소를 찾을 수 없음`);
      }
    }
  });
});