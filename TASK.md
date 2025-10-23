Task Breakdown: ChonCance (MVP)
W1: 프로젝트 기획 및 설계
환경 설정
[ ] create-next-app으로 Next.js 14 프로젝트 생성

[ ] Tailwind CSS 및 shadcn/ui 초기 설정

[ ] ESLint, Prettier 코드 포맷팅 설정

[ ] Vercel 프로젝트 생성 및 Git 저장소 연결

데이터베이스 (PostgreSQL + Prisma)
[ ] Vercel Postgres 데이터베이스 생성 및 연결

[ ] schema.prisma 파일 작성

[ ] User (여행객), Host (공급자) 모델

[ ] Property (숙소), Experience (체험) 모델

[ ] Booking (예약), Review (후기) 모델

[ ] Tag (필터링용), Theme (큐레이션용) 모델

[ ] prisma migrate dev로 DB 스키마 초기화

W2: 사용자 인증 및 기본 UI
인증 (NextAuth.js)
[ ] next-auth 설치 및 authOptions 설정

[ ] 카카오, 구글 OAuth Provider 설정

[ ] Prisma Adapter 연동

[ ] 로그인/회원가입 페이지 UI 구현

[ ] middleware.ts를 통한 인증 기반 라우트 보호 설정

공통 UI
[ ] Header 컴포넌트 (로고, 검색, 로그인/프로필)

[ ] Footer 컴포넌트

[ ] PropertyCard 컴포넌트 (숙소 목록용)

[ ] ExperienceCard 컴포넌트 (체험 목록용)

W3-4: 핵심 기능 - 탐색 및 상세 정보
API (Server Actions)
[ ] 테마별 숙소/체험 목록 조회 Action

[ ] 태그 필터링 기반 숙소/체험 검색 Action

[ ] 숙소/체험 상세 정보 조회 Action

[ ] 호스트 프로필 정보 조회 Action

UI (Frontend)
[ ] 메인 페이지 (/)

[ ] 히어로 섹션 (감성 비주얼)

[ ] 테마별 큐레이션 목록 UI 구현 (#논뷰맛집 등) [1]

[ ] 탐색 페이지 (/explore)

[ ] 검색 바 및 태그 필터 UI 구현 (#장작패기 등) [1]

[ ] 검색 결과 그리드 레이아웃 구현

[ ] 상세 페이지 (/property/[id])

[ ] 이미지 캐러셀 또는 그리드 UI

[ ] 호스트 스토리, 숙소 소개 등 텍스트 콘텐츠 섹션

[ ] 제공되는 체험, '촌캉스 소품' 정보 섹션 [1]

[ ] '느리고 불편한 매력' 안내 섹션 [1]

[ ] 예약 정보 (가격, 가능 날짜) 사이드바

W5: 예약 시스템 및 커뮤니티 기능
API (Server Actions)
[ ] 특정 날짜 예약 가능 여부 확인 Action

[ ] 신규 예약 생성 Action

[ ] 사용자별 예약 목록 조회 Action

[ ] 찜하기 추가/삭제 Action

[ ] 사진 포함 후기 생성 Action

UI (Frontend)
[ ] 예약 기능

[ ] react-day-picker를 활용한 날짜 선택 캘린더 구현

[ ] 예약 정보 확인 및 결제 페이지 UI (결제는 Mock 처리)

[ ] 커뮤니티 기능

[ ] Toast를 활용한 찜하기 성공/취소 피드백

[ ] 마이페이지 (/me)

[ ] 내 찜 목록 조회 UI

[ ] 내 예약 내역 조회 UI

[ ] 후기 기능 (상세 페이지 내)

[ ] 이미지 업로드 기능이 포함된 후기 작성 Form

[ ] 사진 중심의 후기 목록 UI

W6: 테스트, 최적화 및 배포
[ ] (Test) Cypress 또는 Playwright를 이용한 E2E 테스트 작성 (회원가입 → 탐색 → 예약)

[ ] (Optimize) next/image를 활용한 이미지 최적화 점검

[ ] (Optimize) Lighthouse 점수를 통한 성능 측정 및 개선

[ ] (Polish) 모든 페이지에 대한 모바일 반응형 디자인 최종 검수

[ ] (Deploy) Vercel Production 환경 변수 설정

[ ] (Deploy) main 브랜치 Push를 통한 프로덕션 배포 및 최종 기능 테스트@