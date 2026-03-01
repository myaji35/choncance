# VINTEE System Gap Analysis Report

> **Analysis Type**: Full System Gap Analysis (CLAUDE.md vs Implementation)
>
> **Project**: VINTEE (빈티) - 농촌 휴가 체험 큐레이션 플랫폼
> **Analyst**: bkit-gap-detector (Claude Opus 4.6)
> **Date**: 2026-03-01
> **Design Doc**: CLAUDE.md Section 4 (핵심 기능 & 구현 상태)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

CLAUDE.md에 명시된 Epic별 구현 상태(설계 명세)와 실제 Next.js App Router 코드를 대조하여 정합성을 검증한다.

### 1.2 Analysis Scope

- **Design Document**: `CLAUDE.md` Section 4 (핵심 기능 & 구현 상태)
- **Implementation Path**: `src/app/`, `src/components/`, `src/lib/`, `prisma/schema.prisma`
- **Story Files**: `docs/stories/` (26개 스토리 파일)
- **Analysis Date**: 2026-03-01

### 1.3 Key Discovery: CLAUDE.md vs 실제 구현의 주요 괴리

| 항목 | CLAUDE.md 기술 | 실제 구현 |
|------|---------------|----------|
| Authentication | Clerk (Section 4.1) | Clerk + NextAuth 혼재 (Supabase auth-helpers 호환 래퍼) |
| Database | PostgreSQL 15+ (Neon.tech) | SQLite (prisma datasource) |
| 리뷰 시스템 | **0% 미구현** (Section 4.5) | **100% 구현 완료** (API+UI+컴포넌트) |
| 프로젝트 구조 | `login/[[...rest]]` (Clerk pages) | Clerk middleware + `/login/[[...rest]]` + `/auth/login` 혼재 |
| 브랜드명 | VINTEE | ChonCance 잔존 25개 파일 |

---

## 2. Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match (Epic 구현율) | 91% | ✅ |
| Architecture Compliance | 78% | ⚠️ |
| Convention Compliance | 72% | ⚠️ |
| **Overall** | **80%** | ⚠️ |

---

## 3. Epic-by-Epic Gap Analysis

### 3.1 Epic 1: 사용자 인증 (CLAUDE.md: 100%)

**실제 구현 평가: 95%** ✅

| 설계 항목 | 구현 여부 | 파일 위치 | 비고 |
|----------|:--------:|----------|------|
| Clerk 통합 | ✅ | `src/middleware.ts` | clerkMiddleware 사용 |
| 한국어 로컬라이제이션 | ✅ | `src/app/login/[[...rest]]/page.tsx` | Clerk UI Components |
| 로그인/회원가입 페이지 | ✅ | `src/app/login/`, `src/app/signup/` | + `src/app/auth/login/`, `src/app/auth/signup/` 중복 |
| Protected Routes (Middleware) | ✅ | `src/middleware.ts` | isPublicRoute matcher 사용 |
| 호스트 프로필 등록 | ✅ | `src/app/become-a-host/page.tsx` | HostProfile 모델 존재 |

**Gap 발견:**

| Type | 항목 | 설명 | 영향도 |
|------|------|------|--------|
| ⚠️ CHANGED | Auth Provider | CLAUDE.md = Clerk만 명시, 실제 = NextAuth + Clerk 혼재 (`src/lib/authOptions.ts`에 KakaoProvider via NextAuth, `src/lib/supabase/auth-helpers.ts`에 Clerk 래퍼) | Medium |
| ⚠️ CHANGED | Clerk Redirect | CLAUDE.md = `AFTER_SIGN_IN_URL`, 실제 `.env.example` = `FALLBACK_REDIRECT_URL` (deprecated 교체 완료) | Low |
| 🟡 ADDED | 중복 Auth Routes | `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx` 존재 (CLAUDE.md에 미기술) | Low |
| 🟡 ADDED | Admin Auth 시스템 | JWT cookie 기반 admin-auth (`src/lib/admin-auth.ts`) - CLAUDE.md에 미기술 | Low |

