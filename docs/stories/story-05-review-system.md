# US-05: 신뢰 구축을 위한 리뷰 시스템

**Story ID**: US-05
**Epic**: Epic 5 - 리뷰 시스템
**상태**: 📋 대기 (0%)
**우선순위**: P1 (High)
**작성일**: 2026-02-10

---

## User Story

**As a** 여행객 (게스트)
**I want to** 숙소 이용 후 리뷰를 작성하고 다른 사람의 리뷰를 확인하기
**So that** 신뢰할 수 있는 정보를 바탕으로 숙소를 선택하고, 내 경험을 공유할 수 있다

**As a** 호스트
**I want to** 게스트 리뷰에 응답하고 피드백을 받기
**So that** 서비스 개선 포인트를 파악하고 잠재 고객에게 신뢰를 줄 수 있다

---

## 배경 (Background)

리뷰 시스템은 **플랫폼 신뢰도**를 결정하는 핵심 기능이다. VINTEE는 **정직한 불편함 표현**을 강조하는 만큼, 리뷰 시스템도 **양방향 소통**과 **투명성**을 중시한다.

### 문제점 (Pain Points)
- 기존 플랫폼: 과도하게 긍정적인 리뷰만 노출 (별점 4.5+ 위주)
- 가짜 리뷰: 호스트 자작 리뷰, 경쟁 숙소 악플
- 일방향 소통: 호스트 응답 기능 부재
- 리뷰 신뢰도: 사진 없는 리뷰는 신뢰 낮음

### 기대 효과 (Expected Benefits)
- 예약 전환율 5% → 8% 향상 (리뷰 신뢰도)
- 호스트 서비스 품질 개선 (피드백 기반)
- 플랫폼 신뢰도 향상 (투명한 리뷰 시스템)
- 가짜 리뷰 차단 (예약 완료 후에만 작성 가능)

---

## 시나리오 (Scenarios)

### Scenario 1: 숙소 이용 후 리뷰 작성

**Context**: 지수(28세)는 "논뷰 힐링 펜션"에서 1박 2일을 보낸 후 리뷰를 작성하려 한다.

**Steps**:
1. 체크아웃 후 2일 뒤, **리뷰 요청 이메일** 수신
   - 제목: "[VINTEE] 논뷰 힐링 펜션 어떠셨나요?"
   - 내용: "리뷰를 작성하고 다음 예약 시 사용 가능한 3,000원 크레딧을 받으세요!"
2. 이메일 내 **"리뷰 작성하기"** 버튼 클릭
3. 리뷰 작성 페이지로 이동 (`/bookings/clbook001/review`)
4. **별점** 선택 (1-5점):
   - 전체 만족도: ⭐⭐⭐⭐⭐ (5점)
   - 청결도: ⭐⭐⭐⭐⭐ (5점)
   - 위치: ⭐⭐⭐⭐ (4점)
   - 가성비: ⭐⭐⭐⭐⭐ (5점)
   - 호스트 친절도: ⭐⭐⭐⭐⭐ (5점)
5. **리뷰 작성** (최소 30자, 최대 500자):
   ```
   논뷰가 정말 끝내주는 펜션이었어요!
   아침에 창문을 열면 논이 펼쳐져 있어서 힐링 그 자체였습니다.

   호스트분이 정말 친절하셨고, BBQ 숯까지 직접 챙겨주셨어요.
   다만 Wi-Fi가 가끔 끊기긴 했는데, 애초에 기대하지 않았고
   오히려 디지털 디톡스가 되어서 좋았습니다.

   다음에 또 방문하고 싶어요!
   ```
6. **사진 업로드** (선택, 최대 5장):
   - 논 전망 사진 (3장)
   - BBQ 사진 (1장)
   - 일몰 사진 (1장)
7. **특별히 좋았던 점** 태그 선택 (복수 선택):
   - ✅ 깨끗한 숙소
   - ✅ 친절한 호스트
   - ✅ 조용한 환경
   - ✅ 멋진 전망
8. **개선이 필요한 점** (선택, 익명으로 호스트에게만 전달):
   ```
   Wi-Fi 라우터를 업그레이드하시면 좋을 것 같아요.
   ```
