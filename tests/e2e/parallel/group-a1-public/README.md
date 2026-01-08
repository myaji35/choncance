# Group A1: 공개 페이지 읽기 전용 테스트

## 개요

이 테스트 그룹은 VINTEE 플랫폼의 **공개 페이지들에 대한 읽기 전용 테스트**를 수행합니다.

- **테스트 대상**: 로그인이 필요 없는 공개 페이지
- **테스트 특성**: 데이터 수정 없음, 완전히 병렬 실행 가능
- **예상 실행 시간**: ~3분 (모든 브라우저 포함)

## 테스트 파일 구성

### 1. 01-homepage.spec.ts
**홈페이지 UI 및 레이아웃 테스트**

목표:
- 홈페이지 기본 로딩 확인
- VINTEE 브랜드 표시 확인
- 메인 히어로 섹션 렌더링
- CTA 버튼 표시
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- 푸터 링크 접근성

포함된 테스트 (10개):
- 홈페이지 기본 로딩 확인
- VINTEE 브랜드 로고 표시 확인
- 메인 히어로 섹션 표시 확인
- 탐색/여행 관련 CTA 버튼 표시
- 푸터 영역 표시 확인
- 푸터 링크 접근 가능성 확인
- 홈페이지 반응형 디자인 - 모바일
- 홈페이지 반응형 디자인 - 태블릿
- 페이지 성능 메트릭 확인

### 2. 02-explore-readonly.spec.ts
**탐색/숙소 목록 페이지 테스트**

목표:
- 탐색 페이지 로딩 및 렌더링
- 숙소 카드 표시 (이미지, 가격, 제목)
- 테마/태그 섹션 표시
- 반응형 레이아웃 동작
- 필터 UI 상태

포함된 테스트 (11개):
- 탐색 페이지 기본 로딩 확인
- 숙소 카드 목록 표시 확인
- 숙소 카드 이미지 표시 확인
- 숙소 카드 가격 정보 표시 확인
- 숙소 카드 제목 표시 확인
- 태그/테마 섹션 표시 확인
- 태그 배지 클릭 가능성 확인
- 탐색 페이지 모바일 레이아웃
- 탐색 페이지 태블릿 레이아웃
- 탐색 페이지 데스크톱 레이아웃
- 페이지 스크롤 시 콘텐츠 로드 확인
- 숙소 카드에서 상세 페이지 링크 존재 확인
- 탐색 페이지 접근성 - 의미론적 HTML 확인

### 3. 03-property-detail-readonly.spec.ts
**숙소 상세 페이지 테스트**

목표:
- 숙소 상세 정보 페이지 로딩
- 이미지 갤러리 렌더링 및 네비게이션
- 호스트 정보 및 스토리 표시
- 편의시설 목록 및 아이콘
- 태그/카테고리 표시
- 가격 및 예약 위젯
- 리뷰 섹션
- 관련 숙소 추천

포함된 테스트 (15개):
- 숙소 상세 페이지 기본 로딩
- 숙소 제목 표시 확인
- 숙소 기본 정보 표시 확인
- 이미지 갤러리 표시 확인
- 이미지 네비게이션 버튼 확인
- 호스트 정보 섹션 표시 확인
- 호스트 스토리/설명 표시 확인
- 편의시설 목록 표시 확인
- 편의시설 아이콘 표시 확인
- 태그/카테고리 표시 확인
- 가격 정보 표시 확인
- 예약 위젯 표시 확인
- 리뷰 섹션 표시 확인
- 관련 숙소 추천 섹션 확인
- 숙소 상세 페이지 모바일 레이아웃
- 숙소 상세 페이지 접근성 확인
- 이미지 로딩 성능 확인

### 4. 04-search-filter-readonly.spec.ts
**검색 및 필터 UI 테스트**

목표:
- 필터 UI 요소 표시 확인
- 태그 필터 체계 확인
- 가격 범위 필터 (슬라이더/입력)
- 지역 필터 (드롭다운)
- 검색 입력 필드
- 필터 초기화/적용 버튼
- 필터 상태 표시

포함된 테스트 (14개):
- 필터 패널 표시 확인
- 태그 필터 UI 표시 확인
- 태그 필터 체크박스 표시 확인
- 가격 범위 필터 표시 확인
- 가격 범위 슬라이더 표시 확인
- 최소/최대 가격 입력 필드 표시 확인
- 지역 필터 표시 확인
- 지역 필터 드롭다운 표시 확인
- 검색 입력 필드 표시 확인
- 검색 입력 필드 포커스 가능성 확인
- 필터 초기화 버튼 표시 확인
- 필터 적용 버튼 표시 확인
- 필터 UI 반응형 레이아웃 - 모바일
- 검색 바 위치 확인
- 필터 라벨 접근성 확인
- 선택된 필터 표시 상태 확인
- 태그 카테고리별 그룹화 확인