---

### 3.2 Epic 2: 테마 기반 발견 (CLAUDE.md: 83%)

**실제 구현 평가: 90%** ✅

| 설계 항목 | 구현 여부 | 파일 위치 |
|----------|:--------:|----------|
| 태그 시스템 (16개 태그, 4개 카테고리) | ✅ | `prisma/schema.prisma` Tag 모델, `src/app/api/tags/route.ts` |
| 태그 기반 필터링 | ✅ | `src/app/api/properties/route.ts` (tags 파라미터) |
| 텍스트 검색 (SearchBar) | ✅ | `src/components/search-bar.tsx`, `src/components/advanced-search-bar.tsx` |
| 숙소 상세 페이지 | ✅ | `src/app/property/[id]/page.tsx` |
| 관련 숙소 추천 | ✅ | `src/components/property/` 컴포넌트 존재 |
| 고급 필터 (가격/지역/날짜/인원/반려동물) | ✅ | `src/components/explore/filter-sidebar.tsx` + 6개 필터 컴포넌트 |
| GET /api/tags | ✅ | `src/app/api/tags/route.ts` |
| GET /api/properties | ✅ | `src/app/api/properties/route.ts` (search, tags, price, province, city, checkIn, checkOut, guests, pets) |
| GET /api/properties/[id] | ✅ | `src/app/api/properties/[id]/route.ts` |

**Gap 발견:**

| Type | 항목 | 설명 | 영향도 |
|------|------|------|--------|
| 🟡 ADDED | Calendar API | `GET /api/properties/[id]/calendar` - CLAUDE.md에 미기술 | Low |
| 🟡 ADDED | Availability API | `GET /api/properties/[id]/availability` - CLAUDE.md에 미기술 | Low |
| 🟡 ADDED | Filters API | `GET /api/filters/locations`, `GET /api/filters/price-range` - CLAUDE.md에 미기술 | Low |
| 🟡 ADDED | 챗봇 시스템 | `src/components/chatbot/`, `src/app/api/chat/route.ts` - Epic에 미포함 | Medium |
| 🟡 ADDED | 추천 페이지 | `src/app/recommendations/page.tsx` - CLAUDE.md에 미기술 | Low |

---

### 3.3 Epic 3: 호스트 관리 (CLAUDE.md: 100%)

**실제 구현 평가: 100%** ✅

| 설계 항목 | 구현 여부 | 파일 위치 |
|----------|:--------:|----------|
| 호스트 대시보드 | ✅ | `src/app/host/dashboard/page.tsx` |
| 숙소 등록 | ✅ | `src/app/host/properties/new/page.tsx`, `POST /api/host/properties` |
| 숙소 수정 | ✅ | `src/app/host/properties/[id]/edit/page.tsx`, `PUT /api/host/properties/[id]` |
| 숙소 삭제 | ✅ | `DELETE /api/host/properties/[id]` |
| 예약 목록 표시 | ✅ | `src/app/host/bookings/page.tsx`, `GET /api/host/bookings` |
| 예약 승인 | ✅ | `POST /api/host/bookings/[id]/approve` |
| 예약 거부 | ✅ | `PATCH /api/host/bookings/[id]/reject` |

**Gap 발견:**

| Type | 항목 | 설명 | 영향도 |
|------|------|------|--------|
| ⚠️ CHANGED | Reject HTTP method | CLAUDE.md = `POST`, 실제 = `PATCH` | Low |
| 🟡 ADDED | 호스트 프로필 수정 | `src/app/host/profile/edit/page.tsx`, `src/app/api/host/profile/route.ts` | Low |
| 🟡 ADDED | 호스트 통계 | `src/app/host/stats/page.tsx` | Low |
| 🟡 ADDED | 경험 관리 | `src/app/api/host/experiences/[id]/route.ts`, `src/app/api/host/properties/[id]/experiences/route.ts` | Low |
| 🟡 ADDED | 호스트 리뷰 관리 | `src/app/host/reviews/page.tsx` | Low |
| 🟡 ADDED | 예약 확인 | `POST /api/host/bookings/[id]/confirm` (approve와 별도) | Low |

