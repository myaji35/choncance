# ChonCance - 프로젝트 상태 요약

**업데이트**: 2025-10-28
**진행률**: 53% (16/30 stories 완료)
**방법론**: BMAD Token-Efficient Workflow

---

## ✅ 완료된 작업

### Epic 1: 사용자 인증 (100%)
- ✅ Clerk 인증 통합 (로그인/회원가입)
- ✅ 호스트 프로필 등록
- ✅ 전역 SiteHeader 컴포넌트

### Epic 2: 테마 기반 발견 (67%)
- ✅ 태그 시스템 (16개 태그, 4개 카테고리)
- ✅ 태그 기반 필터링 (`/explore?tag=`)
- ✅ 텍스트 검색 (SearchBar)
- ✅ 숙소 상세 페이지 + 관련 숙소 추천
- ⏸️ 고급 필터 (가격, 지역, 날짜, 인원) - 컴포넌트 완료, 통합 필요

### Epic 3: 호스트 관리 (80%)
- ✅ 호스트 대시보드 (`/host/dashboard`)
- ✅ 숙소 등록 (`/host/properties/new`)
- ✅ 숙소 목록 및 통계
- ✅ 예약 목록 표시
- ⏸️ 숙소 수정/삭제 API
- ⏸️ 예약 승인/거부 기능

### Epic 4: 예약 및 결제 (86%)
- ✅ BookingWidget (날짜 선택, 가용성 체크, 가격 계산)
- ✅ Checkout 페이지
- ✅ Booking API (생성, 조회, 상세)
- ✅ 토스페이먼츠 결제 연동 (개발 모드)
- ✅ 예약 내역 페이지
- ⏸️ 예약 취소/환불 API

### Epic 5: 리뷰 시스템 (0%)
- ⏸️ 모든 작업 대기 중

### 추가 작업
- ✅ Git 자동 커밋 스크립트
- ✅ 프로젝트 문서화 (호스트 가이드, BMAD 최적화, 워크플로우)
- ✅ PM Tools 대시보드 (PRD, Epic, Story 생성)

---

## 📂 주요 파일 구조

```
choncance/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── properties/         # 숙소 CRUD
│   │   │   ├── bookings/           # 예약 관리
│   │   │   ├── availability/check/ # 가용성 확인
│   │   │   ├── payments/confirm/   # 결제 확인
│   │   │   ├── host/properties/    # 호스트 숙소 관리
│   │   │   └── filters/            # 필터 옵션
│   │   ├── explore/                # 숙소 탐색 페이지
│   │   ├── property/[id]/          # 숙소 상세
│   │   ├── booking/                # 예약 플로우
│   │   ├── bookings/               # 예약 내역
│   │   └── host/dashboard/         # 호스트 대시보드
│   ├── components/
│   │   ├── booking/                # 예약 관련
│   │   ├── explore/                # 필터 컴포넌트
│   │   ├── host/                   # 호스트 컴포넌트
│   │   ├── property/               # 숙소 카드
│   │   ├── tag/                    # 태그 UI
│   │   ├── layout/                 # 레이아웃 (Header)
│   │   └── ui/                     # shadcn/ui (31개 컴포넌트)
│   └── lib/
│       ├── prisma.ts               # DB 클라이언트
│       └── api/                    # API 클라이언트
├── prisma/
│   ├── schema.prisma               # DB 스키마
│   └── migrations/                 # 마이그레이션 (4개)
├── docs/
│   ├── HOST_FEATURES_GUIDE.md      # 호스트 기능 가이드
│   ├── BMAD_OPTIMIZATION_GUIDE.md  # 컨텍스트 최적화
│   ├── BMAD_WORKFLOW_IMPLEMENTATION.md # 5단계 워크플로우
│   ├── architecture/               # 기술 문서
│   └── stories/                    # Story 파일
└── scripts/
    ├── auto-commit.sh              # Git 자동 커밋
    └── AUTO_COMMIT_GUIDE.md        # 사용 가이드
```

---

## 🔧 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Auth**: Clerk
- **UI**: shadcn/ui + Tailwind CSS
- **Payment**: 토스페이먼츠 (개발 모드)

상세: `/docs/architecture/tech-stack.md`

---

## 📊 데이터베이스 모델

**핵심 모델**:
- User, HostProfile
- Property, Tag, Experience
- Booking, BookingItem, Payment, PaymentTransaction
- Calendar (가용성 관리)