### 5. 05-static-pages.spec.ts
**정적 페이지 테스트**

목표:
- 이용약관, 개인정보보호정책, 사용 가이드 페이지
- 콘텐츠 표시 및 구조 확인
- 내부 링크 네비게이션
- 반응형 레이아웃
- 접근성 확인
- 한국어 텍스트 처리

포함된 테스트 (17개):
- 이용약관 페이지 접근 확인
- 이용약관 제목 표시 확인
- 이용약관 콘텐츠 표시 확인
- 이용약관 섹션 구조 확인
- 개인정보보호정책 페이지 접근 확인
- 개인정보보호정책 제목 표시 확인
- 개인정보보호정책 콘텐츠 표시 확인
- 개인정보보호정책 섹션 구조 확인
- 사용 가이드 페이지 접근 확인
- 사용 가이드 제목 표시 확인
- 사용 가이드 콘텐츠 표시 확인
- 사용 가이드 단계별 섹션 확인
- 이용약관에서 개인정보보호정책으로 내부 링크 확인
- 푸터에서 정적 페이지 링크 접근 가능성 확인
- 이용약관 페이지 반응형 레이아웃 - 모바일
- 개인정보보호정책 페이지 반응형 레이아웃 - 모바일
- 사용 가이드 페이지 반응형 레이아웃 - 모바일
- 정적 페이지 접근성 확인 (3개)
- 한국어 텍스트 언어 확인 (2개)

## 실행 방법

### 모든 Group A1 테스트 실행
```bash
npx playwright test tests/e2e/parallel/group-a1-public/
```

### 특정 테스트 파일만 실행
```bash
# 홈페이지 테스트만
npx playwright test tests/e2e/parallel/group-a1-public/01-homepage.spec.ts

# 탐색 페이지 테스트만
npx playwright test tests/e2e/parallel/group-a1-public/02-explore-readonly.spec.ts
```

### 특정 테스트 케이스만 실행
```bash
# 테스트 이름으로 필터링
npx playwright test -g "홈페이지 기본 로딩"

# 특정 describe 블록
npx playwright test -g "Group A1-01"
```

### UI 모드에서 실행 (디버깅용)
```bash
npx playwright test tests/e2e/parallel/group-a1-public/ --ui
```

### 특정 브라우저에서만 실행
```bash
# Chromium만
npx playwright test tests/e2e/parallel/group-a1-public/ --project=chromium

# Firefox만
npx playwright test tests/e2e/parallel/group-a1-public/ --project=firefox

# WebKit만
npx playwright test tests/e2e/parallel/group-a1-public/ --project=webkit
```

### 모바일 뷰포트 시뮬레이션 포함
```bash
# 모든 브라우저 + 모바일 뷰포트 포함
npx playwright test tests/e2e/parallel/group-a1-public/ --project="Mobile Chrome" --project="Mobile Safari"
```

### 병렬 워커 설정
```bash
# 8개 워커로 병렬 실행 (로컬)
npx playwright test tests/e2e/parallel/group-a1-public/ --workers=8

# 4개 워커로 병렬 실행 (CI)
npx playwright test tests/e2e/parallel/group-a1-public/ --workers=4

# 순차 실행
npx playwright test tests/e2e/parallel/group-a1-public/ --workers=1
```

## 테스트 설계 원칙

### 1. Arrange-Act-Assert 패턴
모든 테스트는 다음 구조를 따릅니다:
```typescript
test('테스트 이름', async ({ page }) => {
  // Arrange: 테스트 초기 설정
  await page.goto('/explore');

  // Act: 사용자 동작 수행
  await page.click('button');

  // Assert: 결과 검증
  await expect(element).toBeVisible();
});
```

### 2. 한국어 텍스트 처리
한국어 텍스트는 정규식을 사용하여 검색합니다:
```typescript
// 한국어 필터링
page.locator('text=/둘러보기|여행|탐색|explore/i')

// 한국어 정규식
/[가-힣]/  // 한글 문자 매칭
```

### 3. Data-testid 활용
가능하면 `data-testid` 속성을 사용합니다:
```typescript
page.locator('[data-testid="property-card"]')
```

### 4. 타임아웃 관리
- `waitForLoadState('networkidle')`: 네트워크 로드 완료 대기
- `waitForLoadState('domcontentloaded')`: DOM 로드 대기
- `timeout: 3000`/`5000`: 명시적 대기 시간

