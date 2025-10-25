# Story-003: 카카오 소셜 로그인

## [What] 요구사항

### User Story
- As a 사용자
- I want to 카카오 계정으로 간편하게 로그인하고 싶다
- So that 별도의 회원가입 절차 없이 빠르게 서비스를 이용할 수 있다

### Acceptance Criteria (Gherkin)
- **Scenario 1: 성공적인 카카오 로그인**
  - GIVEN 사용자가 로그인 페이지에 접속했을 때
  - WHEN "카카오로 로그인" 버튼을 클릭하면
  - THEN 카카오 로그인 페이지로 리디렉션된다
  - AND 카카오 계정으로 인증 후, 서비스에 자동으로 로그인된다
  - AND 사용자의 카카오 프로필 정보(닉네임, 프로필 사진)가 연동된다

- **Scenario 2: 카카오 로그인 실패 (인증 거부)**
  - GIVEN 사용자가 카카오 로그인 페이지에서
  - WHEN "취소" 또는 동의 항목을 거부하면
  - THEN 에러 메시지와 함께 로그인 페이지로 돌아온다

- **Scenario 3: 이미 이메일로 가입된 계정이 있는 경우**
  - GIVEN 사용자가 카카오 계정 이메일과 동일한 이메일로 이미 가입했을 때
  - WHEN 카카오 로그인을 시도하면
  - THEN "이미 가입된 이메일입니다. 기존 계정에 연결하시겠습니까?" 라는 메시지를 표시하고, 연결 또는 취소 옵션을 제공한다

## [How] 기술 구현

### API Endpoints
- **Frontend -> Backend**
  - `POST /api/auth/kakao/callback`
    - **Request**: 카카오에서 받은 인증 코드를 전송
    - **Response**: 로그인 성공 시 JWT 토큰, 실패 시 에러 메시지

### Database Schema
- `User` 테이블에 `kakaoId` (string, unique) 필드 추가
- `User` 테이블에 `provider` (string, default 'email') 필드 추가

### Coding Standards
- **NextAuth.js** Kakao Provider 사용
- **OAuth 2.0** 인증 프로토콜 준수
- 카카오 API 키는 `.env.local` 파일에 환경변수로 관리 (KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET)
- 로그인 성공 후 세션 관리는 NextAuth의 기본 세션 핸들러 사용

## [Tasks] 구현 작업

### Phase 1: Backend (NextAuth 설정)
- [ ] `next-auth` 라이브러리 설치
- [ ] `.env.local` 파일에 카카오 API 키 추가
- [ ] `src/app/api/auth/[...nextauth]/route.ts` 파일 생성
- [ ] NextAuth 설정에 Kakao Provider 추가
- [ ] Prisma `User` 모델에 `kakaoId` 및 `provider` 필드 추가 및 마이그레이션
- [ ] Kakao 로그인 시 사용자 정보를 DB에 저장/업데이트하는 로직 구현

### Phase 2: Frontend (UI 구현)
- [ ] 로그인 페이지 (`src/app/login/page.tsx`)에 "카카오로 로그인" 버튼 추가
- [ ] 버튼 클릭 시 `signIn('kakao')` 함수 호출
- [ ] 로그인 성공/실패에 따른 UI 피드백 처리 (e.g., 리디렉션, 토스트 메시지)
- [ ] 헤더에 사용자 프로필 사진 및 닉네임 표시 (카카오 정보 연동)

### Phase 3: Testing
- [ ] 카카오 로그인 성공 케이스 테스트
- [ ] 카카오 로그인 취소 케이스 테스트
- [ ] 동일 이메일 계정 존재 시 연결 로직 테스트
- [ ] E2E 테스트 (Cypress 또는 Playwright)

## Definition of Done
- [ ] 모든 Acceptance Criteria 충족
- [ ] 코드 리뷰 완료 (백엔드, 프론트엔드)
- [ ] 모든 테스트 케이스 통과
- [ ] `STORY-TRACKER.md`에 상태 업데이트 (✅ 완료)