상세 스키마: `prisma/schema.prisma`

---

## 🚀 개발 명령어

```bash
# 개발 서버
npm run dev          # http://localhost:3000

# 데이터베이스
npx prisma generate  # 클라이언트 생성
npx prisma migrate dev  # 마이그레이션
npx prisma studio    # DB GUI

# 빌드
npm run build
npm run lint

# Git 자동 커밋
./scripts/auto-commit.sh morning
```

전체 가이드: `scripts/AUTO_COMMIT_GUIDE.md`

---

## 📝 다음 작업 우선순위

### 즉시 (P0)
1. **필터 시스템 통합**: `/explore` 페이지에 FilterSidebar 연결
2. **토스페이먼츠 완전 연동**: 실제 결제 테스트
3. **숙소 수정/삭제 API**: 호스트가 숙소 관리

### 단기 (P1)
4. **예약 승인/거부**: 호스트 예약 관리 완성
5. **이미지 업로드**: Cloudinary 또는 AWS S3 연동
6. **리뷰 시스템**: Epic 5 시작

### 중기 (P2)
7. **관리자 대시보드**: 호스트 승인, 숙소 검토
8. **알림 시스템**: 이메일/푸시 알림
9. **분석 대시보드**: 예약 통계, 수익 분석

---

## 📖 참고 문서

### 기능별 가이드
- **호스트 기능**: `/docs/HOST_FEATURES_GUIDE.md`
- **Git 자동화**: `/scripts/AUTO_COMMIT_GUIDE.md`

### 개발 방법론
- **BMAD 최적화**: `/docs/BMAD_OPTIMIZATION_GUIDE.md`
- **워크플로우**: `/docs/BMAD_WORKFLOW_IMPLEMENTATION.md`

### 아키텍처
- **기술 스택**: `/docs/architecture/tech-stack.md` (TODO)
- **코딩 표준**: `/docs/architecture/coding-standards.md` (TODO)

### 기획
- **PRD**: `/PRD.md`
- **Story**: `/docs/stories/story-*.md`

---

## ⚡ 토큰 효율화 적용

이 프로젝트는 BMAD Token-Efficient Workflow를 적용합니다:

1. **최소 컨텍스트**: 이 문서는 핵심만, 상세는 링크 참조
2. **템플릿 활용**: `/docs/templates/` (TODO)
3. **Codebase Flattener**: `docs/codebase.xml` 생성 (TODO)
4. **캐싱**: API 호출 시 90% 입력 토큰 절감
5. **JSON 명령**: text_editor 도구로 90% 출력 토큰 절감

**예상 효과**:
- 기존 방식: $3.00/story
- 최적화 후: $0.19/story
- **94% 비용 절감**

실행 가이드: `/docs/BMAD_WORKFLOW_IMPLEMENTATION.md`

---

## 🎯 이정표

### MVP (현재 53%)
- [x] 인증 시스템
- [x] 태그 기반 탐색
- [x] 숙소 상세
- [x] 예약 플로우 (UI)
- [x] 호스트 대시보드 (기본)
- [ ] 결제 통합 (완전)
- [ ] 관리자 승인
- [ ] 리뷰 시스템

**목표**: 2025-11-15 (3주)

### Beta (목표 80%)
- [ ] 이미지 업로드
- [ ] 알림 시스템
- [ ] 고급 필터
- [ ] 관리자 대시보드
- [ ] 분석 도구

**목표**: 2025-11-30 (5주)

### Launch (100%)
- [ ] 전체 E2E 테스트
- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] 마케팅 페이지
- [ ] 사용자 문서

**목표**: 2025-12-15 (7주)

---

## 🔗 빠른 링크

**개발**:
- [localhost:3000](http://localhost:3000) - 앱
- [localhost:5555](http://localhost:5555) - Prisma Studio

**배포** (TODO):
- Production: TBD (Vercel)
- Staging: TBD

**문서**:
- CLAUDE.md - 프로젝트 가이드
- PROJECT_STATUS.md - 이 문서
- STORY-TRACKER.md - Story 추적

---

**마지막 업데이트**: 2025-10-28 20:45
**다음 작업**: 필터 시스템 통합 (`/explore` 페이지)
**작성자**: Claude Code (Sonnet 4.5)
