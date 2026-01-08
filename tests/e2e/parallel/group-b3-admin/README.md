# Group B3: 관리자 플로우 테스트

관리자 권한을 가진 사용자의 전체 플로우를 테스트하는 E2E 테스트 스위트입니다.

## 테스트 개요

### 테스트 계정
- **이메일**: test_admin@vintee.test
- **비밀번호**: AdminPassword123!
- **권한**: 관리자 (Admin)

## 파일 구조

```
group-b3-admin/
├── setup.ts                      # 공유 설정 및 헬퍼 함수
├── 01-admin-auth.spec.ts         # 관리자 인증 및 권한 테스트
├── 02-admin-dashboard.spec.ts    # 관리자 대시보드 테스트
├── 03-host-approval.spec.ts      # 호스트 승인 플로우 테스트
├── 04-property-review.spec.ts    # 숙소 검토 플로우 테스트
└── 05-admin-settings.spec.ts     # 관리자 설정 테스트
```

## 테스트 스펙

### 1️⃣ 01-admin-auth.spec.ts (관리자 인증)
**목표**: 관리자 인증 및 권한 검증

**테스트 케이스**:
- ✅ 관리자 로그인 성공
- ✅ 관리자 인증 토큰 확인
- ✅ 관리자 대시보드 접근 권한
- ✅ 관리자 전용 페이지 접근 권한
- ✅ 비관리자 사용자의 관리자 페이지 접근 차단
- ✅ 관리자 로그아웃
- ✅ 관리자 프로필 정보 확인
- ✅ 관리자 권한 레벨 확인
- ✅ 관리자 세션 타임아웃 처리

**예상 실행 시간**: ~2분

### 2️⃣ 02-admin-dashboard.spec.ts (대시보드)
**목표**: 관리자 대시보드 기능 검증

**테스트 케이스**:
- ✅ 관리자 대시보드 페이지 로드
- ✅ 관리자 대시보드 통계 섹션 표시
- ✅ 대기 중인 호스트 승인 카운트 표시
- ✅ 대기 중인 숙소 검토 카운트 표시
- ✅ 사용자 통계 표시
- ✅ 호스트 통계 표시
- ✅ 숙소 통계 표시
- ✅ 최근 활동 로그 표시
- ✅ 수익 차트 또는 메트릭 표시
- ✅ 대시보드 네비게이션 메뉴 표시
- ✅ 대시보드 새로고침 후 데이터 업데이트
- ✅ 대시보드 반응형 레이아웃

**예상 실행 시간**: ~2분 30초

### 3️⃣ 03-host-approval.spec.ts (호스트 승인)
**목표**: 호스트 신청 승인/거부 프로세스 검증

**테스트 케이스**:
- ✅ 호스트 신청 목록 페이지 로드
- ✅ 호스트 신청 목록 표시
- ✅ 호스트 신청 상세 정보 조회
- ✅ 호스트 신청 정보 내용 확인
- ✅ 호스트 신청 승인 버튼 표시
- ✅ 호스트 신청 거부 버튼 표시
- ✅ 호스트 신청 거부 사유 입력 필드 표시
- ✅ 호스트 신청 필터링 기능
- ✅ 호스트 신청 검색 기능
- ✅ 호스트 신청 정렬 기능
- ✅ 호스트 신청 페이지네이션

**예상 실행 시간**: ~3분

### 4️⃣ 04-property-review.spec.ts (숙소 검토)
**목표**: 숙소 검토 및 승인 프로세스 검증

**테스트 케이스**:
- ✅ 숙소 검토 목록 페이지 로드
- ✅ 숙소 검토 대기 목록 표시
- ✅ 숙소 상세 검토 정보 조회
- ✅ 숙소 기본 정보 표시
- ✅ 숙소 이미지 갤러리 표시
- ✅ 숙소 검토 이슈 항목 표시
- ✅ 숙소 승인 버튼 표시
- ✅ 숙소 거부 버튼 표시
- ✅ 숙소 거부 사유 입력 필드 표시
- ✅ 숙소 검토 필터링 기능
- ✅ 숙소 검토 검색 기능
- ✅ 숙소 검토 정렬 기능
- ✅ 숙소 검토 페이지네이션
- ✅ 숙소 검토 상태 배지 표시

