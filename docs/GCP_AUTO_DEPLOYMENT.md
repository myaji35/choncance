# GCP 자동 배포 설정 가이드

이 가이드는 GitHub에 코드를 push할 때 자동으로 Google Cloud Run에 배포되도록 설정하는 방법을 안내합니다.

## 개요

- **트리거 소스**: GitHub repository (main 브랜치)
- **빌드 설정**: `cloudbuild.yaml`
- **배포 대상**: Cloud Run (`choncance` 서비스)
- **리전**: asia-northeast3 (서울)

## 사전 요구사항

1. Google Cloud Project (choncance)
2. GitHub repository 연결
3. 필요한 GCP 서비스 활성화:
   - Cloud Build API
   - Cloud Run API
   - Artifact Registry API
   - Cloud SQL Admin API

## 1단계: GCP 서비스 활성화

```bash
# GCP 프로젝트 설정
gcloud config set project choncance

# 필요한 API 활성화
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

## 2단계: Artifact Registry 생성

```bash
# Docker 이미지를 저장할 Artifact Registry 생성
gcloud artifacts repositories create choncance-repo \
  --repository-format=docker \
  --location=asia-northeast3 \
  --description="ChonCance Docker images"

# Cloud Build 서비스 계정 권한 부여
PROJECT_NUMBER=$(gcloud projects describe choncance --format='value(projectNumber)')
gcloud projects add-iam-policy-binding choncance \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding choncance \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding choncance \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

## 3단계: GitHub 연결

### 방법 A: GCP Console 사용 (권장)

1. GCP Console에서 **Cloud Build** > **트리거** 페이지로 이동
   - https://console.cloud.google.com/cloud-build/triggers

2. **트리거 만들기** 클릭

3. **소스** 설정:
   - **이름**: `choncance-deploy`
   - **리전**: `asia-northeast3 (Seoul)`
   - **이벤트**: `브랜치에 푸시`
   - **소스**: GitHub 연결
     - GitHub 앱 설치 및 repository 선택
     - Repository: `choncance`
   - **브랜치**: `^main$` (정규식)

4. **구성** 설정:
   - **유형**: `Cloud Build 구성 파일`
   - **위치**: `Repository`
   - **Cloud Build 구성 파일 위치**: `cloudbuild.yaml`

5. **고급** 설정 (선택사항):
   - **대체 변수** 확인 (cloudbuild.yaml의 substitutions 값 사용)
   - 필요시 민감한 값은 Secret Manager에 저장하고 참조

6. **만들기** 클릭

### 방법 B: gcloud CLI 사용

```bash
# GitHub 앱 연결 (웹 브라우저에서 인증 필요)
gcloud builds triggers create github \
  --name="choncance-deploy" \
  --repo-name="choncance" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --region="asia-northeast3"
```

## 4단계: Secret Manager 설정 (보안 강화 - 권장)

민감한 환경 변수를 Secret Manager에 저장하고 Cloud Build에서 참조하도록 설정할 수 있습니다.

```bash
# Secret Manager API 활성화
gcloud services enable secretmanager.googleapis.com

# Clerk Secret Key 저장
echo -n "sk_test_QGq3SR7xnY2fjnzeZhVVhUqOovPKfPgzYurXtJqfNV" | \
  gcloud secrets create clerk-secret-key --data-file=-

# Database URL 저장
echo -n "postgresql://postgres:ChonCance2025!@localhost/choncance?host=/cloudsql/choncance:asia-northeast3:choncance-db" | \
  gcloud secrets create database-url --data-file=-

# Cloud Build 서비스 계정에 Secret 접근 권한 부여
PROJECT_NUMBER=$(gcloud projects describe choncance --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding clerk-secret-key \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### cloudbuild.yaml에서 Secret 사용

`cloudbuild.yaml` 파일에서 Secret Manager를 사용하려면 다음과 같이 수정:

```yaml
availableSecrets:
  secretManager:
  - versionName: projects/${PROJECT_ID}/secrets/clerk-secret-key/versions/latest
    env: 'CLERK_SECRET_KEY'
  - versionName: projects/${PROJECT_ID}/secrets/database-url/versions/latest
    env: 'DATABASE_URL'

steps:
  # ... (기존 steps)
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    secretEnv: ['CLERK_SECRET_KEY', 'DATABASE_URL']
    args:
      # ... (env-vars에서 ${CLERK_SECRET_KEY} 사용)
