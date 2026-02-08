# Changelog

VINTEE 프로젝트의 모든 주목할 만한 변경사항은 이 파일에 문서화됩니다.

이 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

---

## [Unreleased]

### 계획 중
- 리뷰 시스템 구현
- 이미지 업로드 (Cloudinary/S3)
- 관리자 대시보드 고도화
- 알림 시스템 (이메일/푸시)
- 분석 대시보드

---

## [0.1.0] - 2026-02-08

### Added (추가됨)
- **E2E 테스트 인프라 개선** (2026-01-08)
  - Playwright 테스트 헬퍼 함수 추가 (`wait-helpers.ts`)
  - 병렬 테스트 그룹 구조 구성 (A1-D3)
  - 메인 사용자 플로우 테스트 추가
  - 테스트 베스트 프랙티스 문서 추가
  - 성능 개선: 평균 실행 시간 60-85% 단축

- **Kamal 배포 설정** (2026-01-27)
  - Kamal deploy.yml 구성 (vintee.townin.net)
  - Health check 엔드포인트 (`/api/health`) 추가
  - Docker Hub 레지스트리 설정 (myaji35)
  - Let's Encrypt SSL 설정
  - 환경 변수 프로덕션 구성

- **Supabase PostgreSQL 연동** (2025-12-01)
  - Supabase PostgreSQL 연결 설정
  - Prisma config 최적화
  - 간단 배포 가이드 (DEPLOY_NOW.md) 추가
  - 2단계 배포 프로세스 구축

- **배포 가이드 문서** (2025-12-01)
  - Vercel 배포 종합 가이드
  - GCP Cloud SQL PostgreSQL 연결 가이드
  - 5분 빠른 배포 가이드 (QUICK_DEPLOY.md)
  - 단계별 상세 배포 가이드 (DEPLOY_STEPS.md)
  - 환경 변수 설정 가이드 (VERCEL_DEPLOYMENT.md)
  - 자동 설정 스크립트 (setup-vercel-env.sh)
  - Toss Payments 연동 가이드

- **AI Chatbot 통합** (2025-11-16)
  - Gemini 2.5 Flash 통합
  - 대화형 사용자 지원 기능

- **VINTEE 브랜드 업데이트** (2025-11-16)
  - 브랜드명 변경 (ChonCance → VINTEE)
  - Hero 이미지 교체 (농촌 테마에 맞는 진짜 사진)
  - Stories 섹션 SVG를 실제 사진으로 교체
  - 디자인 시스템 고도화 (Phase 1-4)
  - 타이포그래피 개선
  - 메인 페이지 향상

- **인증 시스템 마이그레이션** (2025-11-16)
  - Clerk → Supabase 인증 완전 마이그레이션
  - Kakao 소셜 로그인 유지

- **역할 기반 접근 제어** (2025-11-04)
  - 사용자 권한 시스템 구현
  - Kakao AlimTalk 통합

- **리뷰 시스템 기초** (2025-11-03)
  - 리뷰 작성/표시 API
  - 호스트 응답 기능

- **관리자 API** (2025-11-03)
  - 호스트 관리 API
  - 숙소 승인/거부 API

### Changed (변경됨)
- **Docker 빌드 방식 변경** (2026-01-27)
  - 원격 빌더 → 로컬 Docker 빌드로 전환
  - Docker Desktop 또는 colima 필요
  - amd64 아키텍처 및 레지스트리 캐싱 유지

- **빌드 최적화** (2025-11-16)
  - Next.js config Vercel 배포용 최적화
  - Prisma 마이그레이션 자동화
  - README 배포 섹션 업데이트

- **이용방법 페이지 업데이트** (2025-11-16)
  - 브랜드명 VINTEE로 전면 수정
  - FAQ 내용 업데이트
  - 페이지 제목 및 설명 개선

### Fixed (수정됨)
- **API 라우트 동적 렌더링 설정** (2026-01-27)
  - 주요 API 라우트에 `export const dynamic = 'force-dynamic'` 추가
  - cookies 사용으로 인한 정적 렌더링 오류 수정
  - 수정된 라우트:
    - `/api/admin/hosts`
    - `/api/admin/properties`
    - `/api/credits`
    - `/api/filters/price-range`
    - `/api/host/bookings`
    - `/api/host/stats`
    - `/api/user/role`