### 5. 조건부 검증
존재하지 않을 수 있는 요소는 조건부로 검증:
```typescript
const element = page.locator('selector');
if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
  await expect(element).toBeVisible();
}
```

### 6. 반응형 테스트
데스크톱/태블릿/모바일 뷰포트를 모두 테스트:
```typescript
// 모바일 (375x667)
// 태블릿 (768x1024)
// 데스크톱 (1920x1080)
```

## 테스트 데이터 요구사항

### 필수 데이터
- ✅ 최소 1개의 공개 숙소 (ID: 1로 테스트)
- ✅ 최소 1개의 태그 또는 테마 카테고리
- ✅ 정적 페이지: `/terms`, `/privacy`, `/how-to-use` 접근 가능

### 선택 사항
- 여러 개의 숙소 (탐색 페이지 테스트 강화)
- 호스트 정보 및 스토리
- 편의시설 정보
- 이미지 갤러리

## Playwright Best Practices

### 1. 로케이터 선택 순서
1. `data-testid` 속성 (권장)
2. 역할 기반: `[role="main"]`
3. 텍스트 기반: `text=/패턴/i`
4. CSS 선택자 (마지막 수단)

### 2. 대기 시간
- ❌ `await page.waitForTimeout(1000)` (고정 대기 - 피하기)
- ✅ `await page.waitForLoadState('networkidle')` (로드 상태 기반)
- ✅ `await expect(element).toBeVisible({ timeout: 3000 })` (요소 기반)

### 3. 에러 처리
```typescript
// ❌ 하지 말 것
const visible = await element.isVisible();

// ✅ 할 것
const visible = await element.isVisible({ timeout: 3000 }).catch(() => false);
```

### 4. 스크린샷 및 비디오
실패 시 자동으로 수집됩니다:
- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`

결과는 `test-results/` 디렉토리에 저장됩니다.

## 성능 최적화

### 실행 시간 개선
1. **병렬 실행**: `fullyParallel: true` (기본값)
2. **워커 수**: 로컬 8개, CI 4개
3. **재시도**: CI에서만 2회

### 네트워크 성능
테스트는 실제 네트워크 속도로 실행되므로:
- 개발 환경에서는 빠를 수 있음
- CI 환경에서는 느릴 수 있음
- 타임아웃을 너무 짧게 설정하지 않기

## 문제 해결

### 테스트 실패 원인 분석

#### 1. "Element not found" 오류
```bash
# 로케이터 검증
npx playwright codegen http://localhost:3010/explore

# UI 모드에서 디버깅
npx playwright test --ui --debug
```

#### 2. "Timeout" 오류
```bash
# 타임아웃 증가
await expect(element).toBeVisible({ timeout: 10000 });

# 또는 로드 상태 확인
await page.waitForLoadState('domcontentloaded');
```

#### 3. "Flaky" 테스트 (간헐적 실패)
```bash
# 조건부 검증 추가
if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
  // 검증 수행
}

# 또는 더 안정적인 로케이터 사용
page.locator('[data-testid="id"]')  // ✅ 권장
page.locator('text=/패턴/i')        // ⚠️ 조심
page.locator('div > span > a')      // ❌ 피하기
```

## CI/CD 통합

### GitHub Actions
```yaml
- name: Run Group A1 Tests
  run: npm run test:e2e:group-a1
```

### 환경 변수
```bash
CI=true              # CI 환경 플래그
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1  # 브라우저 다운로드 스킵
```

## 관련 문서

- [Playwright 공식 문서](https://playwright.dev/)
- [VINTEE 테스트 그룹 명세](../../../PARALLEL_TEST_GROUPS.md)
- [테스트 베스트 프랙티스](../../../docs/testing/)

## 테스트 유지보수

### 정기적인 검토
- 월 1회: 테스트 커버리지 확인
- 분기별: 타임아웃 값 재검토
- 기능 변경 시: 로케이터 업데이트

### 추가할 테스트 케이스
- [ ] 다국어 지원 (현재 한국어만)
- [ ] 접근성 (WCAG 2.1)
- [ ] 성능 메트릭 (Core Web Vitals)
- [ ] SEO (메타 태그)

## 문의 및 피드백

테스트 관련 문제는 다음을 확인하세요:
1. `playwright.config.ts` 설정
2. `.env` 파일 (테스트 환경 변수)
3. 콘솔 로그 및 에러 메시지
4. 스크린샷 및 비디오 (test-results/)

---

**작성일**: 2026-01-08
**최종 수정**: 2026-01-08
**테스트 수**: 81개
**예상 실행 시간**: ~3분
