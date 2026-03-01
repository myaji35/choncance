# [Plan] VINTEE UI/UX 전면 리디자인 + Vultr 배포

**Feature**: ui-redesign
**Phase**: Plan
**Date**: 2026-03-01
**Author**: Claude Sonnet 4.6 + 조준범 대표님

---

## 1. 목표 (Objective)

### 1.1 핵심 목표
기존 테라코타/베이지 팔레트 기반의 VINTEE UI를 **모던 미니멀** 디자인 시스템으로 전면 교체하고,
Vercel 대신 **Vultr VPS + PM2 클러스터**로 배포 인프라를 이전한다.

### 1.2 비즈니스 목표
- MZ세대 타겟 감성 강화 (농촌 → 힙한 농촌)
- 모바일 first 경험 개선
- 자체 서버 운영으로 비용 최적화

---

## 2. 스코프 (Scope)

### 2.1 UI/UX 리디자인 대상

| 영역 | 파일 | 우선순위 |
|------|------|---------|
| 글로벌 레이아웃 | `globals.css`, `layout.tsx`, `SiteHeader` | P0 |
| 랜딩 페이지 | `app/page.tsx` | P0 |
| 탐색 페이지 | `app/explore/page.tsx`, `FilterSidebar`, `PropertyCard` | P0 |
| 숙소 상세 | `app/property/[id]/page.tsx`, `PropertyGallery`, `BookingWidget` | P1 |
| 예약 플로우 | `checkout`, `success`, `fail` | P1 |
| 호스트 대시보드 | `app/host/dashboard`, `PropertyForm` | P2 |
| 인증 페이지 | Clerk SignIn/SignUp 커스터마이징 | P2 |

### 2.2 배포 인프라 구성

| 구성요소 | 스펙 |
|---------|------|
| VPS | Vultr Cloud Compute 2 vCPU / 4GB RAM |
| OS | Ubuntu 22.04 LTS |
| Runtime | Node.js 20.x LTS |
| Process Manager | PM2 cluster mode (2 instances) |
| Reverse Proxy | Nginx + Certbot SSL |
| Domain | 대표님 도메인 연결 |

---

## 3. 디자인 시스템 (Design System)

### 3.1 컬러 팔레트

```css
/* Primary Colors */
--color-primary: #1A1A1A;      /* Almost Black - 메인 텍스트, 헤더 */
--color-secondary: #F7F7F7;    /* Almost White - 배경 */
--color-accent: #FF6B35;       /* Orange - CTA, 강조, 호버 */

/* Neutral Scale */
--color-gray-100: #F7F7F7;
--color-gray-200: #EBEBEB;
--color-gray-300: #D4D4D4;
--color-gray-500: #737373;
--color-gray-700: #404040;
--color-gray-900: #1A1A1A;

/* Semantic */
--color-success: #22C55E;
--color-error: #EF4444;
--color-warning: #F59E0B;
```

### 3.2 타이포그래피

```css
/* Font Scale */
--font-display: "Pretendard", sans-serif;  /* 한국어 최적화 */
--font-body: "Pretendard", sans-serif;

/* Size Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 2rem;      /* 32px */
--text-4xl: 2.5rem;    /* 40px */
--text-5xl: 3.5rem;    /* 56px - Hero */

/* Weight */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;     /* Bold Hero 텍스트 */
```

### 3.3 스페이싱 & 레이아웃

```css
/* Grid */
--container-max: 1280px;
--container-padding: 1.5rem;  /* Mobile */
--container-padding-lg: 3rem; /* Desktop */

/* Spacing Scale (8px base) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */

/* Border Radius */
--radius-sm: 0.25rem;   /* 4px - 태그, 배지 */
--radius-md: 0.5rem;    /* 8px - 버튼, 인풋 */
--radius-lg: 1rem;      /* 16px - 카드 */
--radius-xl: 1.5rem;    /* 24px - 모달, 큰 카드 */
--radius-full: 9999px;  /* 알약형 버튼 */
```

### 3.4 컴포넌트 스타일 가이드

**버튼**:
- Primary: `bg-[#1A1A1A] text-white hover:bg-[#FF6B35]`
- Secondary: `border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white`
- Accent: `bg-[#FF6B35] text-white hover:bg-[#E55A25]`
- Ghost: `text-[#737373] hover:text-[#1A1A1A]`

**카드**:
- 기본: `bg-white border border-[#EBEBEB] rounded-xl overflow-hidden`
- 호버: `hover:shadow-lg hover:shadow-black/5 transition-all duration-200`
- 이미지: `aspect-[4/3]` 고정 비율

**헤더**:
- 배경: `bg-white/95 backdrop-blur-sm border-b border-[#EBEBEB]`
- 로고: Bold black, 미니멀
- 높이: `h-16`

---

## 4. 페이지별 리디자인 방향

### 4.1 랜딩 페이지 (`/`)

