# Gap Detector Memory

## Project: VINTEE (빈티)

### Key Patterns Discovered

1. **Dual Component Folders (RESOLVED)**: `src/components/reviews/` 디렉토리가 삭제됨. `src/components/review/`만 존재.

2. **SSR vs API Pattern**: 이 프로젝트는 호스트 페이지(host/reviews)에서 API 라우트 대신 Server Component에서 직접 Prisma 쿼리를 실행하는 패턴 사용. 설계서의 API 엔드포인트가 SSR로 대체되는 경우가 있음. 이는 프로젝트 패턴이므로 WARNING으로 처리.

3. **Auth Helper**: `@/lib/supabase/auth-helpers` (getUser) 및 `@/lib/auth-utils` (requireHost, getCurrentUser) 두 가지 인증 방식 혼재. API 라우트에서는 getUser, 호스트 페이지에서는 requireHost+getCurrentUser 사용.

4. **Validation/Utility Pattern**: 리뷰 시스템에서 `src/lib/validations/review.ts` + `src/lib/utils/review.ts` 패턴으로 분리 완료. 향후 다른 기능에서도 동일 패턴 적용 예상.

5. **Inline Star Rating**: StarRating이 독립 컴포넌트 대신 review-form.tsx 내부 인라인으로 구현됨. P2 수준 잔여 갭.

### Analysis Results

#### 리뷰-시스템 (2026-03-01)
- v1.0 Match Rate: 72% -> v2.0 Match Rate: **93%** (Act-1 후)
- P0 Critical Gaps: 모두 해결 (6/6)
- Remaining: 페이지네이션(P1), UI 텍스트 불일치(P1), StarRating 분리(P2)
- Report: `docs/03-analysis/리뷰-시스템.analysis.md`
- Status: **Check 통과** (93% >= 90%)
