# VINTEE Project Changelog

모든 주목할 만한 변경사항이 이 파일에 기록됩니다.

형식: [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/) 참조

---

## [Unreleased]

## [2026-03-01] - 리뷰 시스템 완성

### Added

**Epic 5 - 리뷰 시스템 (Review System) - 93% Match Rate**

- ✨ 리뷰 작성 기능 (5.1)
  - `POST /api/reviews` API (Zod 검증, 별점 1-5, 텍스트 10-500자)
  - `src/components/review/review-form.tsx` (react-hook-form 통합)
  - SNS 공유 동의 시 1000 크레딧 자동 지급 (트랜잭션 처리)
  - `/bookings/[id]/review` 페이지 추가
  - 예약 상세에 "리뷰 작성" 버튼 (ReviewDialog 모달)

- 📋 리뷰 표시 기능 (5.2)
  - `GET /api/reviews` API (propertyId/userId 필터링, 페이지네이션)
  - `src/components/review/review-card.tsx` 컴포넌트
  - 숙소 상세 페이지 리뷰 섹션 (5개 초기 로드, 평균 별점, 개수 표시)
  - 이름 마스킹: `maskName()` 유틸리티 함수 ("홍길동" → "홍*동")

- 💬 호스트 답변 기능 (5.3)
  - `POST /api/reviews/[id]/reply` API (Zod 검증, 10-300자)
  - `src/components/review/host-reply-form.tsx` 컴포넌트
  - `/host/reviews` 호스트 관리 페이지 (전체/평균/미답변 통계)
  - 중복 답글 방지 (409 Conflict)
  - 게스트 알림 시스템 연동

- 🛠 유틸리티 및 검증
  - `src/lib/utils/review.ts` (maskName, formatRating, canWriteReview)
  - `src/lib/validations/review.ts` (Zod 스키마: createReviewSchema, hostReplySchema)
  - 이미지 업로드 지원 (최대 5장, 선택 필드)
  - SNS 공유 추적 필드 (snsShareConsent, creditAwarded)

### Changed

- Prisma Schema Review 모델 확장
  - snsShareConsent, creditAwarded, images, snsShared, snsSharedAt 필드 추가

### Fixed

- PDCA Act-1 개선 (v1.0 72% → v2.0 93%)
  - 이름 마스킹 구현
  - 서버 측 Zod 검증 강화
  - 중복 답글 방지 로직 추가
  - 체크아웃 날짜 API 검증 추가
  - ReviewForm 중복 정의 제거

### Metrics

```
Overall Match Rate: 93% (≥90% 기준 달성)
Files Added: 13개
Lines of Code: ~1950
Components: 5개 (ReviewForm, ReviewCard, HostReplyForm, ReviewDialog, ReviewPageClient)
API Routes: 3개 (POST /api/reviews, GET /api/reviews, POST /api/reviews/[id]/reply)
Pages: 4개 (review/page, host/reviews, property/[id] 통합, bookings/[id] 통합)
Utilities: 2개 (review.ts 검증, review.ts 유틸)
P0 갭 해결율: 100% (4/4)
```

---

## [2026-02-28] - 초기 기획 및 설계 완료

### Added

- Plan 문서: `docs/01-plan/features/리뷰-시스템.plan.md`
- Design 문서: `docs/02-design/features/리뷰-시스템.design.md`
- 3개 Epic (5.1 리뷰 작성, 5.2 리뷰 표시, 5.3 호스트 답변) 정의

---

## 이전 버전 (Prior Releases)

...

---

## 기술 스펙 요약 (Quick Reference)

### API Endpoints

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|:------:|
| POST | `/api/reviews` | 리뷰 작성 | ✅ |
| GET | `/api/reviews` | 리뷰 조회 (필터/페이지네이션) | ✅ |
| POST | `/api/reviews/[id]/reply` | 호스트 답변 | ✅ |

### Components

| 컴포넌트 | 위치 | 상태 |
|---------|------|:----:|
| ReviewForm | `src/components/review/review-form.tsx` | ✅ |
| ReviewCard | `src/components/review/review-card.tsx` | ✅ |
| HostReplyForm | `src/components/review/host-reply-form.tsx` | ✅ |
| ReviewDialog | `src/components/review/review-dialog.tsx` | ✅ |

### Pages

| 페이지 | 경로 | 상태 |
|--------|------|:----:|
| 리뷰 작성 | `/bookings/[id]/review` | ✅ |
| 호스트 리뷰 관리 | `/host/reviews` | ✅ |
| 숙소 상세 (리뷰 섹션) | `/property/[id]` | ✅ |
| 예약 상세 (리뷰 버튼) | `/bookings/[id]` | ✅ |

---

**최종 업데이트**: 2026-03-01
**상태**: Production Ready
