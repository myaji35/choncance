# [PLAN] ChonCance Rails 8 Migration (BMAD Style)

## 0. 개요 (Overview)
현재 **Python(FastAPI) + Next.js + Supabase**로 구성된 분산 아키텍처를 **Rails 8 (Majestic Monolith)**로 통합하여 개발 속도, 유지보수 효율, 그리고 서비스 완성도를 극대화합니다.

## 1. 핵심 기술 스택 (Tech Stack)
*   **Framework**: Ruby on Rails 8.0
*   **Frontend**: Hotwire (Turbo / Stimulus) + Tailwind CSS
*   **Database**: SQLite3 (Rails 8 Default: Production-ready with Solid Cache/Queue)
*   **Infrastructure**: Kamal (Docker-based self-hosting on Vultr)
*   **Background Jobs**: Solid Queue (Rails 8 Default)
*   **Cache**: Solid Cache / Redis

## 2. 주요 아키텍처 변경점
| 기능 | 현재 방식 | Rails 8 전환 방식 |
| :--- | :--- | :--- |
| **Database** | PostgreSQL | SQLite3 (Rails 8 Native Optimization) |
| **Authentication** | NextAuth + Supabase | Rails 8 Built-in Authentication (No Devise) |
| **Frontend UI** | Next.js (React) | Rails Views (ERB) + Hotwire Turbo Frames |
| **State Management** | React State | Hotwire Morphing & Turbo Streams |
| **Background Job** | - | Solid Queue (예약 알림, 이미지 최적화) |
| **Deployment** | Vercel + GCP | Kamal (Vultr VPS 단일 배포) |
| **Payment** | Toss API (Client-side) | Toss API (Server-side Service Object) |

## 3. 데이터 모델 설계 (ActiveRecord)
*   **User**: Email, Password (hashed), Name, Phone, Role (Guest/Host).
*   **Property**: Title, Story, Location (PostGIS/Native), Price, Themes (HABTM).
*   **Booking**: User, Property, Dates, Status, TotalPrice.
*   **Review**: Booking, Rating, Content.
*   **Tag/Theme**: Name, Icon, Category.

## 4. UI/UX 전략 (K-Minimalism)
*   **Design System**: Tailwind CSS v4 기반 표준 유틸리티 사용.
*   **Esthetics**: `rounded-2xl`, `shadow-sm`, `bg-slate-50`, `text-slate-900`.
*   **Brand Color**: Primary `bg-green-700` (NuriFarm 시너지).
*   **Interaction**: Turbo Frames를 활용하여 페이지 전환 없이 테마 큐레이션 탐색 가능.

## 5. 단계별 실행 로드맵 (Roadmap)
### Phase 1: Foundation (1주차)
- [ ] Rails 8 앱 초기화 및 PostgreSQL 설정.
- [ ] UI 레이아웃 구축 (NavBar, Global Search, Layout System).
- [ ] 회원가입/로그인 (Built-in Auth) 구현.

### Phase 2: Core Business (2주차)
- [ ] 숙소(Property) 등록 및 테마 큐레이션 엔진 구현.
- [ ] 예약(Booking) 및 달력 가용성 로직 구현.
- [ ] 호스트 대시보드 (ViewComponents 기반) 구축.

### Phase 3: Integration & Polish (3주차)
- [ ] Toss Payments 서버 사이드 연동.
- [ ] 카카오 알림톡 (Solid Queue 기반) 연동.
- [ ] 이미지 최적화 (WebP) 파이프라인 구축.

### Phase 4: Deployment (4주차)
- [ ] Vultr VPS 셋업.
- [ ] Kamal 배포 스크립트 작성 및 첫 배포.
- [ ] LangSmith 트래킹 및 모니터링 연동.

---
대표님, 이 계획안은 **"파편화된 인프라를 하나로 모으고, 서비스의 본질(MZ 큐레이션)에만 집중할 수 있는 환경"**을 만드는 데 목적이 있습니다. 승인해 주시면 즉시 Phase 1 작업에 착수하겠습니다.