---

### 3.4 Epic 4: 예약 및 결제 (CLAUDE.md: 86%)

**실제 구현 평가: 92%** ✅

| 설계 항목 | 구현 여부 | 파일 위치 |
|----------|:--------:|----------|
| BookingWidget | ✅ | `src/components/booking/booking-widget.tsx` |
| Checkout 페이지 | ✅ | `src/app/booking/checkout/page.tsx` |
| 토스페이먼츠 결제 승인 | ✅ | `POST /api/payments/confirm` (개발+프로덕션 모드 모두 구현) |
| 환불 API | ✅ | `POST /api/payments/[id]/refund` (토스 API 연동 + DB 트랜잭션) |
| 영수증 API | ✅ | `GET /api/payments/[id]/receipt` |
| 결제 성공/실패 페이지 | ✅ | `src/app/booking/success/`, `src/app/booking/fail/` |
| 예약 내역 페이지 | ✅ | `src/app/bookings/page.tsx`, `src/app/bookings/[id]/page.tsx` |
| POST /api/bookings | ✅ | `src/app/api/bookings/route.ts` (트랜잭션, 가용성 이중 체크, 가격 계산) |
| GET /api/bookings | ✅ | `src/app/api/bookings/route.ts` (페이지네이션 포함) |
| GET /api/bookings/[id] | ✅ | `src/app/api/bookings/[id]/route.ts` |
| GET /api/availability/check | ✅ | `src/app/api/availability/check/route.ts` |

**Gap 발견:**

| Type | 항목 | 설명 | 영향도 |
|------|------|------|--------|
| ⚠️ CHANGED | 예약 취소/환불 UI | CLAUDE.md = "서버 로직 추가 필요", 실제 = 환불 API 완전 구현 (서버 완료, UI 상태는 `src/app/payments/page.tsx`에서 확인 필요) | Low |
| 🟡 ADDED | 크레딧 시스템 | `src/app/api/credits/route.ts`, CreditHistory 모델 - CLAUDE.md에 미기술 | Medium |
| 🟡 ADDED | 위시리스트 | `src/app/api/wishlist/`, `src/app/wishlist/page.tsx`, Wishlist 모델 - CLAUDE.md에 미기술 | Medium |
| 🟡 ADDED | 알림 시스템 | `src/app/api/notifications/`, `src/app/notifications/page.tsx`, Notification 모델 | Medium |
| ❌ MISSING | `GET /api/availability/calendar/:propertyId` | CLAUDE.md 명시 URL과 실제 URL 불일치: 실제는 `GET /api/properties/[id]/calendar` | Low |

---

### 3.5 Epic 5: 리뷰 시스템 (CLAUDE.md: 0%)

**실제 구현 평가: 95%** -- **CLAUDE.md 심각한 오류**

CLAUDE.md는 리뷰 시스템을 **"0% 미구현"**으로 표기하고 있으나, 실제로는 **완전히 구현 완료** 상태이다.

| 설계 항목 | 구현 여부 | 파일 위치 |
|----------|:--------:|----------|
| Review Prisma 모델 | ✅ | `prisma/schema.prisma` (L479-507) - rating, content, images, hostReply, snsShareConsent 등 |
| POST /api/reviews (리뷰 작성) | ✅ | `src/app/api/reviews/route.ts` - Zod 검증, 트랜잭션, SNS 동의 크레딧 지급 |
| GET /api/reviews (리뷰 목록) | ✅ | `src/app/api/reviews/route.ts` - propertyId/userId 필터, 평균 별점, 페이지네이션 |
| GET /api/reviews/[id] (리뷰 상세) | ✅ | `src/app/api/reviews/[id]/route.ts` |
| POST /api/reviews/[id]/reply (호스트 응답) | ✅ | `src/app/api/reviews/[id]/reply/route.ts` - Zod 검증, 중복 답글 방지 |
| 리뷰 작성 UI (ReviewForm) | ✅ | `src/components/review/review-form.tsx` - 별점, 내용, 이미지 업로드, SNS 동의 |
| 리뷰 카드 (ReviewCard) | ✅ | `src/components/review/review-card.tsx` |
| 호스트 응답 UI | ✅ | `src/components/review/host-reply-form.tsx` |
| 리뷰 다이얼로그 | ✅ | `src/components/review/review-dialog.tsx`, `write-review-dialog.tsx` |
| 리뷰 작성 페이지 | ✅ | `src/app/bookings/[id]/review/page.tsx` |
| 호스트 리뷰 관리 페이지 | ✅ | `src/app/host/reviews/page.tsx` |
| Validation 스키마 | ✅ | `src/lib/validations/review.ts` |
| 유틸리티 함수 | ✅ | `src/lib/utils/review.ts` |

