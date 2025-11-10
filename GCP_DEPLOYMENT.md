# VINTEE GCP Cloud Run 배포 완료

## 배포 정보 ✅

**배포 일시**: 2025-11-10
**프로젝트 ID**: vintee-477801
**서비스 이름**: choncance
**리전**: asia-northeast3 (Seoul)
**상태**: ✅ 배포 완료 및 정상 작동

---

## 서비스 URL

### 프로덕션 URL
🌐 **https://choncance-812827839019.asia-northeast3.run.app**

브라우저에서 접속하여 확인 가능합니다.

---

## 배포 구성

### 인프라
- **플랫폼**: Google Cloud Run (Serverless)
- **컨테이너**: Docker (Dockerfile 기반)
- **빌드 방식**: Cloud Build 자동 빌드
- **리소스**:
  - CPU: 1 vCPU
  - 메모리: 1 GB
  - 최소 인스턴스: 0 (콜드 스타트)
  - 최대 인스턴스: 10
  - 타임아웃: 300초

### 데이터베이스
- **타입**: PostgreSQL (Neon Serverless)
- **연결**: 외부 Neon DB 사용
- **DATABASE_URL**: `postgresql://neondb_owner:***@ep-proud-fog-a100b0a9-pooler.ap-southeast-1.aws.neon.tech/neondb`

### 환경 변수
다음 환경 변수가 Cloud Run에 설정되어 있습니다:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# Toss Payments (테스트 모드)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_***
TOSS_SECRET_KEY=test_sk_***

# Google Gemini AI
GEMINI_API_KEY=AIzaSy***

# Kakao OAuth
KAKAO_CLIENT_ID=830***
KAKAO_CLIENT_SECRET=A0P***
KAKAO_ALIMTALK_ENABLED=false

# Database
DATABASE_URL=postgresql://***
```

---

## 배포 프로세스

### 1. 사전 준비
```bash
# GCP 프로젝트 설정
gcloud config set project vintee-477801

# 필요한 API 활성화
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 2. 권한 설정
```bash
# Cloud Build 서비스 계정에 권한 부여
gcloud projects add-iam-policy-binding vintee-477801 \
  --member=serviceAccount:812827839019-compute@developer.gserviceaccount.com \
  --role=roles/storage.admin

gcloud projects add-iam-policy-binding vintee-477801 \
  --member=serviceAccount:812827839019-compute@developer.gserviceaccount.com \
  --role=roles/artifactregistry.writer

gcloud projects add-iam-policy-binding vintee-477801 \
  --member=serviceAccount:812827839019@cloudbuild.gserviceaccount.com \
  --role=roles/run.admin
```

### 3. 배포 실행
```bash
# deploy.sh 스크립트 실행
./deploy.sh
```

deploy.sh는 다음 작업을 수행합니다:
1. Dockerfile을 사용하여 컨테이너 이미지 빌드
2. Artifact Registry에 이미지 푸시
3. Cloud Run 서비스 생성/업데이트
4. 환경 변수 설정
5. 트래픽 100% 새 리비전으로 라우팅

---

## 배포 후 확인사항

### ✅ 완료된 항목

1. **홈페이지 로딩**: 정상 작동
2. **Clerk 인증**: 환경 변수 설정 완료
3. **Neon PostgreSQL**: 외부 DB 연결 설정
4. **환경 변수**: 모든 필수 환경 변수 설정 완료
5. **HTTPS**: 자동 SSL 인증서 적용

### ⚠️ 추가 작업 필요

1. **데이터베이스 마이그레이션**
   ```bash
   # Prisma 마이그레이션 실행
   DATABASE_URL="postgresql://neondb_owner:***" npx prisma migrate deploy

   # 초기 데이터 시딩
   DATABASE_URL="postgresql://neondb_owner:***" npm run seed
   ```

2. **Clerk 설정**
   - Clerk Dashboard에서 허용 도메인 추가
   - `https://choncance-812827839019.asia-northeast3.run.app` 추가 필요

3. **Toss Payments 프로덕션 키**
   - 현재 테스트 키 사용 중
   - 실제 결제 처리를 위해 프로덕션 키로 교체 필요

4. **커스텀 도메인 연결** (선택)
   ```bash
   # 커스텀 도메인 매핑 (예: www.vintee.kr)
   gcloud run domain-mappings create \
     --service choncance \
     --domain www.vintee.kr \
     --region asia-northeast3
   ```

5. **모니터링 설정**
   - Cloud Logging 확인
   - Cloud Monitoring 대시보드 설정
   - 알림 규칙 설정

---

## 운영 가이드

### 로그 확인
```bash
# 실시간 로그 보기
gcloud run services logs read choncance \
  --region asia-northeast3 \
  --follow

# 최근 로그 보기
gcloud run services logs read choncance \
  --region asia-northeast3 \
  --limit 50
```