```
[Hero Section]
- 풀스크린 배경 이미지 (농촌 고퀄리티 사진)
- 오버레이: gradient-to-b from-transparent to-black/60
- 중앙 텍스트: "촌캉스, 새롭게 발견하다" (Bold 900, text-5xl)
- 서브텍스트: "#논뷰맛집 #불멍과별멍" 해시태그
- CTA 버튼: "지금 탐색하기" (주황 accent)

[Theme Discovery]
- 수평 스크롤 태그 필터
- 아이콘 + 텍스트 카드 (흑백 아이콘, 깔끔)

[Featured Properties]
- 3열 그리드 (모바일 1열, 태블릿 2열)
- 심플 카드 디자인

[How It Works]
- 3단계 설명 (숫자 강조)
- 최소 텍스트
```

### 4.2 탐색 페이지 (`/explore`)

```
[검색 헤더]
- 스티키 헤더
- 검색바 + 필터 버튼 인라인
- 태그 수평 스크롤

[숙소 그리드]
- 2열 (모바일), 3열 (태블릿), 4열 (데스크탑)
- Masonry-like 레이아웃 (이미지 높이 다양)
- 카드: 이미지 (4:3), 태그, 이름, 가격, 평점

[필터 사이드바]
- 드로어 방식 (모바일)
- 인라인 (데스크탑 768px+)
```

### 4.3 숙소 상세 (`/property/[id]`)

```
[갤러리]
- 1:1 메인 + 2x2 그리드 (에어비앤비 스타일)
- 클릭 시 전체화면 슬라이더

[콘텐츠]
- 좌: 숙소 정보 (스토리, 태그, 편의시설)
- 우: BookingWidget (스티키)

[리뷰]
- 별점 요약 바
- 리뷰 카드 그리드
```

---

## 5. 배포 전략 (Vultr PM2)

### 5.1 Vultr VPS 설정

```bash
# 서버 스펙
Region: Seoul (KR) 또는 Singapore
Plan: 2 vCPU / 4GB RAM / 80GB SSD
OS: Ubuntu 22.04 LTS
Monthly: ~$24
```

### 5.2 배포 스택

```
인터넷 → Nginx (80/443) → PM2 App (3010/3011) → Next.js
                          ↕
                     PostgreSQL (포트 5432)
```

### 5.3 배포 프로세스

```bash
# 1. 서버 초기화
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx

# 2. PM2 설치
npm install -g pm2

# 3. 앱 배포
git clone <repo> /var/www/vintee
cd /var/www/vintee
npm install
npx prisma generate
npm run build

# 4. PM2 실행
pm2 start ecosystem.config.js
pm2 startup systemd
pm2 save

# 5. Nginx 설정
# /etc/nginx/sites-available/vintee
# SSL: certbot --nginx -d vintee.kr

# 6. GitHub Actions CI/CD (자동 배포)
```

---

## 6. 구현 우선순위 (Sprint)

### Sprint 1: 디자인 시스템 기반 (P0)
- [ ] CSS 변수 리셋 (globals.css)
- [ ] Pretendard 폰트 적용
- [ ] SiteHeader 리디자인
- [ ] 기본 컴포넌트 스타일 업데이트 (Button, Card, Input)

### Sprint 2: 핵심 페이지 (P0)
- [ ] 랜딩 페이지 전면 리디자인
- [ ] PropertyCard 리디자인
- [ ] Explore 페이지 레이아웃

### Sprint 3: 상세 & 예약 (P1)
- [ ] 숙소 상세 페이지
- [ ] BookingWidget 리디자인
- [ ] 체크아웃 플로우

### Sprint 4: 배포 (P1)
- [ ] ecosystem.config.js 작성
- [ ] Nginx 설정 파일
- [ ] GitHub Actions 워크플로우
- [ ] Vultr 배포 스크립트

---

## 7. 기술적 고려사항

### 7.1 Pretendard 폰트 로딩
```typescript
// next/font/local 사용 (성능 최적화)
import localFont from "next/font/local";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
});
```

### 7.2 Tailwind 커스터마이징
```typescript
// tailwind.config.ts 확장
theme: {
  extend: {
    colors: {
      primary: "#1A1A1A",
      secondary: "#F7F7F7",
      accent: "#FF6B35",
    },
    fontFamily: {
      pretendard: ["var(--font-pretendard)"],
    },
  },
}
```

### 7.3 애니메이션 & 트랜지션
- Framer Motion 대신 **CSS transition** 사용 (번들 크기 최소화)
- `transition-all duration-200 ease-out` 기본값

---

## 8. 성공 기준 (Definition of Done)

- [ ] 모든 페이지 새 디자인 시스템 적용
- [ ] Lighthouse Performance 90+ 유지
- [ ] 모바일 반응형 정상 작동 (320px ~ 1280px)
- [ ] Vultr 서버에서 PM2 정상 실행
- [ ] SSL 인증서 적용 완료
- [ ] GitHub Actions CI/CD 자동 배포 설정

---

**다음 단계**: `/pdca design ui-redesign`