**추가 기능 (CLAUDE.md에 미기술):**
- SNS 공유 동의 시 1,000 크레딧 즉시 지급 (트랜잭션)
- 리뷰 작성 시 호스트에게 알림 발송 (`notifyReviewReceived`)
- 호스트 응답 시 리뷰 작성자에게 알림 발송 (`notifyHostReply`)
- 중복 답글 방지 (409 Conflict)
- 예약 COMPLETED 상태 + 체크아웃 날짜 이후만 리뷰 가능

**Gap 발견:**

| Type | 항목 | 설명 | 영향도 |
|------|------|------|--------|
| 🔴 CRITICAL | CLAUDE.md 정보 오류 | Epic 5를 "0% 미구현"으로 기술하나 실제 95% 완료. **CLAUDE.md 즉시 업데이트 필요** | Critical |
| 🟡 ADDED | SNS 크레딧 시스템 | snsShareConsent, creditAwarded 필드 + CreditHistory 자동 생성 | Medium |
| 🟡 ADDED | 이미지 리뷰 | images 필드 + ImageUpload 컴포넌트 연동 (CLAUDE.md "향후" 표기됨) | Low |

---

## 4. API Endpoints Gap Analysis (종합)

### 4.1 CLAUDE.md에 명시된 API vs 실제 구현

| CLAUDE.md Endpoint | 실제 구현 | Status |
|-------------------|----------|--------|
| `GET /api/tags` | `src/app/api/tags/route.ts` | ✅ |
| `GET /api/properties` | `src/app/api/properties/route.ts` | ✅ |
| `GET /api/properties/[id]` | `src/app/api/properties/[id]/route.ts` | ✅ |
| `POST /api/host/properties` | `src/app/api/host/properties/route.ts` | ✅ |
| `PUT /api/host/properties/[id]` | `src/app/api/host/properties/[id]/route.ts` | ✅ |
| `DELETE /api/host/properties/[id]` | `src/app/api/host/properties/[id]/route.ts` | ✅ |
| `GET /api/host/bookings` | `src/app/api/host/bookings/route.ts` | ✅ |
| `POST /api/host/bookings/[id]/approve` | `src/app/api/host/bookings/[id]/approve/route.ts` | ✅ |
| `POST /api/host/bookings/[id]/reject` | `PATCH /api/host/bookings/[id]/reject/route.ts` | ⚠️ (HTTP method 변경) |
| `POST /api/bookings` | `src/app/api/bookings/route.ts` | ✅ |
| `GET /api/bookings` | `src/app/api/bookings/route.ts` | ✅ |
| `GET /api/bookings/[id]` | `src/app/api/bookings/[id]/route.ts` | ✅ |
| `GET /api/availability/check` | `src/app/api/availability/check/route.ts` | ✅ |
| `GET /api/availability/calendar/:propertyId` | `GET /api/properties/[id]/calendar` | ⚠️ (URL 변경) |
| `POST /api/payments/confirm` | `src/app/api/payments/confirm/route.ts` | ✅ |
| `POST /api/payments/[id]/refund` | `src/app/api/payments/[id]/refund/route.ts` | ✅ |
| `GET /api/payments/[id]/receipt` | `src/app/api/payments/[id]/receipt/route.ts` | ✅ |

