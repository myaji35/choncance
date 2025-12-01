# VINTEE Vercel & GCP PostgreSQL 배포 단계별 가이드

## 현재 상태
- ✅ GCP Cloud SQL 인스턴스: `postgresql-479201`
- ✅ Vercel 프로젝트: 생성됨
- ✅ 로컬 빌드: 성공

## 배포 단계

### Step 1: GCP Cloud SQL 연결 정보 확인

1. [GCP Console](https://console.cloud.google.com/sql/instances) 접속
2. `postgresql-479201` 인스턴스 클릭
3. 다음 정보 확인:
   - **공개 IP 주소**: 개요 탭에서 확인 (예: 34.64.123.456)
   - **사용자명**: 기본값 `postgres` 또는 생성한 사용자명
   - **비밀번호**: 인스턴스/사용자 생성 시 설정한 비밀번호
   - **데이터베이스 이름**: `vintee` 또는 `townin-db` 등

4. **중요**: 연결 설정 확인
   - 연결 탭 > 네트워킹
   - "공개 IP" 활성화 확인
   - "승인된 네트워크"에 `0.0.0.0/0` 추가 (모든 IP 허용 - 개발용)
   - 또는 Vercel IP 범위 추가 (보안 강화)

### Step 2: 로컬에서 GCP PostgreSQL 연결 테스트

1. `.env.gcp.template` 파일을 `.env.local`로 복사:
```bash
cp .env.gcp.template .env.local
```

2. `.env.local` 파일 수정:
```bash
# GCP 정보로 업데이트
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_IP:5432/vintee"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_IP:5432/vintee"
```

3. 데이터베이스 연결 테스트:
```bash
# Prisma로 연결 확인
npx prisma db push --preview-feature

# 또는
npx prisma studio
```

### Step 3: 데이터베이스 마이그레이션 실행

```bash
# 1. Prisma 마이그레이션 배포
npx prisma migrate deploy

# 2. 시드 데이터 입력 (태그, 샘플 숙소 등)
npm run seed
npm run seed:properties
```

### Step 4: Vercel 환경 변수 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. VINTEE 프로젝트 선택
3. Settings > Environment Variables 클릭
4. 다음 환경 변수 추가:

#### 필수 환경 변수

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://USER:PASS@IP:5432/DB?pgbouncer=true&connection_limit=1` | Production, Preview |
| `DIRECT_URL` | `postgresql://USER:PASS@IP:5432/DB` | Production, Preview |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 퍼블릭 키 | Production, Preview |
| `CLERK_SECRET_KEY` | Clerk 시크릿 키 | Production, Preview |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | Toss 클라이언트 키 | Production, Preview |
| `TOSS_SECRET_KEY` | Toss 시크릿 키 | Production, Preview |
| `GEMINI_API_KEY` | Gemini API 키 | Production, Preview |
| `ADMIN_PASSWORD_HASH` | `$2b$10$/2LriKXhyrDcDzRgC9TzeOmB5X2tY4AIUBvIeW4tH0eenTOcWVOte` | Production, Preview |
| `JWT_SECRET` | 강력한 랜덤 문자열 | Production, Preview |

#### 선택 환경 변수

| Key | Value | Environment |
|-----|-------|-------------|
| `OPENAI_API_KEY` | OpenAI API 키 (챗봇용) | Production, Preview |
| `KAKAO_ALIMTALK_ENABLED` | `true` 또는 `false` | Production, Preview |
| `KAKAO_ALIMTALK_API_KEY` | 카카오 REST API 키 | Production, Preview |
| `KAKAO_ALIMTALK_SENDER_KEY` | 카카오 발신 키 | Production, Preview |

### Step 5: 프로덕션 키 발급

#### Clerk (인증)
1. [Clerk Dashboard](https://dashboard.clerk.com/) 접속
2. 프로젝트 선택 또는 새로 생성
3. API Keys 메뉴에서 Production 키 복사
4. Vercel에 설정

#### Toss Payments (결제)
1. [Toss Payments 개발자센터](https://developers.tosspayments.com/) 접속
2. 내 앱 선택 또는 새로 생성
3. 라이브 키 발급 (심사 필요할 수 있음)
4. Vercel에 설정

**개발용**: 현재 테스트 키 그대로 사용 가능
- `test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq`
- `test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R`

### Step 6: Vercel 배포

#### 자동 배포 (권장)
```bash
# main 브랜치에 푸시
git add .
git commit -m "feat: Vercel 배포 설정 완료"
git push origin main
```

Vercel이 자동으로 빌드 및 배포를 시작합니다.

#### 수동 배포
1. Vercel Dashboard > 프로젝트 > Deployments
2. "Redeploy" 클릭

### Step 7: 배포 확인

1. **빌드 로그 확인**
   - Vercel Dashboard > Deployments > 최근 배포 클릭
   - Build Logs 확인
   - 에러 발생 시 환경 변수 및 데이터베이스 연결 확인

2. **배포된 사이트 접속**
   - `https://your-project.vercel.app` 접속
   - 홈페이지 로딩 확인

3. **기능 테스트**
   - [ ] 회원가입/로그인 (Clerk)
   - [ ] 숙소 목록 조회 (`/explore`)
   - [ ] 숙소 상세 페이지 (`/property/[id]`)
   - [ ] 예약 기능 (`/booking/checkout`)
   - [ ] 결제 테스트 (Toss Payments)

### Step 8: 도메인 설정 (선택사항)

1. Vercel Dashboard > 프로젝트 > Settings > Domains
2. 커스텀 도메인 추가 (예: `vintee.co.kr`)
3. DNS 설정:
   - A Record: Vercel IP
   - CNAME: `cname.vercel-dns.com`

### Step 9: 사후 설정

#### Clerk Redirect URLs 업데이트
Clerk Dashboard > 프로젝트 > Paths에서:
- Sign-in URL: `https://your-domain.vercel.app/auth/login`
- Sign-up URL: `https://your-domain.vercel.app/auth/signup`

#### Toss Payments 도메인 등록
Toss Payments 개발자센터 > 내 앱 > 도메인 설정:
- `https://your-domain.vercel.app`

## 트러블슈팅

### 빌드 실패

**증상**: Vercel 배포 시 빌드 에러
**원인**:
- Prisma generate 실패: `DATABASE_URL` 누락 또는 잘못됨
- TypeScript 에러: 타입 오류

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# Vercel 환경 변수 확인
# DATABASE_URL, DIRECT_URL 설정 확인
```

### 데이터베이스 연결 실패

**증상**: 500 에러, Database connection error
**원인**:
- GCP SQL 공개 IP 비활성화
- 승인된 네트워크 미설정
- 잘못된 비밀번호

**해결**:
1. GCP Console > SQL > 인스턴스 > 연결 > 네트워킹
2. 공개 IP 활성화
3. 승인된 네트워크에 `0.0.0.0/0` 추가
4. DATABASE_URL 형식 확인

### Prisma 마이그레이션 실패

**증상**: Migration failed
**원인**:
- DIRECT_URL 누락
- 데이터베이스 권한 부족

**해결**:
```bash
# DIRECT_URL 설정 확인
# Vercel 환경 변수에 DIRECT_URL 추가

# 로컬에서 마이그레이션 테스트
npx prisma migrate deploy
```

## 체크리스트

배포 전:
- [ ] GCP Cloud SQL 인스턴스 확인
- [ ] 로컬에서 GCP DB 연결 테스트
- [ ] 로컬에서 마이그레이션 완료
- [ ] 로컬에서 시드 데이터 입력
- [ ] 로컬 빌드 성공 (`npm run build`)

Vercel 설정:
- [ ] Vercel 환경 변수 설정 완료
- [ ] DATABASE_URL 설정
- [ ] DIRECT_URL 설정
- [ ] Clerk 키 설정
- [ ] Toss Payments 키 설정
- [ ] 기타 필수 환경 변수 설정

배포 후:
- [ ] 빌드 로그 확인 (에러 없음)
- [ ] 사이트 접속 확인
- [ ] 로그인/회원가입 테스트
- [ ] 숙소 조회 테스트
- [ ] 예약 기능 테스트
- [ ] Clerk Redirect URLs 업데이트
- [ ] Toss Payments 도메인 등록

## 다음 단계

배포 완료 후:
1. 성능 모니터링 (Vercel Analytics)
2. 에러 추적 (Sentry 등)
3. 백업 설정 (GCP Cloud SQL 자동 백업)
4. SSL 인증서 확인 (Vercel 자동 제공)
5. SEO 최적화
6. 실제 사용자 테스트

## 참고 자료

- [Vercel 배포 가이드](./VERCEL_DEPLOYMENT.md)
- [GCP Cloud SQL 문서](https://cloud.google.com/sql/docs)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)
- [Clerk 문서](https://clerk.com/docs)
- [Toss Payments 문서](https://docs.tosspayments.com/)
