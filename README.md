# VINTEE (빈티)

> 농촌 휴가 체험 큐레이션 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

**VINTEE (빈티)**는 한국 MZ세대를 위한 농촌 휴가 체험(촌캉스) B2C 예약 플랫폼입니다.

---

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [개발](#개발)
- [배포](#배포)
- [문서](#문서)
- [변경 이력](#변경-이력)
- [라이선스](#라이선스)

---

## 🌟 주요 기능

### 핵심 차별화
- 🏷️ **테마 기반 큐레이션**: #논뷰맛집, #불멍과별멍, #반려동물동반 등 감성 태그로 숙소 발견
- 📖 **호스트 스토리 중심**: 단순 스펙 나열이 아닌 진정성 있는 농촌 이야기 전달
- 💚 **정직한 불편함 표현**: Wi-Fi 불안정, 벌레 출몰 등 농촌의 현실을 솔직하게 공유
- 🌾 **경험 중심 예약**: 숙박 + 선택적 농사 체험, 아궁이 체험 등 복합 예약

### 현재 구현 기능 (MVP 73% 완료)
- ✅ 사용자 인증 (Supabase Auth, Kakao 소셜 로그인)
- ✅ 태그 기반 숙소 탐색 (16개 태그, 4개 카테고리)
- ✅ 숙소 상세 페이지 + 관련 숙소 추천
- ✅ 고급 필터 (가격, 지역, 날짜, 인원, 반려동물)
- ✅ 예약 플로우 (BookingWidget, 가용성 체크, 가격 계산)
- ✅ 토스페이먼츠 결제 연동 (개발 모드)
- ✅ 호스트 대시보드 (숙소 관리, 예약 관리)
- ✅ AI Chatbot (Gemini 2.5 Flash)

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x (Strict Mode)
- **Styling**: Tailwind CSS 3.4+ with shadcn/ui
- **UI Components**: Radix UI primitives + lucide-react icons
- **Forms**: react-hook-form 7.x + Zod validation

### Backend
- **Architecture**: Next.js API Routes
- **Database**: PostgreSQL 15+ (Neon.tech / Supabase)
- **ORM**: Prisma 6.18+
- **Authentication**: Supabase Auth
- **Payment**: Toss Payments SDK 1.9+

### Infrastructure
- **Hosting**: Vercel / Vultr (Kamal deployment)
- **Database**: Neon PostgreSQL / Supabase
- **CDN**: Vercel Edge
- **Monitoring**: Vercel Analytics

---

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.17 이상
- npm 또는 yarn
- PostgreSQL 클라이언트 (선택사항)

### 초기 설정

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/vintee.git
cd vintee

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집 (DATABASE_URL, AUTH_*, TOSS_* 설정)

# 4. 데이터베이스 마이그레이션
npx prisma migrate dev

# 5. 시드 데이터 (선택)
npm run seed
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3010](http://localhost:3010)을 열어 확인하세요.

---

## 💻 개발

### 주요 명령어

```bash
# 개발 서버 시작 (포트 3010)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint

# Prisma Studio (DB GUI)
npx prisma studio

# Prisma 클라이언트 재생성
npx prisma generate

# E2E 테스트 (Playwright)
npm run test:e2e
npm run test:e2e:ui      # UI 모드
npm run test:e2e:headed  # 헤디드 모드
```

### 폴더 구조

```
vintee/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes
│   │   ├── explore/      # 숙소 탐색
│   │   ├── property/     # 숙소 상세
│   │   ├── booking/      # 예약 플로우
│   │   └── host/         # 호스트 대시보드
│   ├── components/       # React 컴포넌트
│   │   ├── booking/
│   │   ├── explore/
│   │   ├── host/
│   │   ├── property/
│   │   ├── tag/
│   │   └── ui/           # shadcn/ui
│   ├── lib/              # 유틸리티
│   └── types/            # TypeScript 타입
├── prisma/
│   ├── schema.prisma     # DB 스키마
│   └── migrations/       # 마이그레이션
├── docs/                 # 프로젝트 문서
└── scripts/              # 스크립트
```

### Git 워크플로우

**브랜치 전략**:
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치

**커밋 메시지 규칙** (Conventional Commits):
```
<type>(<scope>): <subject>

feat: 새 기능 추가
fix: 버그 수정
docs: 문서 업데이트
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드 프로세스 변경
```

---

## 🌐 배포

### Vercel 배포

1. Vercel 계정 생성 및 프로젝트 연결
2. 환경 변수 설정 (Vercel Dashboard)
3. `main` 브랜치에 push → 자동 배포

상세 가이드: [DEPLOY_NOW.md](./docs/DEPLOY_NOW.md)

### Kamal 배포 (Vultr)

```bash
# Kamal 설치
gem install kamal

# 초기 설정
kamal setup

# 배포
kamal deploy
```

상세 가이드: [DEPLOY_STEPS.md](./docs/DEPLOY_STEPS.md)

---

## 📚 문서

### 프로젝트 가이드
- [**CLAUDE.md**](./CLAUDE.md) - AI Agent 개발 가이드 (프로젝트 전체 가이드)
- [**PROJECT_STATUS.md**](./PROJECT_STATUS.md) - 프로젝트 상태 요약
- [**CHANGELOG.md**](./CHANGELOG.md) - 변경 이력
- [**PRD.md**](./PRD.md) - Product Requirements Document

### 개발 가이드
- [호스트 기능 가이드](./docs/HOST_FEATURES_GUIDE.md)
- [Git 자동 커밋 가이드](./scripts/AUTO_COMMIT_GUIDE.md)
- [BMAD 워크플로우](./docs/BMAD_WORKFLOW_IMPLEMENTATION.md)
- [BMAD 최적화 가이드](./docs/BMAD_OPTIMIZATION_GUIDE.md)

### 배포 가이드
- [빠른 배포 가이드](./docs/DEPLOY_NOW.md)
- [단계별 배포 가이드](./docs/DEPLOY_STEPS.md)
- [Vercel 배포 가이드](./docs/VERCEL_DEPLOYMENT.md)
- [Toss Payments 연동](./docs/TOSS_PAYMENTS.md)

### 아키텍처
- [기술 스택](./docs/architecture/tech-stack.md)
- [예약 시스템 아키텍처](./docs/architecture/booking-system-architecture.md)
- [PM Tools 아키텍처](./docs/architecture/pm-tools-architecture.md)

---

## 📋 변경 이력

프로젝트의 모든 주목할 만한 변경사항은 [CHANGELOG.md](./CHANGELOG.md)에서 확인할 수 있습니다.

최신 버전: **0.1.0** (2026-02-08)

주요 변경사항:
- E2E 테스트 인프라 개선 (성능 60-85% 향상)
- Kamal 배포 설정 추가
- Supabase PostgreSQL 연동
- Docker 배포 최적화
- VINTEE 브랜드 업데이트

자세한 내용은 [CHANGELOG.md](./CHANGELOG.md)를 참조하세요.

---

## 🎯 로드맵

### MVP (현재 73% 완료)
- [x] 사용자 인증
- [x] 태그 기반 탐색
- [x] 숙소 상세
- [x] 예약 플로우 (UI)
- [x] 호스트 대시보드
- [ ] 결제 통합 (완전)
- [ ] 리뷰 시스템

### Beta (목표 80%)
- [ ] 이미지 업로드 (Cloudinary/S3)
- [ ] 알림 시스템
- [ ] 관리자 대시보드
- [ ] 분석 도구

### Launch (100%)
- [ ] 전체 E2E 테스트
- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] 마케팅 페이지

---

## 🤝 기여

이 프로젝트는 현재 비공개 개발 중입니다.

---

## 📞 문의

**프로젝트 오너**: 조준범 (Jun-beom Cho)
**개발 팀**: Gagahoho, Inc. Engineering Team
**AI Agent**: Claude Sonnet 4.5

프로젝트 Issues 또는 Discord 채널을 통해 문의하실 수 있습니다.

---

## 📄 라이선스

이 프로젝트는 독점 라이선스(Proprietary License)로 보호됩니다.
무단 복제, 배포, 수정을 금지합니다.

Copyright © 2025-2026 Gagahoho, Inc. All rights reserved.

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Prisma](https://www.prisma.io/) - ORM
- [Supabase](https://supabase.com/) - 인증 & 데이터베이스
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- [Toss Payments](https://www.tosspayments.com/) - 결제 시스템
- [Vercel](https://vercel.com/) - 호스팅 플랫폼

---

**마지막 업데이트**: 2026-02-08
**버전**: 0.1.0
**프로젝트 상태**: 개발 중 (MVP 73% 완료)

🌾 **농촌의 진정성을 디지털로 연결하다** 🌾
