# 🚀 ChonCance 배포 - 바로 실행하기

## Google Cloud Run + Cloud SQL PostgreSQL 배포

### 1단계: Google Cloud 로그인
터미널에서 실행:
```bash
gcloud auth login
```
→ 브라우저가 열리고 Google 계정으로 로그인

### 2단계: 필수 API 활성화
```bash
# API 활성화
gcloud services enable run.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com
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
🌐 서비스 URL: https://choncance-646626710380.asia-northeast3.run.app
```

## 생성된 리소스

✅ **Cloud Run 서비스**: choncance (asia-northeast3)
✅ **Cloud SQL 인스턴스**: choncance-db (PostgreSQL 15)
✅ **데이터베이스**: choncance
✅ **연결**: Cloud Run ↔ Cloud SQL Unix Socket

## PostgreSQL 접속 정보

- **인스턴스**: choncance-db
- **사용자**: postgres
- **비밀번호**: ChonCance2025!
- **데이터베이스**: choncance
- **연결 방식**: Cloud SQL Proxy (Unix Socket)

---

## 지금 바로 시작하세요!

```bash
# 1. 로그인
gcloud auth login

# 2. API 활성화
gcloud services enable run.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com

# 3. 배포!
./deploy.sh
```

## 주의사항

- 첫 배포 후 Prisma 마이그레이션이 필요할 수 있습니다
- Cloud SQL 인스턴스는 생성 후 자동으로 연결됩니다
- 데이터베이스 비밀번호: `ChonCance2025!`