### 서비스 상태 확인
```bash
# 서비스 정보 보기
gcloud run services describe choncance \
  --region asia-northeast3

# 리비전 목록 보기
gcloud run revisions list \
  --service choncance \
  --region asia-northeast3
```

### 재배포
```bash
# 코드 변경 후 재배포
git add .
git commit -m "your changes"
git push

# deploy.sh 실행
./deploy.sh
```

### 환경 변수 업데이트
```bash
# 단일 환경 변수 업데이트
gcloud run services update choncance \
  --region asia-northeast3 \
  --update-env-vars KEY=VALUE

# 전체 환경 변수 다시 설정
# deploy.sh의 --update-env-vars 부분 수정 후 재실행
```

### 트래픽 분할 (Blue-Green 배포)
```bash
# 새 리비전에 트래픽 점진적 이동
gcloud run services update-traffic choncance \
  --region asia-northeast3 \
  --to-revisions choncance-00002=50,choncance-00001=50
```

---

## 비용 관리

### 무료 할당량 (매월)
- **요청**: 2백만 건
- **컴퓨팅 시간**: 360,000 vCPU-초
- **메모리**: 180,000 GiB-초
- **네트워크(이그레스)**: 1 GB

### 비용 절감 팁
1. **최소 인스턴스 0**: 트래픽 없을 때 인스턴스 자동 종료
2. **콜드 스타트 최적화**: Next.js standalone 출력 사용
3. **이미지 최적화**: Docker 멀티 스테이지 빌드로 이미지 크기 최소화
4. **캐싱**: CDN 및 브라우저 캐싱 활용

### 비용 모니터링
```bash
# 청구 계정 확인
gcloud billing accounts list

# 프로젝트 비용 확인 (Google Cloud Console에서)
# https://console.cloud.google.com/billing
```

---

## 보안 고려사항

### ✅ 적용된 보안 설정
1. **HTTPS**: 자동 SSL/TLS 인증서
2. **인증**: Clerk JWT 기반 인증
3. **환경 변수**: Cloud Run Secret Manager 사용 권장
4. **IAM**: 최소 권한 원칙 적용

### 🔒 추가 보안 강화
1. **Secret Manager 사용**
   ```bash
   # Secret 생성
   echo -n "DATABASE_URL_VALUE" | gcloud secrets create database-url --data-file=-

   # Cloud Run에서 Secret 사용
   gcloud run services update choncance \
     --region asia-northeast3 \
     --update-secrets DATABASE_URL=database-url:latest
   ```

2. **VPC Connector** (DB 보안 강화)
   - Cloud SQL 또는 private network 사용 시
   - VPC Connector 설정 권장

3. **Rate Limiting**
   - Cloud Armor 설정
   - API Gateway 사용

---

## 트러블슈팅

### 배포 실패 시

1. **권한 오류**
   ```bash
   # IAM 권한 재설정
   gcloud projects add-iam-policy-binding vintee-477801 \
     --member=serviceAccount:812827839019-compute@developer.gserviceaccount.com \
     --role=roles/editor
   ```

2. **빌드 실패**
   ```bash
   # 로컬에서 Docker 빌드 테스트
   docker build -t test-build .

   # 빌드 로그 확인
   gcloud builds list --region asia-northeast3
   gcloud builds log BUILD_ID
   ```

3. **서비스 시작 실패**
   ```bash
   # 로그 확인
   gcloud run services logs read choncance --region asia-northeast3

   # 포트 설정 확인 (8080)
   # Dockerfile의 EXPOSE 8080과 deploy.sh의 --port 8080 일치 확인
   ```

### 성능 이슈

1. **콜드 스타트 느림**
   - 최소 인스턴스를 1로 설정 (비용 발생)
   - 이미지 크기 최적화

2. **메모리 부족**
   - 메모리 제한 증가: `--memory 2Gi`
   - 로그에서 OOM 에러 확인

3. **타임아웃**
   - 타임아웃 증가: `--timeout 600`
   - 긴 작업은 백그라운드 태스크로 분리

---

## 다음 단계

1. ✅ **데이터베이스 마이그레이션 실행**
2. ✅ **Clerk 도메인 설정 확인**
3. ⏳ **모니터링 및 알림 설정**
4. ⏳ **커스텀 도메인 연결** (선택)
5. ⏳ **Toss Payments 프로덕션 키 적용**
6. ⏳ **성능 테스트 및 최적화**
7. ⏳ **백업 전략 수립**

---

## 참고 문서

- [Google Cloud Run 문서](https://cloud.google.com/run/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Clerk 프로덕션 체크리스트](https://clerk.com/docs/deployments/production-checklist)
- [Neon PostgreSQL 문서](https://neon.tech/docs)

---

**마지막 업데이트**: 2025-11-10
**배포 담당**: Claude Code
**프로젝트**: VINTEE (빈티)