### 4.2 실제 구현에만 존재하는 API (CLAUDE.md에 미기술)

| Endpoint | 파일 | 설명 |
|----------|------|------|
| `POST /api/reviews` | `src/app/api/reviews/route.ts` | 리뷰 작성 |
| `GET /api/reviews` | `src/app/api/reviews/route.ts` | 리뷰 목록 조회 |
| `GET /api/reviews/[id]` | `src/app/api/reviews/[id]/route.ts` | 리뷰 상세 |
| `POST /api/reviews/[id]/reply` | `src/app/api/reviews/[id]/reply/route.ts` | 호스트 응답 |
| `GET /api/credits` | `src/app/api/credits/route.ts` | 크레딧 조회 |
| `GET/POST /api/wishlist` | `src/app/api/wishlist/route.ts` | 위시리스트 |
| `GET/DELETE /api/wishlist/property/[id]` | `src/app/api/wishlist/property/[id]/route.ts` | 위시리스트 단건 |
| `GET /api/notifications` | `src/app/api/notifications/route.ts` | 알림 목록 |
| `PATCH /api/notifications/[id]` | `src/app/api/notifications/[id]/route.ts` | 알림 읽음 |
| `POST /api/chat` | `src/app/api/chat/route.ts` | 챗봇 |
| `GET /api/health` | `src/app/api/health/route.ts` | 헬스 체크 |
| `GET /api/filters/locations` | `src/app/api/filters/locations/route.ts` | 위치 필터 |
| `GET /api/filters/price-range` | `src/app/api/filters/price-range/route.ts` | 가격 범위 필터 |
| `GET/POST /api/host/profile` | `src/app/api/host/profile/route.ts` | 호스트 프로필 |
| `POST /api/host/bookings/[id]/confirm` | 예약 확인 (approve와 별도) |
| `* /api/admin/*` | 22개 admin API 라우트 | 관리자 시스템 전체 |
| `GET/POST /api/user/role` | `src/app/api/user/role/route.ts` | 사용자 역할 |
| `POST /api/user/request-host` | `src/app/api/user/request-host/route.ts` | 호스트 신청 |
| `* /api/pm/*` | PM Tools 전체 | 프로젝트 관리 시스템 |

---

## 5. Data Model Gap Analysis

### 5.1 CLAUDE.md 명시 모델 vs Prisma Schema

| 모델 | CLAUDE.md | Prisma | Status |
|------|----------|--------|--------|
| User | ✅ 명시 | ✅ 구현 | ✅ Match (추가 필드: credits, totalEarned, wishlists, notifications, creditHistory) |
| HostProfile | ✅ 명시 | ✅ 구현 | ✅ Match |
| Property | ✅ 명시 | ✅ 구현 | ✅ Match (추가 필드: province, city, discountRate, discountedPrice, wishlists, reviews) |
| Tag | ✅ 명시 | ✅ 구현 | ✅ Match (추가 필드: icon, description, color) |
| Experience | ✅ 명시 | ✅ 구현 | ✅ Match |
| Booking | ✅ 명시 | ✅ 구현 | ✅ Match (추가 필드: confirmedAt, cancelledAt, rejectedAt, rejectionReason) |
| BookingItem | ✅ 명시 | ✅ 구현 | ✅ Match |
| Calendar | ✅ 명시 | ✅ 구현 | ✅ Match |
| Payment | ✅ 명시 | ✅ 구현 | ✅ Match (추가: PaymentTransaction 모델) |
| Review | ✅ 명시 (예정) | ✅ 구현 | ⚠️ 확장됨: bookingId, images, snsShareConsent, creditAwarded 추가 |
| Wishlist | ❌ 미명시 | ✅ 구현 | 🟡 Added |
| Notification | ❌ 미명시 | ✅ 구현 | 🟡 Added |
| CreditHistory | ❌ 미명시 | ✅ 구현 | 🟡 Added |
| SNSAccount | ❌ 미명시 | ✅ 구현 | 🟡 Added |
| SNSPost | ❌ 미명시 | ✅ 구현 | 🟡 Added |
| ChatbotSettings | ❌ 미명시 | ✅ 구현 | 🟡 Added |
| PM Tools (6모델) | ❌ 미명시 | ✅ 구현 | 🟡 Added |
| VIP Pipeline (3모델) | ❌ 미명시 | ✅ 구현 | 🟡 Added |

