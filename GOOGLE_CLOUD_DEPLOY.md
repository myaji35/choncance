# Google Cloud Run 배포 가이드

## 사전 준비

### 1. Google Cloud CLI 설치 확인
```bash
gcloud --version
```

설치되지 않았다면: https://cloud.google.com/sdk/docs/install

### 2. Google Cloud 프로젝트 생성
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성: `choncance`
3. 프로젝트 ID 기록 (예: `choncance-123456`)

### 3. 필수 API 활성화
```bash
# 프로젝트 설정
gcloud config set project YOUR_PROJECT_ID

# Cloud Run API 활성화
gcloud services enable run.googleapis.com

# Container Registry API 활성화
gcloud services enable containerregistry.googleapis.com

# Artifact Registry API 활성화
gcloud services enable artifactregistry.googleapis.com
```

## 배포 단계

### 1단계: 로그인 및 프로젝트 설정
```bash
# Google Cloud 로그인
gcloud auth login

# 프로젝트 설정
gcloud config set project YOUR_PROJECT_ID

# 리전 설정 (서울)
gcloud config set run/region asia-northeast3
```

### 2단계: Docker 이미지 빌드 및 푸시
```bash
# Artifact Registry 저장소 생성 (최초 1회만)
gcloud artifacts repositories create choncance-repo \
  --repository-format=docker \
  --location=asia-northeast3 \
  --description="ChonCance Docker repository"

# Docker 인증 설정
gcloud auth configure-docker asia-northeast3-docker.pkg.dev

# 프로젝트 ID 설정 (YOUR_PROJECT_ID를 실제 프로젝트 ID로 변경)
export PROJECT_ID=YOUR_PROJECT_ID

# Docker 이미지 빌드
docker build -t asia-northeast3-docker.pkg.dev/$PROJECT_ID/choncance-repo/choncance:latest .

# Docker 이미지 푸시
docker push asia-northeast3-docker.pkg.dev/$PROJECT_ID/choncance-repo/choncance:latest
```

### 3단계: Cloud Run에 배포
```bash
gcloud run deploy choncance \
  --image asia-northeast3-docker.pkg.dev/$PROJECT_ID/choncance-repo/choncance:latest \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXRoaWNhbC1zd2lmdC0xLmNsZXJrLmFjY291bnRzLmRldiQ" \
  --set-env-vars "CLERK_SECRET_KEY=sk_test_QGq3SR7xnY2fjnzeZhVVhUqOovPKfPgzYurXtJqfNV" \
  --set-env-vars "NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login" \
  --set-env-vars "NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup" \
  --set-env-vars "DATABASE_URL=postgresql://neondb_owner:npg_d9OoK2qQlTXH@ep-proud-fog-a100b0a9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  --set-env-vars "NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production" \
  --set-env-vars "KAKAO_CLIENT_ID=83022bf07d136c31285491b85c6ee6aa" \
  --set-env-vars "KAKAO_CLIENT_SECRET=A0PIZLG3vhO9CmS5J1hsgu9T0LhRnWSS" \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### 4단계: 배포 확인
```bash
# 서비스 URL 확인
gcloud run services describe choncance --region asia-northeast3 --format 'value(status.url)'

# 배포된 서비스 테스트
curl https://choncance-XXXXX.run.app
```

## 간편 배포 스크립트

`deploy.sh` 파일 사용:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 환경 변수 업데이트

환경 변수만 변경할 경우:
```bash
gcloud run services update choncance \
  --region asia-northeast3 \
  --update-env-vars "DATABASE_URL=new_value"
```

## 트러블슈팅

### Docker 빌드 실패
```bash
# .dockerignore 확인
cat .dockerignore

# 로컬에서 빌드 테스트
docker build -t test-choncance .
docker run -p 8080:8080 test-choncance
```

### 배포 로그 확인
```bash
gcloud run services logs read choncance --region asia-northeast3
```

### 서비스 삭제 (필요시)
```bash
gcloud run services delete choncance --region asia-northeast3
```

## 비용 최적화

- **Min instances**: 0 (사용하지 않을 때 비용 없음)
- **Max instances**: 10 (트래픽 급증 대비)
- **Memory**: 512Mi (Next.js 앱에 충분)
- **CPU**: 1 (기본 성능)

예상 비용: 무료 티어 내에서 사용 가능 (월 2백만 요청까지 무료)

## 커스텀 도메인 설정

1. Cloud Console → Cloud Run → choncance 선택
2. "Manage Custom Domains" 클릭
3. 도메인 추가 및 DNS 설정

## CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` 파일을 참고하여 자동 배포 설정 가능
