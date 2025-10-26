# ChonCance 배포 가이드

이 문서는 ChonCance 프로젝트를 프로덕션 환경에 배포하는 방법을 안내합니다.

## 📋 배포 구성

### 프론트엔드: Netlify
- **플랫폼**: Netlify
- **Repository**: GitHub (자동 배포 설정)
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`

### 백엔드: Railway (추천) 또는 Render
- **플랫폼**: Railway / Render
- **언어**: Python 3.12
- **데이터베이스**: PostgreSQL 14+
- **프레임워크**: FastAPI + Uvicorn

---

## 🚀 프론트엔드 배포 (Netlify)

프론트엔드는 이미 Netlify에 연결되어 있습니다.

### 환경 변수 설정

Netlify 대시보드 → Site settings → Environment variables에서 다음 환경 변수를 추가하세요:

```bash
# NextAuth.js
NEXTAUTH_URL=https://your-domain.netlify.app
NEXTAUTH_SECRET=your-nextauth-secret-key

# Kakao OAuth (설정 시)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# Backend API URL (Railway 또는 Render 배포 후 설정)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 배포 트리거

main 브랜치에 푸시하면 자동으로 배포됩니다:
```bash
git push origin main
```

---

## 🐍 백엔드 배포 (Railway - 추천)

Railway는 무료 티어에서 PostgreSQL을 포함하여 배포할 수 있습니다.

### 1. Railway 계정 생성
1. https://railway.app 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

### 2. GitHub Repository 연결
1. "Deploy from GitHub repo" 선택
2. `myaji35/choncance` repository 선택
3. "Deploy Now" 클릭

### 3. PostgreSQL 데이터베이스 추가
1. 프로젝트 대시보드에서 "+ New" 클릭
2. "Database" → "PostgreSQL" 선택
3. 자동으로 생성됨

### 4. 환경 변수 설정

Railway 대시보드 → 백엔드 서비스 → Variables에서 설정:

```bash
# Database (자동 생성됨, 확인만 하세요)
DATABASE_URL=postgresql+asyncpg://postgres:...@...railway.app:5432/railway

# JWT Secret (직접 생성)
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Python 버전 (선택 사항)
PYTHON_VERSION=3.12
```

### 5. Build 및 Start Command 설정

Railway 대시보드 → Settings → Deploy:

**Root Directory**: `backend`

**Build Command**:
```bash
pip install -r requirements.txt
```

**Start Command**:
```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 6. 도메인 설정

Railway 대시보드 → Settings → Domains:
- "Generate Domain" 클릭하여 `.railway.app` 도메인 생성
- 또는 커스텀 도메인 연결

### 7. 배포 확인

생성된 URL로 접속하여 확인:
```
https://your-backend.railway.app/docs
```

---

## 🔧 백엔드 배포 (Render - 대안)

Railway 대신 Render를 사용할 수도 있습니다.

### 1. Render 계정 생성
1. https://render.com 접속
2. GitHub 계정으로 로그인

### 2. PostgreSQL 데이터베이스 생성
1. Dashboard → "New +" → "PostgreSQL" 선택
2. Name: `choncance-db`
3. Database: `choncance`
4. User: `choncance_user`
5. Region: 가까운 지역 선택
6. "Create Database" 클릭

### 3. Web Service 생성
1. Dashboard → "New +" → "Web Service" 선택
2. GitHub repository `myaji35/choncance` 연결
3. 설정:
   - **Name**: `choncance-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 4. 환경 변수 설정

Environment 탭에서 설정:

```bash
DATABASE_URL=postgresql+asyncpg://choncance_user:...@...render.com/choncance
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
PYTHON_VERSION=3.12
```

### 5. 배포 확인
```
https://choncance-backend.onrender.com/docs
```

---

## 🔗 프론트엔드 ↔ 백엔드 연결

### 1. 백엔드 URL 설정

프론트엔드 환경 변수에 백엔드 URL 추가:

**Netlify** → Environment variables:
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 2. 프론트엔드 API 클라이언트 수정

`src/app/signup/page.tsx` 등에서 API URL을 환경 변수로 변경:

```typescript
// Before
const response = await fetch('http://localhost:8000/api/v1/auth/register', {

// After
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
```

### 3. CORS 설정 (백엔드)

`backend/app/main.py`에 CORS 미들웨어 추가:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-domain.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🗄️ 데이터베이스 마이그레이션

### Railway/Render에서 마이그레이션 실행

배포 시 자동으로 실행되지만, 수동으로 실행하려면:

**Railway**:
```bash
railway run alembic upgrade head
```

**Render**:
- Shell 탭에서 직접 실행
```bash
alembic upgrade head
```

---

## 🔐 보안 체크리스트

배포 전 확인사항:

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] `SECRET_KEY`를 강력한 랜덤 문자열로 변경 (최소 32자)
- [ ] 프로덕션 데이터베이스 비밀번호 변경
- [ ] CORS 설정에서 실제 도메인만 허용
- [ ] `DEBUG=False` (프로덕션 모드)
- [ ] HTTPS 사용 (Railway/Render는 자동 제공)
- [ ] 환경 변수가 Git에 커밋되지 않았는지 확인

---

## 📊 모니터링

### Railway
- Dashboard → Metrics에서 CPU, 메모리, 네트워크 모니터링
- Logs 탭에서 실시간 로그 확인

### Render
- Logs 탭에서 실시간 로그 확인
- Metrics 탭에서 리소스 사용량 모니터링

### Netlify
- Deploys 탭에서 빌드 로그 확인
- Analytics에서 트래픽 분석

---

## 🐛 문제 해결

### 백엔드가 시작되지 않음
1. Railway/Render Logs 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. `DATABASE_URL`이 `postgresql+asyncpg://` 형식인지 확인

### 데이터베이스 연결 실패
1. DATABASE_URL 형식 확인: `postgresql+asyncpg://user:password@host:port/database`
2. 데이터베이스가 실행 중인지 확인
3. 방화벽 설정 확인

### 프론트엔드에서 API 호출 실패
1. `NEXT_PUBLIC_API_URL` 환경 변수 확인
2. CORS 설정 확인
3. 백엔드 서버가 실행 중인지 확인

---

## 📝 추가 참고 자료

- [Railway 문서](https://docs.railway.app/)
- [Render 문서](https://render.com/docs)
- [Netlify 문서](https://docs.netlify.com/)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

---

## 🎉 배포 완료 후

배포가 완료되면:

1. ✅ 프론트엔드 URL 확인 (https://your-domain.netlify.app)
2. ✅ 백엔드 API 문서 확인 (https://your-backend.railway.app/docs)
3. ✅ 회원가입/로그인 테스트
4. ✅ 프로필 관리 테스트
5. ✅ 비밀번호 재설정 테스트

축하합니다! ChonCance가 성공적으로 배포되었습니다! 🚀