9. **"리뷰 제출"** 버튼 클릭
10. 리뷰 제출 완료 메시지:
    - "리뷰가 등록되었습니다!"
    - "3,000원 크레딧이 적립되었습니다"
11. 자동으로 호스트에게 리뷰 알림 이메일 발송
12. 숙소 상세 페이지에 리뷰 즉시 게시

**Expected Outcome**:
- ✅ 리뷰 작성 완료 (5분 이내)
- ✅ 크레딧 3,000원 적립
- ✅ 숙소 평점 자동 업데이트
- ✅ 호스트 알림 발송

---

### Scenario 2: 숙소 상세 페이지에서 리뷰 확인

**Context**: 민호(30세)는 "논뷰 힐링 펜션"을 예약하기 전 리뷰를 확인하려 한다.

**Steps**:
1. 숙소 상세 페이지 접속 (`/property/clprop001`)
2. **리뷰 섹션** 스크롤 이동
3. **평점 요약** 확인:
   - 전체 평점: ⭐⭐⭐⭐⭐ 4.8 (12개 리뷰)
   - 청결도: 4.9
   - 위치: 4.5
   - 가성비: 4.9
   - 호스트 친절도: 5.0
4. **리뷰 필터** 적용:
   - 정렬: "최신순" (기본)
   - 별점: "전체" (기본)
   - 사진 포함: ✅ (체크)
5. **리뷰 카드** 확인 (최신 5개 표시):
   ```
   [리뷰 1]
   ⭐⭐⭐⭐⭐ 5.0 | 김지수 | 2026-02-17
   사진: [논 전망 3장, BBQ 1장, 일몰 1장]

   논뷰가 정말 끝내주는 펜션이었어요!
   아침에 창문을 열면 논이 펼쳐져 있어서 힐링 그 자체였습니다.

   호스트분이 정말 친절하셨고, BBQ 숯까지 직접 챙겨주셨어요.
   다만 Wi-Fi가 가끔 끊기긴 했는데, 애초에 기대하지 않았고
   오히려 디지털 디톡스가 되어서 좋았습니다.

   다음에 또 방문하고 싶어요!

   [호스트 응답 - 2026-02-18]
   박영수: 지수님, 좋은 리뷰 감사합니다!
   Wi-Fi 개선 작업 예정입니다. 다음에 또 오세요 :)

   👍 도움이 됐어요 (8명)
   ```
6. **"모든 리뷰 보기"** 버튼 클릭 → 리뷰 전용 페이지 (`/property/clprop001/reviews`)
7. 전체 12개 리뷰 확인 (페이지네이션)
8. 리뷰 신뢰도 확인:
   - ✅ "예약 완료 인증" 배지 (모든 리뷰)
   - ✅ 사진 포함 리뷰: 8개 / 12개 (67%)

**Expected Outcome**:
- ✅ 투명한 리뷰 확인
- ✅ 사진으로 실제 숙소 확인
- ✅ 호스트 응답으로 신뢰 향상
- ✅ 예약 결정 신속화

---

### Scenario 3: 호스트가 리뷰에 응답

**Context**: 박영수 씨(55세)는 지수 님의 리뷰를 확인하고 응답하려 한다.

**Steps**:
1. 호스트 대시보드 접속 (`/host/dashboard`)
2. **"새 리뷰"** 알림 확인 (1건)
3. 리뷰 목록 페이지로 이동 (`/host/reviews`)
4. 지수 님 리뷰 확인:
   - 별점: ⭐⭐⭐⭐⭐ 5.0
   - 내용: "논뷰가 정말 끝내주는 펜션이었어요!..."
   - 개선 사항 (비공개): "Wi-Fi 라우터를 업그레이드하시면 좋을 것 같아요"
5. **"응답하기"** 버튼 클릭
6. 응답 작성 (최대 300자):
   ```
   지수님, 좋은 리뷰 감사합니다!
   Wi-Fi 관련 피드백 반영하여 다음 주에 라우터 업그레이드 예정입니다.
   다음에 또 오시면 더 나은 환경으로 모시겠습니다 :)
   ```
7. **"응답 제출"** 버튼 클릭
8. 응답 등록 완료
9. 지수 님에게 **"호스트가 응답했습니다"** 이메일 발송
10. 숙소 상세 페이지 리뷰에 호스트 응답 표시