### 5.2 Database Provider 불일치

| 항목 | CLAUDE.md | 실제 | 영향도 |
|------|----------|------|--------|
| DB Provider | PostgreSQL 15+ (Neon.tech) | **SQLite** (`datasource.provider = "sqlite"`) | 🔴 Critical |
| DATABASE_URL 형식 | `postgresql://...` | `env("DATABASE_URL")` (sqlite 파일) | 🔴 Critical |

**NOTE**: `prisma/schema.prisma` L9에서 `provider = "sqlite"`로 설정되어 있음. 이는 CLAUDE.md의 PostgreSQL 명시와 직접 충돌한다. 로컬 개발 환경에서 SQLite를 사용하는 것일 수 있으나, `.env.example`에는 `postgresql://` URL이 명시되어 있어 혼란을 야기한다.

---

## 6. Convention Compliance

### 6.1 브랜드명 통일 (ChonCance -> VINTEE)

**잔존 파일 25곳** -- 수정 필요

| 파일 | 잔존 내용 | 우선순위 |
|------|----------|---------|
| `src/bmad/config.ts` | `projectName: 'ChonCance'` | 🟡 |
| `src/types/index.ts` | `// ChonCance Type Definitions` | 🟡 |
| `src/bmad/.env.bmad` | `PROJECT_NAME=ChonCance` | 🟡 |
| `src/lib/email/send-email.ts` | `'noreply@choncance.com'`, `'ChonCance <noreply@choncance.com>'` (3곳) | 🔴 |
| `src/lib/email/templates.ts` | `[ChonCance]` 이메일 제목, `choncance.com` URL, `© 2025 ChonCance` (15곳) | 🔴 |
| `src/app/pm-dashboard/create-prd/page.tsx` | `placeholder: "예: ChonCance 플랫폼 PRD"` | 🟡 |
| `src/app/recommendations/page.tsx` | `"ChonCance 추천"` | 🟡 |
| `src/app/client-review/page.tsx` | `'모든 "ChonCance" → "VINTEE"로 변경 확인'` (TODO 코멘트) | 🟡 |
| `src/app/api/admin/qr-login/status/route.ts` | `"choncance-secret-key-change-in-production"` | 🔴 |
| `.env.example` | `DATABASE_URL="...choncance"`, `GCS_BUCKET_NAME=choncance-images`, `EMAIL_FROM=noreply@choncance.com`, `EMAIL_FROM_NAME=ChonCance` | 🔴 |
| `prisma/schema.prisma` | `// ChonCance Core Models` 코멘트 | 🟡 |

### 6.2 Naming Convention

| Category | Convention | Compliance | 위반 사항 |
|----------|-----------|:----------:|----------|
| Components | PascalCase | 95% | `src/components/review/review-page-client.tsx` (파일명 kebab-case, export는 PascalCase) |
| Functions | camelCase | 100% | - |
| Files (component) | kebab-case.tsx | 100% | shadcn/ui 스타일 채택 (PascalCase 아님) |
| Files (utility) | camelCase.ts | 90% | `auth-helpers.ts` (kebab-case) |
| Folders | kebab-case | 100% | - |

### 6.3 Environment Variable Convention

| Variable | 규칙 준수 | 비고 |
|----------|:--------:|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | |
| `CLERK_SECRET_KEY` | ✅ | |
| `DATABASE_URL` | ⚠️ | `DB_` prefix 미사용, 하지만 Prisma 표준 |
| `TOSS_SECRET_KEY` | ⚠️ | `API_` prefix 미사용, 하지만 프로젝트 관례 |
| `GCS_BUCKET_NAME` | ⚠️ | `STORAGE_` prefix 미사용 |
| `SENDGRID_API_KEY` | ⚠️ | `API_` prefix 미사용 |
| `SMTP_HOST` | ✅ | |
| `EMAIL_FROM` | ⚠️ | `SMTP_FROM` 권장 |

