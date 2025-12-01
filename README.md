# VINTEE (VINTEE)

> 도시 생활에 지친 MZ세대를 위한 진정성 있는 VINTEE 경험 큐레이션 및 예약 플랫폼

VINTEE는 단순한 숙소 예약을 넘어, 감성적이고 진정성 있는 농촌 휴양 경험을 제공하는 플랫폼입니다.

## 🌾 주요 특징

- **테마 기반 발견**: 논뷰맛집, 불멍과별멍 등 감성적 태그로 숙소 탐색
- **스토리 중심**: 호스트의 이야기와 지역 문화를 담은 콘텐츠
- **간편한 인증**: Clerk 기반 소셜 로그인 (Google, 카카오 등)
- **직관적 예약**: 숙소 + 체험 통합 예약 시스템

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- Python 3.12+
- PostgreSQL 14+
- npm 또는 yarn

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

Clerk API 키 발급: https://dashboard.clerk.com

### Frontend 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

Frontend는 http://localhost:3000 에서 실행됩니다.

### Backend 설치 및 실행

```bash
# backend 디렉토리로 이동
cd backend

# Python 가상환경 생성
python3.12 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 URL 등 설정

# 데이터베이스 마이그레이션
alembic upgrade head

# 초기 태그 데이터 시드
python -m app.scripts.seed_tags

# 개발 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend는 http://localhost:8000 에서 실행됩니다.

## 📚 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Clerk
- **Forms**: react-hook-form + Zod
- **HTTP Client**: Fetch API

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.12
- **Database**: PostgreSQL + asyncpg
- **ORM**: SQLAlchemy (async)
- **Migrations**: Alembic
- **Authentication**: Clerk JWT verification

## 🔐 인증 시스템

VINTEE는 **Clerk**를 사용하여 안전하고 편리한 인증을 제공합니다:

- **이메일/비밀번호 로그인**
- **소셜 로그인**: Google, GitHub, 카카오 등
- **이메일 인증**: 자동 발송
- **비밀번호 재설정**: 이메일 링크
- **프로필 관리**: 사진, 이름, 비밀번호 등
- **세션 관리**: 자동 로그아웃, Remember Me

자세한 내용은 [AUTH.md](./AUTH.md) 참조

## 🏗️ 프로젝트 구조

```
vintee/
├── src/                      # Frontend (Next.js)
│   ├── app/                  # App Router 페이지
│   │   ├── login/           # 로그인 (Clerk)
│   │   ├── signup/          # 회원가입 (Clerk)
│   │   ├── profile/         # 프로필 (Clerk)
│   │   └── ...
│   ├── components/           # React 컴포넌트
│   │   └── ui/              # shadcn/ui 컴포넌트
│   ├── lib/                  # 유틸리티 및 API 클라이언트
│   │   └── api/             # API 클라이언트 함수
│   ├── types/                # TypeScript 타입 정의
│   └── middleware.ts         # Clerk 인증 미들웨어
│
├── backend/                  # Backend (FastAPI)
│   ├── app/
│   │   ├── models/          # SQLAlchemy 모델
│   │   ├── schemas/         # Pydantic 스키마
│   │   ├── routers/         # API 라우터
│   │   ├── core/            # 핵심 설정
│   │   └── scripts/         # 유틸리티 스크립트
│   ├── alembic/             # 데이터베이스 마이그레이션
│   └── requirements.txt     # Python 의존성
│
├── .env.local               # 환경 변수 (Frontend)
├── backend/.env             # 환경 변수 (Backend)
└── README.md
```

## 📖 API 문서

Backend 서버 실행 후:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

주요 엔드포인트:
- `GET /api/v1/tags` - 태그 목록 조회
- `GET /api/v1/tags?category=VIEW` - 카테고리별 태그 조회

## 🧪 테스트

```bash
# Frontend 테스트 (Playwright)
npx playwright test
npx playwright test --ui

# Backend 테스트 (pytest)
cd backend
pytest
```

## 🚢 배포

### Vercel & GCP PostgreSQL (권장)

VINTEE는 Vercel과 GCP Cloud SQL PostgreSQL로 배포됩니다.

**빠른 시작 (5분):**
```bash
# 1. GCP Cloud SQL 연결 정보 확인
# 2. Vercel 환경 변수 설정
# 3. 데이터베이스 마이그레이션
npx prisma migrate deploy
npm run seed

# 4. 배포
git push origin main
```

**배포 가이드:**
- 📖 [5분 빠른 배포](./docs/QUICK_DEPLOY.md) - 빠르게 배포하기
- 📖 [단계별 배포 가이드](./docs/DEPLOY_STEPS.md) - 상세한 배포 절차
- 📖 [Vercel 설정](./docs/VERCEL_DEPLOYMENT.md) - Vercel 환경 변수 설정

**자동 설정 스크립트:**
```bash
./scripts/setup-vercel-env.sh
```

### Netlify (대안)

1. Netlify에 GitHub 연결
2. Build settings:
   - Build command: `prisma generate && next build`
   - Publish directory: `.next`
3. Environment variables 설정 (`.env.production.example` 참조)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**VINTEE** - 진정성 있는 VINTEE 경험을 위한 플랫폼
