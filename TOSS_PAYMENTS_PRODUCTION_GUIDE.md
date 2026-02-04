# 토스 페이먼츠 프로덕션 키 발급 및 설정 가이드

**작성일**: 2025-01-30
**목적**: 실제 결제를 위한 프로덕션 환경 설정

---

## 📋 사전 준비물

### 필수 서류
- [ ] 사업자등록증 (법인 또는 개인사업자)
- [ ] 통장 사본 (정산 계좌)
- [ ] 대표자 신분증
- [ ] 법인인감증명서 (법인인 경우)

### 사업 정보
- 사업자등록번호
- 상호명
- 대표자명
- 업종/업태
- 정산 계좌 정보
- 고객센터 전화번호

---

## 🔐 Step 1: 토스페이먼츠 가맹점 신청

### 1.1 회원가입 및 로그인

1. **토스페이먼츠 개발자센터 접속**
   ```
   https://developers.tosspayments.com/
   ```

2. **회원가입**
   - 우측 상단 "로그인/회원가입" 클릭
   - 이메일 또는 소셜 계정으로 가입
   - 이메일 인증 완료

3. **로그인 후 대시보드 확인**
   - 현재는 테스트 키만 표시됨

### 1.2 가맹점 신청

1. **가맹점 신청 페이지 이동**
   ```
   대시보드 → "가맹점 신청하기" 버튼 클릭
   또는
   https://developers.tosspayments.com/my/merchant
   ```

2. **신청 양식 작성**

   **기본 정보**:
   - 가맹점명: ChonCance (촌캉스)
   - 대표자명: [대표자 이름]
   - 사업자등록번호: [000-00-00000]
   - 사업장 주소: [사업장 주소]

   **업종 정보**:
   - 업종: 숙박업 / 여행 서비스
   - 업태: 전자상거래업
   - 서비스 설명: 농촌 지역 숙박 예약 플랫폼

   **정산 계좌**:
   - 은행명: [은행 선택]
   - 예금주: [예금주명]
   - 계좌번호: [000-0000-0000-00]

   **담당자 정보**:
   - 담당자명: [담당자 이름]
   - 연락처: [010-0000-0000]
   - 이메일: [contact@choncance.com]

   **서비스 정보**:
   - 서비스 URL: https://choncance.com
   - 고객센터 전화: [1234-5678]
   - 고객센터 이메일: support@choncance.com

3. **서류 업로드**
   - 사업자등록증 (필수)
   - 통장 사본 (필수)
   - 신분증 사본 (필수)
   - 법인인감증명서 (법인인 경우)

4. **신청 제출**
   - 모든 정보 입력 확인
   - "신청하기" 버튼 클릭

### 1.3 심사 대기

- **심사 기간**: 영업일 기준 2-5일
- **심사 진행 상황**: 이메일 또는 대시보드에서 확인
- **추가 서류 요청**: 토스페이먼츠 담당자가 연락할 수 있음

---

## 🔑 Step 2: 프로덕션 키 발급

### 2.1 승인 완료 확인

1. **승인 완료 이메일 수신**
   - 제목: "[토스페이먼츠] 가맹점 심사가 완료되었습니다"
   - 승인 완료 안내

2. **대시보드 확인**
   ```
   https://developers.tosspayments.com/my/keys
   ```

### 2.2 프로덕션 키 확인

대시보드에서 다음 정보 확인:

```
┌─────────────────────────────────────────────────┐
│ 테스트 환경                                     │
├─────────────────────────────────────────────────┤
│ Client Key: test_ck_D5GePWvyJnrK0W0k...        │
│ Secret Key: test_sk_zXLkKEypNArWmo50...        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 프로덕션 환경 (실 결제)                        │
├─────────────────────────────────────────────────┤
│ Client Key: live_ck_YOUR_CLIENT_KEY            │
│ Secret Key: live_sk_YOUR_SECRET_KEY            │
└─────────────────────────────────────────────────┘
```

**중요**: Secret Key는 최초 1회만 표시되므로 즉시 안전한 곳에 복사해두세요!

### 2.3 키 안전하게 저장

1. **비밀번호 관리자 사용 (권장)**
   - 1Password, LastPass, Bitwarden 등

2. **환경 변수로만 관리**
   - 절대 코드에 하드코딩 금지
   - Git에 커밋하지 않도록 주의

3. **백업**
   - 안전한 곳에 별도 저장
   - 팀원과 공유 시 암호화된 채널 사용

---

## ⚙️ Step 3: 환경 변수 설정

### 3.1 로컬 개발 환경

`.env.local` 파일 업데이트:

