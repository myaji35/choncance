# GCP Cloud SQL PostgreSQL 설정 가이드

## 프로젝트 정보
- **프로젝트 ID**: postgresql-479201
- **리전**: asia-northeast3 (서울)

## 1. GCP Cloud SQL 인스턴스 생성

### Google Cloud Console에서 설정
1. [Google Cloud Console](https://console.cloud.google.com)에 접속
2. 프로젝트 선택: `postgresql-479201`
3. Cloud SQL 페이지로 이동
4. "인스턴스 만들기" 클릭

### 인스턴스 설정
```
인스턴스 ID: vintee-db
데이터베이스 버전: PostgreSQL 15
리전: asia-northeast3 (서울)
가용성: 단일 영역
머신 유형: db-f1-micro (개발용) 또는 db-n1-standard-1 (프로덕션)
스토리지: 10GB SSD
백업: 자동 백업 활성화
```

## 2. 데이터베이스 및 사용자 생성

### gcloud CLI를 사용한 설정
```bash
# gcloud 인증
gcloud auth login

# 프로젝트 설정
gcloud config set project postgresql-479201

# 데이터베이스 생성
gcloud sql databases create vintee_db --instance=vintee-db

# 사용자 생성
gcloud sql users create vintee_user --instance=vintee-db --password=your_secure_password

# 공개 IP 확인
gcloud sql instances describe vintee-db --format="value(ipAddresses[0].ipAddress)"
```

## 3. 연결 설정

### 방법 1: 공개 IP 사용 (개발용)
```bash
# 현재 IP 승인
gcloud sql instances patch vintee-db --authorized-networks=$(curl -s ifconfig.me)

# .env.local에 설정
DATABASE_URL=postgresql://vintee_user:your_password@PUBLIC_IP:5432/vintee_db?sslmode=require
```

### 방법 2: Cloud SQL Proxy 사용 (권장)
```bash
# Cloud SQL Proxy 설치
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.darwin.arm64
chmod +x cloud-sql-proxy

# Proxy 실행
./cloud-sql-proxy --port=5432 postgresql-479201:asia-northeast3:vintee-db

# .env.local에 설정
DATABASE_URL=postgresql://vintee_user:your_password@localhost:5432/vintee_db
```

### 방법 3: Private IP 사용 (프로덕션)
VPC 네트워크 설정 후 Private IP 사용

## 4. Prisma 마이그레이션

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate deploy

# 또는 개발 환경에서
npx prisma db push

# 시드 데이터 생성
npm run seed
```

## 5. 연결 테스트

```bash
# PostgreSQL 클라이언트로 직접 연결
psql "postgresql://vintee_user:your_password@PUBLIC_IP:5432/vintee_db?sslmode=require"

# 또는 Prisma Studio로 확인
npx prisma studio
```

## 6. 보안 설정

### SSL 인증서 설정
1. Cloud SQL 인스턴스에서 SSL 인증서 다운로드
2. 연결 문자열에 SSL 옵션 추가:
```
?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem&sslrootcert=server-ca.pem
```

### IAM 인증 사용
```bash
# IAM 데이터베이스 인증 활성화
gcloud sql instances patch vintee-db --database-flags=cloudsql.iam_authentication=on

# IAM 사용자 생성
gcloud sql users create vintee-user@project.iam --instance=vintee-db --type=CLOUD_IAM_USER
```

## 7. 모니터링

### Cloud Monitoring 설정
- CPU 사용률
- 메모리 사용률
- 연결 수
- 쿼리 성능

### 로그 확인
```bash
gcloud sql operations list --instance=vintee-db
gcloud logging read "resource.type=cloudsql_database" --limit=50
```

## 8. 백업 및 복구

### 수동 백업
```bash
gcloud sql backups create --instance=vintee-db
```

### 백업 목록 확인
```bash
gcloud sql backups list --instance=vintee-db
```

### 복구
```bash
gcloud sql backups restore BACKUP_ID --backup-instance=vintee-db --backup-id=BACKUP_ID
```

## 9. 비용 최적화

### 개발 환경
- 인스턴스 중지 기능 사용 (사용하지 않을 때)
- db-f1-micro 인스턴스 사용

### 프로덕션 환경
- 예약 인스턴스 할인 적용
- 자동 스케일링 설정
- 읽기 전용 복제본 활용

## 10. 트러블슈팅

### 연결 오류
```bash
# IP 화이트리스트 확인
gcloud sql instances describe vintee-db --format="value(settings.ipConfiguration.authorizedNetworks[].value)"

# 현재 IP 추가
gcloud sql instances patch vintee-db --authorized-networks=$(curl -s ifconfig.me)
```

### 권한 오류
```bash
# 사용자 권한 확인
gcloud sql users list --instance=vintee-db

# 데이터베이스 권한 부여 (psql 접속 후)
GRANT ALL PRIVILEGES ON DATABASE vintee_db TO vintee_user;
```

## 환경 변수 예시

```env
# GCP Cloud SQL PostgreSQL
DATABASE_URL=postgresql://vintee_user:secure_password@34.64.xxx.xxx:5432/vintee_db?sslmode=require
DIRECT_URL=postgresql://vintee_user:secure_password@34.64.xxx.xxx:5432/vintee_db?sslmode=require

# Cloud SQL Proxy 사용 시
DATABASE_URL=postgresql://vintee_user:secure_password@localhost:5432/vintee_db
DIRECT_URL=postgresql://vintee_user:secure_password@localhost:5432/vintee_db
```

## 주의사항

1. **프로덕션 환경에서는 반드시 Cloud SQL Proxy 또는 Private IP를 사용하세요**
2. **강력한 비밀번호를 사용하고 정기적으로 변경하세요**
3. **백업을 정기적으로 수행하고 복구 테스트를 진행하세요**
4. **모니터링 알림을 설정하여 이상 징후를 조기에 감지하세요**
5. **개발/스테이징/프로덕션 환경을 분리하세요**