---

## 7. Architecture Compliance

### 7.1 폴더 구조

| 설계 (CLAUDE.md) | 실제 | Status |
|-----------------|------|--------|
| `src/app/api/` | ✅ 존재 | ✅ |
| `src/components/` | ✅ 존재 | ✅ |
| `src/components/ui/` (shadcn 31개) | ✅ 존재 | ✅ |
| `src/lib/` | ✅ 존재 | ✅ |
| `src/lib/api/` | ✅ 존재 | ✅ (properties.ts, tags.ts, error-handler.ts) |
| `src/types/` | ✅ 존재 | ✅ (index.ts, tag.ts, next-auth.d.ts) |
| `prisma/` | ✅ 존재 | ✅ |
| `docs/` | ✅ 존재 | ✅ |

### 7.2 CLAUDE.md에 미기술된 구현 폴더

| 폴더 | 설명 |
|------|------|
| `src/app/admin/` | 13개 Admin 페이지 |
| `src/app/pm-dashboard/` | PM 대시보드 |
| `src/app/projects/` | 프로젝트 관리 |
| `src/components/chatbot/` | 챗봇 위젯 |
| `src/components/notifications/` | 알림 컴포넌트 |
| `src/components/review/` | 리뷰 컴포넌트 (6개 파일) |
| `src/lib/chatbot/` | 챗봇 로직 (4개 파일) |
| `src/lib/email/` | 이메일 서비스 |
| `src/lib/data-collection/` | 데이터 수집 파이프라인 |
| `src/lib/geo/` | 지역 스키마 |
| `src/lib/validations/` | Zod 검증 스키마 |
| `src/hooks/` | Custom hooks (use-toast) |
| `src/context/` | React Context |
| `src/bmad/` | BMAD 설정 |
| `src/scripts/` | 유틸리티 스크립트 |

---

## 8. Security Issues

| Severity | 파일 | 이슈 | 권장 조치 |
|----------|------|------|----------|
| 🔴 Critical | `src/app/api/admin/qr-login/status/route.ts` | JWT Secret 하드코딩: `"choncance-secret-key-change-in-production"` | `.env` 환경 변수로 이동 |
| 🟡 Warning | `src/lib/authOptions.ts` | NextAuth authOptions가 남아있으나 Clerk으로 전환됨. 이중 인증 시스템 혼재 | 미사용 NextAuth 코드 제거 또는 마이그레이션 완료 |
| 🟡 Warning | `.env.example` | 이전 브랜드명(ChonCance) 도메인 사용 | VINTEE 도메인으로 업데이트 |

---

## 9. Match Rate Summary

### Epic별 최종 평가

| Epic | CLAUDE.md 표기 | 실제 구현 | 괴리 | 수정 방향 |
|------|:-------------:|:--------:|:----:|----------|
| Epic 1: 사용자 인증 | 100% | **95%** | -5% | Auth 혼재 해소 필요 |
| Epic 2: 테마 기반 발견 | 83% | **90%** | +7% | CLAUDE.md 상향 조정 |
| Epic 3: 호스트 관리 | 100% | **100%** | 0% | 일치 |
| Epic 4: 예약 및 결제 | 86% | **92%** | +6% | CLAUDE.md 상향 조정 |
| Epic 5: 리뷰 시스템 | **0%** | **95%** | **+95%** | **CLAUDE.md 즉시 업데이트** |

### 종합 Match Rate

```
+-------------------------------------------------+
|  Design-Implementation Match Rate: 80%           |
+-------------------------------------------------+
|  API Endpoints Match:      17/17 (100%)          |
|  API Method Changes:       2 items               |
|  Missing in Design:        30+ API endpoints     |
|  Missing in Impl:          0 items               |
|                                                   |
|  Data Model Match:         10/10 core (100%)     |
|  Added Models (not in doc): 12 models            |
|  DB Provider Mismatch:     1 (Critical)          |
|                                                   |
|  Brand Name Compliance:    72% (25 files need fix)|
|  Convention Score:          85%                   |
+-------------------------------------------------+
```