```bash
# 개발 환경 (테스트 키 사용)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R
```

### 3.2 프로덕션 환경

#### Option A: Google Cloud Run Secret Manager 사용 (권장)

1. **Secret 생성**:
```bash
# Client Key 저장
echo -n "live_ck_YOUR_ACTUAL_CLIENT_KEY" | \
  gcloud secrets create toss-client-key \
  --data-file=- \
  --replication-policy="automatic"

# Secret Key 저장
echo -n "live_sk_YOUR_ACTUAL_SECRET_KEY" | \
  gcloud secrets create toss-secret-key \
  --data-file=- \
  --replication-policy="automatic"
```

2. **Cloud Run 서비스에 Secret 연결**:
```bash
gcloud run services update choncance \
  --update-secrets=/secrets/toss-client-key=toss-client-key:latest \
  --update-secrets=/secrets/toss-secret-key=toss-secret-key:latest \
  --region=asia-northeast3
```

3. **애플리케이션에서 Secret 읽기**:
```typescript
// 프로덕션 환경에서는 Secret Manager에서 읽기
const TOSS_CLIENT_KEY = process.env.NODE_ENV === 'production'
  ? readFileSync('/secrets/toss-client-key', 'utf-8')
  : process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
```

#### Option B: 환경 변수 직접 설정

```bash
gcloud run services update choncance \
  --update-env-vars NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_YOUR_CLIENT_KEY \
  --update-env-vars TOSS_SECRET_KEY=live_sk_YOUR_SECRET_KEY \
  --region=asia-northeast3
```

### 3.3 환경 변수 확인

```bash
# 현재 설정된 환경 변수 확인
gcloud run services describe choncance \
  --region=asia-northeast3 \
  --format="value(spec.template.spec.containers[0].env)"
```

---

## 🧪 Step 4: 테스트

### 4.1 테스트 체크리스트

프로덕션 키 설정 후 반드시 테스트:

#### 소액 결제 테스트
- [ ] 100원 결제 테스트
- [ ] 결제 성공 확인
- [ ] 데이터베이스에 기록 확인
- [ ] 이메일 알림 수신 확인

#### 환불 테스트
- [ ] 테스트 결제 환불 요청
- [ ] 토스페이먼츠 대시보드에서 환불 확인
- [ ] 환불 금액 입금 확인 (1-2일 소요)

#### 결제 실패 테스트
- [ ] 한도 초과 카드로 결제 시도
- [ ] 에러 메시지 확인
- [ ] 실패 이메일 수신 확인

### 4.2 테스트 시나리오

1. **정상 결제 플로우**:
   ```
   숙소 선택 → 날짜 선택 → 예약자 정보 입력 → 결제
   → 결제 성공 페이지 → 예약 확인 이메일 수신
   ```

2. **환불 플로우**:
   ```
   내 예약 → 예약 상세 → 환불 요청 → 환불 사유 입력
   → 환불 승인 → 환불 완료 이메일 수신
   ```

3. **결제 실패 플로우**:
   ```
   결제 진행 → 결제 실패 → 실패 페이지
   → 다시 시도 또는 예약 취소
   ```

---

## 📊 Step 5: 모니터링 설정

### 5.1 토스페이먼츠 대시보드

**접속**: https://developers.tosspayments.com/my/payments

**주요 메뉴**:
- **결제 내역**: 모든 결제 트랜잭션 조회
- **정산 내역**: 정산 예정/완료 내역
- **통계**: 일별/월별 거래액, 승인율 등
- **알림 설정**: 결제 완료, 환불 등 알림

### 5.2 알림 설정

1. **웹훅 설정**:
   ```
   대시보드 → 개발 정보 → 웹훅
   ```

2. **웹훅 URL 등록**:
   ```
   https://choncance.com/api/webhooks/toss-payments
   ```

3. **수신할 이벤트 선택**:
   - [x] 결제 승인
   - [x] 결제 취소
   - [x] 가상계좌 입금 완료
   - [x] 정산 완료

4. **웹훅 API 구현** (추후 작업):
   ```typescript
   // src/app/api/webhooks/toss-payments/route.ts
   export async function POST(request: Request) {
     const signature = request.headers.get('x-toss-signature');
     const body = await request.json();

     // 서명 검증
     // 이벤트 처리
     // 데이터베이스 업데이트
   }
   ```

---

## 💰 Step 6: 정산 설정

### 6.1 정산 주기 설정

**기본 정산 주기**: D+7 (거래일로부터 7일 후)

