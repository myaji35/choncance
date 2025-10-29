# 🚀 ChonCance 배포 - 바로 실행하기

## Google Cloud Run 배포 (3단계)

### 1단계: Google Cloud 로그인
터미널에서 실행:
```bash
gcloud auth login
```
→ 브라우저가 열리고 Google 계정으로 로그인

### 2단계: 필수 API 활성화 및 설정
```bash
# API 활성화
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# Artifact Registry 생성
gcloud artifacts repositories create choncance-repo \
  --repository-format=docker \
  --location=asia-northeast3 \
  --description="ChonCance Docker repository"

# Docker 인증
gcloud auth configure-docker asia-northeast3-docker.pkg.dev
```

### 3단계: 배포 실행
```bash
./deploy.sh
```

## 예상 소요 시간: 5-7분

---

## 배포 완료 후

배포가 성공하면 URL이 표시됩니다:
```
🌐 서비스 URL: https://choncance-xxxxx.run.app
```

## 다음 단계 (배포 완료 후)

1. ✅ Google Ads 광고 추가
2. ✅ 호스트 수수료 3%로 변경
3. ✅ 가상화폐 결제 기능 추가

---

## 지금 바로 시작하세요!

```bash
# 1. 로그인
gcloud auth login

# 2. API 활성화
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# 3. Artifact Registry 생성
gcloud artifacts repositories create choncance-repo \
  --repository-format=docker \
  --location=asia-northeast3

# 4. Docker 인증
gcloud auth configure-docker asia-northeast3-docker.pkg.dev

# 5. 배포!
./deploy.sh
```