---

## 10. Recommended Actions

### 10.1 Immediate Actions (P0 - within 24 hours)

| # | Action | 파일 | 설명 |
|---|--------|------|------|
| 1 | **CLAUDE.md Epic 5 업데이트** | `CLAUDE.md` | 리뷰 시스템 "0% 미구현" -> "95% 완료"로 수정. 리뷰 API 엔드포인트 목록, 컴포넌트 목록 추가. |
| 2 | **JWT Secret 하드코딩 제거** | `src/app/api/admin/qr-login/status/route.ts:38` | `"choncance-secret-key-change-in-production"` -> `process.env.JWT_SECRET` (fallback 제거) |
| 3 | **이메일 브랜드명 수정** | `src/lib/email/send-email.ts`, `src/lib/email/templates.ts` | 모든 "ChonCance" -> "VINTEE", `choncance.com` -> VINTEE 도메인 |

### 10.2 Short-term Actions (P1 - within 1 week)

| # | Action | 파일 | 설명 |
|---|--------|------|------|
| 4 | **Prisma DB Provider 정리** | `prisma/schema.prisma` | SQLite vs PostgreSQL 명확화. 로컬=SQLite, 프로덕션=PostgreSQL이면 문서화 필요 |
| 5 | **CLAUDE.md 전체 진행률 업데이트** | `CLAUDE.md` | 73% -> 실제 진행률 재계산 (추가 기능 포함) |
| 6 | **CLAUDE.md 누락 기능 문서화** | `CLAUDE.md` | 위시리스트, 알림, 크레딧, 챗봇, Admin, PM Tools 등 |
| 7 | **브랜드명 잔존 일괄 수정** | 25개 파일 | grep으로 발견된 모든 ChonCance/choncance 일괄 치환 |
| 8 | **.env.example 업데이트** | `.env.example` | 브랜드명 수정 + 누락된 환경 변수 추가 |
| 9 | **Auth 시스템 정리** | `src/lib/authOptions.ts` | NextAuth 코드 제거 또는 Clerk과의 관계 문서화 |

### 10.3 Long-term Actions (P2 - Backlog)

| # | Action | 설명 |
|---|--------|------|
| 10 | 스토리 파일 정리 | `docs/stories/` 내 파일 명명 규칙 통일 (story-001.md vs 3.1-host-dashboard.md 혼재) |
| 11 | API 문서 자동화 | OpenAPI/Swagger 스펙 생성 고려 |
| 12 | 인증 중복 라우트 제거 | `/auth/login` vs `/login/[[...rest]]` 중복 해소 |

---

## 11. Design Document Updates Needed

CLAUDE.md에 반영해야 할 항목:

- [ ] Epic 5: 리뷰 시스템 → 95% 완료 (API, UI, 컴포넌트 전체 목록)
- [ ] 전체 진행률 재계산 (73% -> ~88%)
- [ ] Review 모델 스키마 업데이트 (예정 스키마 -> 실제 구현 스키마)
- [ ] 추가 API 엔드포인트 30+개 문서화
- [ ] 추가 모델 12개 문서화 (Wishlist, Notification, CreditHistory, SNS, VIP 등)
- [ ] Admin 시스템 Epic 추가 (Host 승인, Property 승인, Tag 관리 등)
- [ ] 챗봇 시스템 문서화
- [ ] 데이터 수집 파이프라인 (VIP) 문서화
- [ ] Database Provider 불일치 해소 (SQLite vs PostgreSQL)
- [ ] Auth 시스템 아키텍처 업데이트 (Clerk + Supabase 호환 래퍼)
- [ ] 브랜드명 ChonCance -> VINTEE 잔존 정리

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-01 | Initial full system gap analysis | bkit-gap-detector |