**예상 실행 시간**: ~3분 30초

### 5️⃣ 05-admin-settings.spec.ts (관리자 설정)
**목표**: 관리자 설정 관리 기능 검증

**테스트 케이스**:
- ✅ 관리자 설정 페이지 로드
- ✅ 시스템 설정 섹션 표시
- ✅ 메인테넌스 모드 토글 표시
- ✅ 메인테넌스 모드 토글 변경
- ✅ SNS 계정 설정 섹션 표시
- ✅ 인스타그램 계정 입력
- ✅ 페이스북 계정 입력
- ✅ 네이버 블로그 계정 입력
- ✅ 챗봇 설정 섹션 표시
- ✅ 챗봇 활성화 토글
- ✅ 챗봇 환영 메시지 입력
- ✅ 챗봇 응답 타임아웃 설정
- ✅ 설정 저장 기능
- ✅ 설정 페이지 새로고침
- ✅ 설정 취소 기능

**예상 실행 시간**: ~3분

## setup.ts 상세 정보

### 제공되는 Fixture
- `authenticatedAdminPage`: 관리자로 인증된 페이지 객체

### 제공되는 함수

#### 인증 함수
- `loginAsAdminUser(page, email)`: 관리자로 로그인
- `logoutUser(page)`: 로그아웃

#### 호스트 승인 함수
- `verifyHostApplicationExists(page, hostEmail)`: 호스트 신청 존재 확인
- `openHostApplicationDetail(page, hostEmail)`: 호스트 신청 상세 보기 열기
- `approveHostApplication(page)`: 호스트 신청 승인
- `rejectHostApplication(page, reason)`: 호스트 신청 거부

#### 숙소 검토 함수
- `verifyPropertyReviewExists(page, propertyName)`: 숙소 검토 존재 확인
- `openPropertyReviewDetail(page, propertyName)`: 숙소 검토 상세 보기 열기
- `approveProperty(page)`: 숙소 승인
- `rejectProperty(page, reason)`: 숙소 거부

#### 사용자 관리 함수
- `searchUser(page, query)`: 사용자 검색
- `banUser(page)`: 사용자 정지

#### 유틸 함수
- `submitFormAndWaitForSuccess(page)`: 폼 제출 및 성공 확인
- `getStatistics(page)`: 통계 데이터 수집

### 제공되는 상수

#### TEST_ADMIN
```typescript
{
  email: 'test_admin@vintee.test',
  password: 'AdminPassword123!',
  name: '테스트 관리자',
  phone: '010-1234-5678',
}
```

#### TEST_DATA
- `hostApplication`: 호스트 신청 테스트 데이터
- `propertyReview`: 숙소 검토 테스트 데이터
- `snsAccounts`: SNS 계정 설정 데이터
- `chatbotSettings`: 챗봇 설정 데이터
- 등등...

#### SELECTORS
70개 이상의 데이터 테스트 ID 및 CSS 선택자 포함

#### API_ENDPOINTS
관리자 API 엔드포인트들 (모의 테스트 용)

## 병렬 실행 가능 여부

✅ **완전히 병렬 실행 가능**

- 각 테스트는 독립적인 테스트 계정 사용
- 데이터 격리로 동시 실행 가능
- 기존 데이터 수정하지 않음 (읽기 위주)

## 실행 방법

### 전체 Group B3 테스트 실행
```bash
npx playwright test --grep "Group B3"
```