- **Docker 배포 설정** (2026-01-27)
  - `next.config.mjs`에서 `output: 'standalone'` 활성화
  - Docker에서 `.next/standalone` 디렉토리 복사 가능하도록 수정
  - "not found" 에러 해결

- **Playwright 설정 제외** (2026-01-27)
  - Docker 빌드에서 Playwright config 제외
  - 타입 에러 해결

- **프로덕션 빌드 에러 수정** (2025-11-16)
  - TypeScript 타입 에러 수정
  - 빌드 프로세스 안정화

- **TypeScript 빌드 에러** (2025-11-04)
  - 타입 불일치 문제 해결
  - strict mode 호환성 개선

- **동적 렌더링 문제** (2025-11-03)
  - `/recommendations` 페이지 강제 동적 렌더링
  - DATABASE_URL 환경 변수 Docker 빌드에 추가

- **예약 페이지 태그 문제** (2025-11-10)
  - Property tags include 수정
  - 관련 숙소 표시 정상화

### Security (보안)
- **환경 변수 보안 강화** (2025-12-01)
  - 프로덕션 환경 변수 템플릿 추가
  - 민감 정보 분리
  - `.env.production.example`, `.env.gcp.template` 제공

### Removed (제거됨)
- **원격 빌더 SSH 설정 제거** (2026-01-27)
  - Kamal config에서 원격 빌더 설정 삭제
  - 로컬 빌드로 단순화

### Infrastructure (인프라)
- **시스템 안정화** (2026-02-04)
  - Ghost 파일 정리
  - Visual Sentinel 통합
  - 워크스페이스 동기화

- **유지보수 정리** (2026-02-06)
  - 워크스페이스 삭제 동기화
  - 코드베이스 정리

### Documentation (문서)
- **배포 문서 대폭 개선** (2025-12-01)
  - Vercel 배포 가이드
  - GCP PostgreSQL 가이드
  - 환경 변수 체크리스트
  - 트러블슈팅 가이드

- **프로젝트 가이드 업데이트** (지속적)
  - CLAUDE.md 유지
  - PROJECT_STATUS.md 업데이트
  - 호스트 기능 가이드
  - BMAD 워크플로우 문서

---

## [0.0.1] - 2025-11-03 (Initial Release)

### Added
- **MVP 핵심 기능**
  - 사용자 인증 시스템 (Clerk)
  - 태그 기반 숙소 탐색 (16개 태그, 4개 카테고리)
  - 숙소 상세 페이지
  - 예약 플로우 (BookingWidget)
  - 호스트 대시보드
  - 토스페이먼츠 결제 연동 (개발 모드)

- **데이터베이스 스키마**
  - User, HostProfile
  - Property, Tag, Experience
  - Booking, BookingItem
  - Payment, PaymentTransaction
  - Calendar (가용성 관리)

- **UI 컴포넌트**
  - shadcn/ui 31개 컴포넌트
  - Tailwind CSS 기반 디자인 시스템
  - 반응형 레이아웃

- **개발 도구**
  - Git 자동 커밋 스크립트
  - BMAD Token-Efficient Workflow
  - PM Tools 대시보드

---

## 버전 관리 규칙

### 버전 번호
- **MAJOR.MINOR.PATCH** (예: 1.0.0)
  - **MAJOR**: 호환되지 않는 API 변경
  - **MINOR**: 하위 호환되는 기능 추가
  - **PATCH**: 하위 호환되는 버그 수정

### 카테고리
- **Added**: 새로운 기능
- **Changed**: 기존 기능의 변경사항
- **Deprecated**: 곧 제거될 기능
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 관련 변경사항

### Git 커밋 메시지 규칙
```
<type>(<scope>): <subject>

feat: 새 기능
fix: 버그 수정
docs: 문서 업데이트
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드/도구 변경
```

---

## 참고 링크

- [VINTEE 프로젝트 가이드](./CLAUDE.md)
- [프로젝트 상태](./PROJECT_STATUS.md)
- [PRD](./PRD.md)
- [배포 가이드](./docs/DEPLOY_NOW.md)
- [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)
- [Semantic Versioning](https://semver.org/lang/ko/)

---

**마지막 업데이트**: 2026-02-08
**작성자**: Gagahoho, Inc. Engineering Team with Claude Sonnet 4.5