**Expected Outcome**:
- ✅ 양방향 소통으로 신뢰 구축
- ✅ 개선 사항 반영
- ✅ 잠재 고객에게 적극적 호스트 이미지

---

### Scenario 4: 부적절한 리뷰 신고

**Context**: 호스트 박영수 씨는 악의적인 리뷰를 받았다.

**Steps**:
1. 호스트 대시보드에서 리뷰 확인
2. 악의적 리뷰 발견:
   - 별점: ⭐ 1.0
   - 내용: "완전 쓰레기 숙소. 절대 가지 마세요" (근거 없음)
3. 리뷰 카드 우측 상단 **"..." 메뉴** 클릭
4. **"신고하기"** 선택
5. 신고 사유 선택:
   - ✅ 부적절한 언어 사용
   - ✅ 근거 없는 비방
   - ❌ 허위 정보
6. 상세 설명 입력:
   ```
   해당 게스트는 실제로 예약하지 않았으며,
   경쟁 숙소로 추정됩니다. 악의적 리뷰입니다.
   ```
7. **"신고 제출"** 버튼 클릭
8. 관리자 검토 대기 (1-2일)
9. 관리자가 리뷰 확인 후:
   - 부적절 판정 → 리뷰 삭제
   - 적절 판정 → 리뷰 유지 (호스트에게 안내)
10. 결과 이메일 발송

**Expected Outcome**:
- ✅ 가짜 리뷰 차단
- ✅ 플랫폼 신뢰도 유지
- ✅ 호스트 보호

---

## 수락 기준 (Acceptance Criteria)

### AC-1: 리뷰 작성 페이지
- [ ] URL: `/bookings/:id/review`
- [ ] 접근 조건:
  - [ ] 예약 상태: COMPLETED (체크아웃 완료)
  - [ ] 리뷰 작성 기한: 체크아웃 후 30일 이내
  - [ ] 중복 작성 방지: 1인 1리뷰
- [ ] **별점** 섹션 (1-5점, 0.5점 단위):
  - [ ] 전체 만족도 (필수)
  - [ ] 청결도 (필수)
  - [ ] 위치 (필수)
  - [ ] 가성비 (필수)
  - [ ] 호스트 친절도 (필수)
- [ ] **리뷰 본문** (텍스트 에리어):
  - [ ] 최소 30자, 최대 500자
  - [ ] 글자 수 카운터
  - [ ] 예시 문구 제공
- [ ] **사진 업로드** (선택):
  - [ ] 최대 5장
  - [ ] 이미지 크기 제한 (최대 5MB/장)
  - [ ] 드래그 앤 드롭 지원
- [ ] **특별히 좋았던 점** 태그:
  - [ ] 복수 선택 (최대 5개)
  - [ ] 10개 옵션 제공
- [ ] **개선이 필요한 점** (선택):
  - [ ] 최대 200자
  - [ ] 익명으로 호스트에게만 전달
- [ ] **리뷰 제출** 버튼:
  - [ ] 필수 입력 검증
  - [ ] 제출 완료 후 크레딧 적립 (3,000원)
  - [ ] 호스트 알림 이메일 발송

### AC-2: 숙소 상세 페이지 리뷰 섹션
- [ ] **평점 요약 카드**:
  - [ ] 전체 평점 (평균, 1-5점)
  - [ ] 리뷰 개수
  - [ ] 세부 평점 (청결도, 위치, 가성비, 호스트 친절도)
  - [ ] 별점 분포 그래프 (5점 ~1점)
- [ ] **리뷰 필터**:
  - [ ] 정렬: 최신순 (기본), 높은 평점순, 낮은 평점순
  - [ ] 별점 필터: 전체, 5점, 4점, 3점 이하
  - [ ] 사진 포함 리뷰만 보기 (체크박스)
- [ ] **리뷰 카드** (최신 5개 표시):
  - [ ] 게스트명 (익명 옵션: "게스트123")
  - [ ] 별점 (전체 만족도)
  - [ ] 작성일 (YYYY-MM-DD)
  - [ ] 리뷰 본문 (최대 3줄, 더보기 버튼)
  - [ ] 사진 (썸네일, 클릭 시 확대)
  - [ ] 특별히 좋았던 점 태그
  - [ ] 호스트 응답 (있을 경우)
  - [ ] "도움이 됐어요" 버튼 (카운트)
  - [ ] "예약 완료 인증" 배지
