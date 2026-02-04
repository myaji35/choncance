# VINTEE 성능 최적화 가이드

## 빌드 성공 ✅

프로덕션 빌드가 성공적으로 완료되었습니다.

### 빌드 일자
2025-11-10

## 성능 최적화 체크리스트

### ✅ 완료된 최적화

1. **코드 분할 (Code Splitting)**
   - Next.js App Router의 자동 코드 분할 활용
   - 각 라우트별로 독립적인 JavaScript 번들 생성

2. **이미지 최적화**
   - `next/image` 컴포넌트 사용으로 자동 최적화
   - WebP 포맷 자동 변환
   - Lazy loading 적용

3. **TypeScript 타입 체크**
   - 빌드 타임에 타입 에러 검증
   - Iterator 문제 수정 (qr-login-store.ts)

4. **Suspense 경계 설정**
   - `/admin/qr-verify` 페이지에 Suspense 추가
   - useSearchParams() 사용 시 적절한 Suspense 처리

### 🔄 권장 추가 최적화

#### 1. 이미지 최적화 강화
```bash
# Sharp 최적화 설정 확인 (이미 설치됨)
npm list sharp
```

**권장사항:**
- 모든 property 이미지를 WebP로 사전 변환
- Placeholder blur 이미지 생성
- 이미지 크기 최적화 (1920px 이하)

#### 2. 폰트 최적화
```typescript
// app/layout.tsx에서 이미 적용됨
import { GeistSans, GeistMono } from "geist/font";

// 추가 권장: font-display 설정
const geistSans = GeistSans({
  variable: "--font-geist-sans",
  display: "swap", // FOUT 방지
});
```

#### 3. 번들 크기 분석
```bash
# @next/bundle-analyzer 설치
npm install --save-dev @next/bundle-analyzer

# 번들 분석 실행
ANALYZE=true npm run build
```

#### 4. 캐싱 전략

**API 라우트:**
```typescript
// 예: /api/properties/route.ts
export const revalidate = 3600; // 1시간 캐시
```

**페이지:**
```typescript
// 예: /explore/page.tsx
export const revalidate = 60; // 1분 캐시
```

#### 5. Database Query 최적화

**Prisma 최적화:**
```typescript
// Include 최소화
const properties = await prisma.property.findMany({
  select: {
    id: true,
    name: true,
    pricePerNight: true,
    thumbnailUrl: true,
    // 필요한 필드만 선택
  },
  take: 20, // 페이지네이션
});

// Index 추가
// schema.prisma
model Property {
  @@index([status, province])
  @@index([pricePerNight])
}
```

#### 6. Static Generation 활용

**ISR (Incremental Static Regeneration):**
```typescript
// 자주 변경되지 않는 페이지에 적용
export const revalidate = 3600; // 1시간마다 재생성

// 또는 on-demand revalidation
// 예: 숙소 생성/수정 시 해당 페이지만 재생성
```

#### 7. Third-party Scripts 최적화

**Clerk 최적화:**
```typescript
// 이미 적용됨 - afterAuth 사용
import { ClerkProvider } from "@clerk/nextjs";
```

**Toss Payments:**
```typescript
// 필요한 페이지에서만 로드
if (typeof window !== "undefined") {
  import("@tosspayments/payment-sdk");
}
```

### 📊 Lighthouse 점수 목표

프로덕션 배포 후 측정 권장:

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+

### 🧪 성능 측정 방법

#### 1. 로컬 프로덕션 서버 실행
```bash
npm run build
npm run start
```

#### 2. Lighthouse CI 사용
```bash
npm install -g @lhci/cli

# 설정 파일 생성 (lighthouserc.js)
lhci autorun --collect.url=http://localhost:3000
```

#### 3. Chrome DevTools 사용
1. Chrome 개발자 도구 열기 (F12)
2. Lighthouse 탭 선택
3. "Analyze page load" 클릭

### 🔍 모니터링 권장사항

#### 프로덕션 모니터링
- Vercel Analytics 활성화
- Core Web Vitals 추적:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

#### Database 모니터링
- Prisma 쿼리 로깅 활성화
- Slow query 식별 및 최적화

### 📦 번들 크기 최적화

#### Tree Shaking 확인
```bash
# 사용하지 않는 코드 제거 확인
npm run build -- --debug
```

#### Dynamic Imports
```typescript
// 큰 라이브러리는 동적 import
const QRCode = dynamic(() => import("qrcode"), { ssr: false });
```

### 🚀 배포 전 체크리스트

- [ ] 프로덕션 빌드 성공 확인 ✅
- [ ] 모든 환경 변수 설정 확인
- [ ] 이미지 최적화 완료
- [ ] Database 인덱스 설정
- [ ] Error boundary 설정
- [ ] Logging 설정
- [ ] Rate limiting 설정 (API)
- [ ] CORS 설정 확인
- [ ] Security headers 설정

### 📝 성능 이슈 트래킹

| 이슈 | 상태 | 우선순위 | 비고 |
|------|------|---------|------|
| QR Login Store Iterator | ✅ 해결 | High | Array.from() 사용 |
| useSearchParams Suspense | ✅ 해결 | High | Suspense 추가 |
| Database 연결 오류 (테스트) | ⚠️ 진행중 | Medium | 환경 변수 확인 필요 |

### 🔗 참고 자료

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Web.dev - Performance](https://web.dev/performance/)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**마지막 업데이트**: 2025-11-10
**작성자**: Claude Code