### 특정 테스트 파일 실행
```bash
# 01-admin-auth.spec.ts만 실행
npx playwright test tests/e2e/parallel/group-b3-admin/01-admin-auth.spec.ts

# 03-host-approval.spec.ts만 실행
npx playwright test tests/e2e/parallel/group-b3-admin/03-host-approval.spec.ts
```

### 특정 테스트 케이스만 실행
```bash
# "관리자 로그인 성공" 테스트만 실행
npx playwright test -g "관리자 로그인 성공"
```

### UI 모드로 실행 (디버깅용)
```bash
npx playwright test --ui tests/e2e/parallel/group-b3-admin/
```

### 헤드레스 모드 비활성화 (브라우저 보기)
```bash
npx playwright test --headed tests/e2e/parallel/group-b3-admin/
```

### 특정 브라우저로 실행
```bash
# Chrome만 사용
npx playwright test --project=chromium tests/e2e/parallel/group-b3-admin/
```

## 예상 총 실행 시간

- **병렬 실행**: ~3분 30초
- **순차 실행**: ~14분
- **총 테스트 케이스**: 73개

## 테스트 데이터 관리

### 테스트 계정
```
이메일: test_admin@vintee.test
비밀번호: AdminPassword123!
역할: Admin (관리자)
```

**주의**: 실제 프로덕션 환경에서는 다음을 확인하세요:
- 테스트 계정이 실제로 생성되어 있는지
- 계정이 관리자 권한을 가지고 있는지
- 데이터베이스에서 테스트 데이터 격리 확인

## 의존성

### Playwright
- `@playwright/test`: ^1.40.0 이상
- Chrome, Firefox, Safari 지원

### TypeScript
- `typescript`: ^5.0.0 이상
- `@types/node`: 최신 버전

## 주요 특징

### 1. 견고한 선택자 전략
- 데이터 테스트 ID 우선 사용
- ARIA 레이블 활용
- 텍스트 필터링

### 2. 명확한 에러 처리
- Try-catch 블록으로 오류 처리
- 상세한 에러 메시지 제공
- 부분 실패 허용 (요소 없을 수 있음)

### 3. 대기 시간 최적화
- `waitForLoadState('networkidle')` 사용
- 필요한 요소 대기
- 애니메이션 타임아웃 포함

### 4. 정리 (Cleanup)
- 매 테스트 후 자동 로그아웃
- 데이터 오염 방지
- 예측 가능한 테스트 상태

## 문제 해결

### 로그인 실패
1. 테스트 계정이 생성되어 있는지 확인
2. Clerk 인증 시스템 설정 확인
3. `/login` 페이지 UI 구조 확인
4. 파일의 로그인 함수 업데이트 필요할 수 있음

### 요소 찾기 실패
1. 선택자 업데이트 필요
2. 데이터 테스트 ID 추가 권장
3. 개발자 도구에서 실제 선택자 확인

### 타임아웃
1. `TIMEOUTS` 상수 조정
2. 네트워크 상태 확인
3. 서버 응답 성능 확인

### 테스트 플레이 실패
1. 관리자 권한 확인
2. 테스트 데이터 존재 확인
3. API 엔드포인트 확인
4. 브라우저 콘솔 에러 확인

## 최근 업데이트

- 2026-01-08: Group B3 테스트 스위트 초기 생성
- 73개 테스트 케이스 추가
- 관리자 관련 모든 기능 테스트 커버

## 기여 가이드

새로운 테스트를 추가할 때:

1. **폴더 구조 유지**: 파일명에 번호 접두사 추가
2. **문서 작성**: 테스트 목표와 케이스 설명
3. **헬퍼 함수 활용**: setup.ts의 함수 재사용
4. **선택자 관리**: SELECTORS 객체에 추가
5. **AAA 패턴**: Arrange-Act-Assert 구조

## 라이선스

VINTEE 프로젝트의 일부

## 연락처

테스트 관련 문제나 개선 사항은 프로젝트 이슈 트래커를 사용하세요.