**변경 가능 옵션**:
- D+3 (추가 수수료 발생)
- D+1 (추가 수수료 발생)
- 월 1회 정산

### 6.2 수수료 확인

**기본 수수료**:
- 신용카드: 2.9% + VAT
- 계좌이체: 0.5% + VAT
- 가상계좌: 200원 + VAT

**예시 계산** (150,000원 결제):
```
거래액: 150,000원
수수료: 150,000 × 2.9% = 4,350원
VAT: 4,350 × 10% = 435원
총 수수료: 4,785원
실 정산액: 145,215원
```

### 6.3 세금계산서

- 매월 1일 이메일로 자동 발송
- 대시보드에서 다운로드 가능
- 전자세금계산서 형식

---

## 🔒 Step 7: 보안 강화

### 7.1 Secret Key 보호

**절대 금지**:
- ❌ 프론트엔드 코드에 노출
- ❌ Git에 커밋
- ❌ 로그에 출력
- ❌ 에러 메시지에 포함

**권장 사항**:
- ✅ 환경 변수로만 관리
- ✅ Secret Manager 사용
- ✅ 접근 권한 최소화
- ✅ 정기적 키 갱신 (6개월마다)

### 7.2 결제 요청 검증

```typescript
// 결제 금액 검증 (필수!)
if (requestAmount !== calculatedAmount) {
  throw new Error('Amount mismatch');
}

// 중복 결제 방지
const existingPayment = await checkDuplicatePayment(orderId);
if (existingPayment) {
  throw new Error('Duplicate payment');
}
```

### 7.3 IP 화이트리스트

토스페이먼츠 대시보드에서 설정:
```
개발 정보 → 보안 설정 → IP 화이트리스트
```

Cloud Run IP 추가:
```bash
# Cloud Run 서비스 IP 확인
gcloud run services describe choncance \
  --region=asia-northeast3 \
  --format="value(status.url)"
```

---

## 📞 지원 및 문의

### 토스페이먼츠 고객센터
- **전화**: 1544-7772 (평일 09:00-18:00)
- **이메일**: support@tosspayments.com
- **카카오톡**: @토스페이먼츠
- **문서**: https://docs.tosspayments.com/

### 긴급 상황 대응

1. **결제 오류 발생**:
   - 토스페이먼츠 고객센터 즉시 연락
   - 에러 로그 확인 및 공유
   - 임시로 결제 비활성화 고려

2. **대량 환불 요청**:
   - 사전에 토스페이먼츠에 알림
   - 정산 계좌 잔액 확인
   - 분산 처리 계획 수립

3. **보안 사고**:
   - Secret Key 즉시 재발급
   - 의심 거래 확인
   - 토스페이먼츠에 신고

---

## ✅ 최종 체크리스트

프로덕션 배포 전 확인:

### 가맹점 신청
- [ ] 사업자등록증 제출
- [ ] 정산 계좌 등록
- [ ] 심사 승인 완료
- [ ] 프로덕션 키 발급

### 환경 설정
- [ ] 프로덕션 키 환경 변수 설정
- [ ] Secret Manager 구성 (권장)
- [ ] 개발/프로덕션 환경 분리
- [ ] 키 백업 완료

### 기능 테스트
- [ ] 소액 결제 테스트 (100원)
- [ ] 결제 성공 플로우 확인
- [ ] 환불 플로우 테스트
- [ ] 이메일 알림 테스트
- [ ] 결제 실패 시나리오 테스트

### 모니터링
- [ ] 토스페이먼츠 대시보드 확인
- [ ] 웹훅 설정 (선택)
- [ ] 알림 설정
- [ ] 정산 내역 확인

### 보안
- [ ] Secret Key 안전 보관
- [ ] 프론트엔드에 노출 안 됨 확인
- [ ] 결제 금액 검증 로직 확인
- [ ] IP 화이트리스트 설정 (선택)

### 문서화
- [ ] 팀원에게 가이드 공유
- [ ] 긴급 연락처 정리
- [ ] 장애 대응 매뉴얼 작성

---

## 🚀 배포 후 모니터링

첫 1주일간 집중 모니터링:

### 매일 확인
- 결제 성공률
- 평균 결제 금액
- 환불율
- 에러 로그

### 주간 확인
- 정산 금액
- 수수료 내역
- 이상 거래 여부
- 고객 문의 사항

### 개선 사항
- 결제 UX 피드백 수집
- 결제 실패 원인 분석
- 프로세스 최적화

---

**축하합니다!** 🎉

이제 ChonCance에서 실제 결제를 받을 수 있습니다.
안전하고 원활한 결제 서비스를 제공하세요!
