# Story-004: 호스트 계정 등록

## [What] 요구사항

### User Story
- As a 사용자
- I want to 호스트로 계정을 등록하고 싶다
- So that 나의 숙소를 플랫폼에 등록하고 관리할 수 있다

### Acceptance Criteria (Gherkin)
- **Scenario 1: 성공적인 호스트 계정 등록 신청**
  - GIVEN 로그인한 일반 사용자가
  - WHEN "호스트 되기" 버튼을 클릭하고 필수 정보를 입력한 후 제출하면
  - THEN "호스트 계정 신청이 완료되었습니다. 관리자 승인 후 호스트 활동을 시작할 수 있습니다." 라는 메시지를 받는다
  - AND 사용자의 역할(role)은 "HOST_PENDING"으로 변경된다
  - AND 관리자에게 호스트 승인 요청 알림이 간다

- **Scenario 2: 필수 정보 누락**
  - GIVEN 호스트 등록 폼에서
  - WHEN 필수 정보를 입력하지 않고 제출하면
  - THEN 각 필드 아래에 에러 메시지가 표시된다

- **Scenario 3: 이미 호스트 계정인 경우**
  - GIVEN 이미 호스트 또는 호스트 승인 대기중인 사용자가
  - WHEN "호스트 되기" 페이지에 접근하면
  - THEN "이미 호스트이거나 승인 대기 중입니다." 라는 메시지를 표시한다

## [How] 기술 구현

### API Endpoints
- **Frontend -> Backend**
  - `POST /api/user/request-host`
    - **Request**: 호스트 등록에 필요한 추가 정보 (사업자 등록번호, 연락처 등)
    - **Response**: 성공 또는 실패 메시지

### Database Schema
- `User` 모델에 `role` 필드 추가 (Enum: `USER`, `HOST_PENDING`, `HOST`, `ADMIN`)
- `HostProfile` 모델 생성
  - `userId` (User와 1:1 관계)
  - `businessNumber` (사업자 등록번호)
  - `contact` (연락처)
  - `status` (Enum: `PENDING`, `APPROVED`, `REJECTED`)

### Coding Standards
- 사용자 역할(Role) 기반 접근 제어 (RBAC) 구현
- Zod를 사용한 폼 유효성 검사
- 개인정보는 암호화하여 저장

## [Tasks] 구현 작업

### Phase 1: Backend
- [ ] Prisma `User` 모델에 `role` Enum 필드 추가 및 마이그레이션
- [ ] `HostProfile` 모델을 Prisma 스키마에 추가 및 마이그레이션
- [ ] `/api/user/request-host` API 라우트 생성
- [ ] 호스트 신청 정보를 DB에 저장하는 로직 구현
- [ ] 관리자에게 알림을 보내는 기능 구현 (e.g., 이메일, DB 알림 테이블)

### Phase 2: Frontend
- [ ] "호스트 되기" 페이지 (`/become-a-host`) 생성
- [ ] 호스트 등록 폼 컴포넌트 생성 (사업자 등록번호, 연락처 등)
- [ ] 폼 제출 시 `/api/user/request-host` API 호출
- [ ] 신청 완료/실패에 따른 UI 피드백 처리
- [ ] 이미 호스트인 경우 접근을 막는 로직 구현

### Phase 3: Testing
- [ ] 호스트 등록 성공 케이스 테스트
- [ ] 필수 정보 누락 시 에러 처리 테스트
- [ ] 이미 호스트인 경우 접근 제한 테스트

## Definition of Done
- [ ] 모든 Acceptance Criteria 충족
- [ ] 코드 리뷰 완료 (백엔드, 프론트엔드)
- [ ] 모든 테스트 케이스 통과
- [ ] `STORY-TRACKER.md`에 상태 업데이트 (✅ 완료)