- [ ] **"모든 리뷰 보기"** 버튼:
  - [ ] 리뷰 전용 페이지로 이동 (`/property/:id/reviews`)

### AC-3: 리뷰 전용 페이지
- [ ] URL: `/property/:id/reviews`
- [ ] 모든 리뷰 표시 (페이지네이션, 20개/페이지)
- [ ] 동일한 필터 옵션 제공
- [ ] 리뷰 상세 확인 (전체 본문, 모든 사진)

### AC-4: 호스트 응답
- [ ] 호스트 대시보드에서 "새 리뷰" 알림
- [ ] 리뷰 목록 페이지 (`/host/reviews`):
  - [ ] 모든 리뷰 표시 (최신순)
  - [ ] 응답 여부 필터 (전체/미응답/응답 완료)
- [ ] **"응답하기"** 버튼 클릭:
  - [ ] 응답 작성 모달
  - [ ] 최대 300자
  - [ ] 글자 수 카운터
- [ ] 응답 제출 후:
  - [ ] 리뷰 카드에 호스트 응답 표시
  - [ ] 게스트 이메일 알림 발송
- [ ] 응답 수정/삭제:
  - [ ] 제출 후 24시간 내 수정 가능
  - [ ] 삭제 불가 (투명성 유지)

### AC-5: 리뷰 신고 시스템
- [ ] 리뷰 카드 우측 상단 "..." 메뉴
- [ ] **"신고하기"** 선택 시 신고 모달
- [ ] 신고 사유 선택 (복수 가능):
  - [ ] 부적절한 언어 사용
  - [ ] 근거 없는 비방
  - [ ] 허위 정보
  - [ ] 개인정보 노출
  - [ ] 광고/스팸
- [ ] 상세 설명 입력 (선택, 최대 300자)
- [ ] 신고 제출 후:
  - [ ] 관리자 검토 대기 (1-2일)
  - [ ] 결과 이메일 발송
- [ ] 관리자 검토 후:
  - [ ] 부적절 판정: 리뷰 삭제 + 작성자 경고
  - [ ] 적절 판정: 리뷰 유지 + 신고자 안내

### AC-6: 리뷰 인센티브
- [ ] 리뷰 작성 완료 시 크레딧 3,000원 적립
- [ ] 사진 포함 리뷰 시 추가 크레딧 2,000원 (총 5,000원)
- [ ] 크레딧 사용:
  - [ ] 다음 예약 시 자동 할인
  - [ ] 유효기간: 6개월

---

## 기술 구현 (Technical Implementation)

### 프론트엔드

**컴포넌트 구조**:
```
src/components/review/
├── ReviewForm.tsx           // 리뷰 작성 폼
├── ReviewList.tsx           // 리뷰 목록
├── ReviewCard.tsx           // 개별 리뷰 카드
├── ReviewSummary.tsx        // 평점 요약
├── HostReply.tsx            // 호스트 응답
└── ReviewFilter.tsx         // 리뷰 필터

src/app/bookings/[id]/review/
└── page.tsx                 // 리뷰 작성 페이지

src/app/property/[id]/reviews/
└── page.tsx                 // 리뷰 전용 페이지

src/app/host/reviews/
└── page.tsx                 // 호스트 리뷰 관리
```

---

### 백엔드