```

## 5단계: 테스트

### 자동 배포 테스트

```bash
# 테스트 커밋 생성
git add .
git commit -m "test: Trigger auto-deployment"
git push origin main
```

### 배포 로그 확인

1. GCP Console에서 **Cloud Build** > **기록** 페이지로 이동
   - https://console.cloud.google.com/cloud-build/builds

2. 또는 CLI로 확인:
```bash
# 최신 빌드 확인
gcloud builds list --region=asia-northeast3 --limit=5

# 특정 빌드 로그 보기
gcloud builds log BUILD_ID --region=asia-northeast3
```

### 배포된 서비스 확인

```bash
# Cloud Run 서비스 확인
gcloud run services describe choncance --region=asia-northeast3

# 서비스 URL 가져오기
SERVICE_URL=$(gcloud run services describe choncance \
  --region=asia-northeast3 \
  --format='value(status.url)')

echo "서비스 URL: $SERVICE_URL"

# 헬스체크
curl $SERVICE_URL
```

## 트러블슈팅

### 권한 오류

Cloud Build 서비스 계정에 필요한 권한이 없는 경우:

```bash
PROJECT_NUMBER=$(gcloud projects describe choncance --format='value(projectNumber)')

# Cloud Run 배포 권한
gcloud projects add-iam-policy-binding choncance \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# 서비스 계정 사용자 권한
gcloud projects add-iam-policy-binding choncance \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Cloud SQL 클라이언트 권한
gcloud projects add-iam-policy-binding choncance \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Artifact Registry 권한
gcloud projects add-iam-policy-binding choncance \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

### Artifact Registry 접근 오류

```bash
# Docker 인증 설정
gcloud auth configure-docker asia-northeast3-docker.pkg.dev
```

### 빌드 타임아웃

`cloudbuild.yaml`의 `timeout` 값을 늘립니다:

```yaml
timeout: '3600s'  # 1시간
```

### 환경 변수 오류

Cloud Run 서비스의 환경 변수를 확인:

```bash
gcloud run services describe choncance \
  --region=asia-northeast3 \
  --format='get(spec.template.spec.containers[0].env)'
```

## 배포 워크플로우

```
┌─────────────────┐
│  Git Push       │
│  (main branch)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Cloud Build    │
│  Trigger        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Docker   │
│  Image          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Push to        │
│  Artifact       │
│  Registry       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to      │
│  Cloud Run      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service Ready  │
│  ✅             │
└─────────────────┘
```

## 비용 최적화

### Cloud Build

- **무료 할당량**: 하루 120분 빌드 시간
- **초과 비용**: 분당 $0.003

### Cloud Run

- **무료 할당량**:
  - 월 2백만 요청
  - 360,000 GB-초 메모리
  - 180,000 vCPU-초
- **비용 절감 팁**:
  - `--min-instances=0` (현재 설정됨)
  - 불필요한 리소스 정리

### Artifact Registry

- **무료 할당량**: 월 0.5GB 스토리지
- **비용 절감 팁**:
  - 오래된 이미지 정기적으로 삭제
  - `latest` 태그만 유지

```bash
# 오래된 이미지 삭제 (30일 이상)
gcloud artifacts docker images list \
  asia-northeast3-docker.pkg.dev/choncance/choncance-repo/choncance \
  --filter="CREATE_TIME<$(date -d '30 days ago' -Iseconds)" \
  --format="get(package)" | \
  xargs -I {} gcloud artifacts docker images delete {} --quiet
```

## 추가 설정

### 알림 설정

Cloud Build 빌드 상태를 Slack이나 이메일로 받으려면:

1. **Pub/Sub 토픽 생성**:
```bash
gcloud pubsub topics create cloud-builds
```

2. **Cloud Build 알림 구성**:
   - GCP Console > Cloud Build > 설정
   - Pub/Sub 알림 활성화

3. **Slack Webhook 연결** (선택사항)

### 프리뷰 배포 (PR용)

Pull Request용 별도 환경을 배포하려면:

```bash
gcloud builds triggers create github \
  --name="choncance-preview" \
  --repo-name="choncance" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --pull-request-pattern="^main$" \
  --build-config="cloudbuild-preview.yaml" \
  --region="asia-northeast3"
```

## 관련 문서

- [Cloud Build 공식 문서](https://cloud.google.com/build/docs)
- [Cloud Run 배포 가이드](https://cloud.google.com/run/docs/deploying)
- [GitHub 트리거 설정](https://cloud.google.com/build/docs/automating-builds/github/build-repos-from-github)

---

**작성일**: 2025-10-29
**버전**: 1.0