**API Endpoints**:
```typescript
// 1. 리뷰 작성
POST /api/reviews
Request:
{
  "bookingId": "clbook001",
  "rating": 5,
  "ratingCleanliness": 5,
  "ratingLocation": 4,
  "ratingValue": 5,
  "ratingHost": 5,
  "comment": "논뷰가 정말 끝내주는 펜션이었어요!...",
  "images": ["https://...", ...],
  "tags": ["clean", "friendly-host", "quiet", "great-view"],
  "improvements": "Wi-Fi 라우터를 업그레이드하시면 좋을 것 같아요"
}
Response:
{
  "id": "clrev001",
  "creditEarned": 5000,
  "message": "리뷰가 등록되었습니다!"
}

// 2. 숙소 리뷰 목록 조회
GET /api/properties/:id/reviews?sort=latest&rating=all&hasPhotos=true&page=1&limit=20
Response:
{
  "reviews": [...],
  "total": 12,
  "averageRating": 4.8,
  "ratingBreakdown": {
    "5": 8,
    "4": 3,
    "3": 1,
    "2": 0,
    "1": 0
  }
}

// 3. 호스트 응답 작성
POST /api/reviews/:id/reply
Request:
{
  "reply": "지수님, 좋은 리뷰 감사합니다!..."
}
Response:
{
  "reviewId": "clrev001",
  "hostReply": "지수님, 좋은 리뷰 감사합니다!...",
  "repliedAt": "2026-02-18T10:00:00Z"
}

// 4. 리뷰 신고
POST /api/reviews/:id/report
Request:
{
  "reasons": ["inappropriate-language", "false-information"],
  "description": "해당 게스트는 실제로 예약하지 않았으며..."
}
Response:
{
  "reportId": "clrep001",
  "status": "PENDING",
  "message": "신고가 접수되었습니다"
}
```

---

### 데이터베이스

**Prisma Schema**:
```prisma
model Review {
  id                  String   @id @default(cuid())
  bookingId           String   @unique
  booking             Booking  @relation(...)
  userId              String
  user                User     @relation(...)
  propertyId          String
  property            Property @relation(...)

  // 별점
  rating              Float    // 전체 만족도 (1-5)
  ratingCleanliness   Float    // 청결도
  ratingLocation      Float    // 위치
  ratingValue         Float    // 가성비
  ratingHost          Float    // 호스트 친절도

  // 리뷰 내용
  comment             String   @db.Text
  images              String[] // 사진 URL 배열
  tags                String[] // 좋았던 점 태그
  improvements        String?  @db.Text // 개선 사항 (비공개)

  // 호스트 응답
  hostReply           String?  @db.Text
  hostRepliedAt       DateTime?

  // 메타데이터
  helpfulCount        Int      @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([propertyId])
  @@index([userId])
  @@index([bookingId])
}

model ReviewReport {
  id          String   @id @default(cuid())
  reviewId    String
  review      Review   @relation(...)
  reporterId  String
  reporter    User     @relation(...)
  reasons     String[] // 신고 사유 배열
  description String?  @db.Text
  status      ReportStatus @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([reviewId])
  @@index([reporterId])
}

enum ReportStatus {
  PENDING   // 검토 대기
  APPROVED  // 승인 (리뷰 삭제)
  REJECTED  // 거부 (리뷰 유지)
}
```

---

## 테스트 시나리오 (Test Scenarios)

```typescript
// tests/review-system.spec.ts
test('사용자가 예약 후 리뷰를 작성할 수 있다', async ({ page }) => {
  // 1. 예약 내역 페이지 접속
  await page.goto('/bookings');

  // 2. 완료된 예약에서 "리뷰 작성" 버튼 클릭
  await page.click('[data-testid="write-review-clbook001"]');

  // 3. 리뷰 작성 페이지로 이동
  await expect(page).toHaveURL(/\/bookings\/clbook001\/review/);

  // 4. 별점 선택
  await page.click('[data-testid="rating-5"]');

  // 5. 리뷰 본문 입력
  await page.fill('[name="comment"]', '논뷰가 정말 끝내주는 펜션이었어요!...');

  // 6. 리뷰 제출
  await page.click('[data-testid="submit-review"]');

  // 7. 성공 메시지 확인
  await expect(page.locator('[data-testid="success-message"]')).toContainText('리뷰가 등록되었습니다');
});
```

---

## 우선순위 (Priority)

**P0 (Critical)**: Post-MVP 필수
- 📋 리뷰 작성 페이지
- 📋 숙소 상세 페이지 리뷰 표시
- 📋 평점 요약 (별점 평균, 리뷰 개수)

**P1 (High)**: Post-MVP 완성
- 📋 호스트 응답 기능
- 📋 사진 업로드 리뷰
- 📋 리뷰 신고 시스템

**P2 (Medium)**: 향후 확장
- 🔮 리뷰 도움됨 투표
- 🔮 리뷰 필터 고도화 (키워드 검색)
- 🔮 AI 기반 리뷰 요약

---

**마지막 업데이트**: 2026-02-10
**작성자**: Claude Sonnet 4.5 with Gagahoho Engineering Team
