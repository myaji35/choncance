# Analysis: GEO 최적화 (Gap Analysis v2)

**Feature**: GEO-최적화
**Phase**: Check (Analysis)
**Date**: 2026-04-07 (재실행)
**Analyst**: bkit-gap-detector
**Plan**: `docs/01-plan/features/GEO-최적화.plan.md`
**Design**: `docs/02-design/features/GEO-최적화.design.md`

---

## 1. 재평가 개요

| 항목 | v1 (첫 분석) | v2 (재실행) | 변화 |
|---|:---:|:---:|:---:|
| 총 요구사항 | 27 | 27 | - |
| Complete | 24 | **27** | +3 |
| Partial | 1 | 0 | -1 |
| Missing | 2 | 0 | -2 |
| **Match Rate** | 92.6% | **100%** | +7.4%p |
| **가중 총점** | 94.9% | **99.5%** | +4.6%p |
| Convention Warn | 1 | 0 | -1 |
| 다음 단계 | Report 진입 가능 | **즉시 Report** | - |

---

## 2. 이전 Gap 해소 검증

### M1. PropertiesMap 미구현 → ✅ 해소
- `vintee-app/src/components/map/PropertiesMap.tsx` 신규 — Kakao SDK 동적 로드, 복수 마커, 인포윈도우(이름/지역/가격/평점), `setBounds` 자동 프레이밍, API 키 미설정 시 폴백
- `vintee-app/src/app/properties/ViewToggle.tsx` 신규 — Feather SVG 리스트/지도 토글, `?view=map` URL 파라미터
- `vintee-app/src/app/properties/page.tsx` 통합 — Next.js 16 `searchParams: Promise<>` 준수

### M2. 주변 관광지 보조 마커 → ✅ 해소
- `NearbyAttraction` 타입에 `latitude/longitude` optional 추가 (`src/lib/utils/geo.ts`)
- `PropertyMap.tsx` 주황(`#F59E0B`) 원 마커 SVG data URI + 인포윈도우(이름/거리), `LatLngBounds` 자동 프레이밍
- `GeoFieldsSection.tsx` 폼 좌표 입력 UI + 미리보기
- zod 스키마(POST/PUT) 확장
- 시드 10개 관광지(현충사/월정사/동피랑/쇠소깍/죽녹원 등) 실좌표 채움

### M3. bounds 필터 API → ✅ 해소
- `vintee-app/src/app/api/properties/route.ts` GET — `?bounds=swLat,swLng,neLat,neLng` 쿼리 지원, `Number.isFinite` 검증 + graceful fallback

### Convention Warn (대시보드 이모지) → ✅ 해소
- `vintee-app/src/app/host/geo/page.tsx` `StatusIcon` 컴포넌트 — Feather SVG 3종(check-circle/alert-triangle/x-circle), `stroke-width:2/round/round/fill:none`, `aria-label` 포함, CLAUDE.md 전역 아이콘 규칙 100% 준수

---

## 3. 요구사항 매핑 (27/27 Complete)

### 3.1 구조화 데이터 (7/7 ✅)
PropertyJsonLd + address/geo/priceRange/amenityFeature/aggregateRating/review/checkin·out

### 3.2 인용 가능한 팩트 (6/6 ✅)
Property 9필드 + 마이그레이션 + 시맨틱 HTML + 헤더 + 하이라이트 + 호스트 소개

### 3.3 FAQ 스키마 (3/3 ✅)
`generateFaqs()` 6종 + `FaqJsonLd` + `<details>` 아코디언

### 3.4 호스트 GEO 스코어 (6/6 ✅)
`calculateGeoScore()` + 11항목 100점 + 대시보드 + 셀렉터 + API + 폼 통합

### 3.5 llms.txt / robots.txt / sitemap (3/3 ✅)
3건 모두 (robots.txt는 Plan보다 풍부)

### 3.6 지도 기반 위치 서비스 (6/6 ✅, 이전 3/6 → +3)

| # | 요구사항 | v1 | v2 | 구현 위치 |
|---|---|:---:|:---:|---|
| 26 | PropertyMap 단일 마커 + 길찾기 | ✅ | ✅ | `components/map/PropertyMap.tsx` |
| 27 | 반경 검색 API `?lat&lng&radius` | ✅ | ✅ | `api/properties/route.ts` |
| 28 | `haversineDistance()` 유틸 | ✅ | ✅ | `lib/utils/geo.ts` |
| 29 | PropertiesMap 리스팅 토글 | ❌ | ✅ | `components/map/PropertiesMap.tsx` + `ViewToggle.tsx` |
| 30 | `bounds` 필터 API | ❌ | ✅ | `api/properties/route.ts` L29-48 |
| 31 | 주변 관광지 보조 마커 | 🟡 | ✅ | `PropertyMap.tsx` + seed 실좌표 |

---

## 4. Gap 분류

- **Critical**: 0건
- **Major**: 0건
- **Minor**: 0건

**남은 Gap 없음.**

---

## 5. Convention 컴플라이언스 (100%)

| 항목 | 결과 |
|---|:---:|
| Next.js 16 params Promise | ✅ |
| 가독성 절대 규칙 (input/label/배지/카드) | ✅ |
| Folder Structure | ✅ |
| Zod 입력 검증 | ✅ |
| **Icon System (Feather SVG)** | ✅ (v1 ⚠️ 해소) |
| SLDS Primary/텍스트 컬러 | ✅ |
| Clean Architecture | ✅ |

---

## 6. 점수 산정

| 카테고리 | 점수 | 비중 | 가중치 |
|---|:---:|:---:|:---:|
| Plan/Design 매칭률 | 100% | 60% | 60.0 |
| Architecture | 100% | 15% | 15.0 |
| Convention | 100% | 15% | 15.0 |
| 운영 안전장치 | 95% | 10% | 9.5 |
| **총점** | | | **99.5%** |

> 운영 안전장치 -0.5: `NEXT_PUBLIC_KAKAO_MAP_KEY` 미설정 시 폴백은 제공되나 `lib/env.ts` zod 검증은 미도입. Phase 2 환경변수 convention 부분 적용.

---

## 7. 의도된 차이 (긍정)

- robots.txt에 ClaudeBot/anthropic-ai/CCBot 추가
- llms.txt Plan 템플릿보다 풍부
- GEO 스코어 색상 3단계(80↑/60↑/그외)
- PropertyMap/PropertiesMap Kakao 키 미설정 폴백 UI
- 시드 10개 관광지 실제 한국 좌표

---

## 8. 권장 조치

### 즉시
**`/pdca report GEO-최적화` 진입 가능**. 100% 매칭 + 99.5점으로 임계값 크게 상회.

### 선택적 후속
1. 환경변수 zod 검증 (`lib/env.ts`에 `NEXT_PUBLIC_KAKAO_MAP_KEY` 스키마)
2. GEO 효과 측정 (Search Console + GA4 rich result KPI)
3. 지도 영역 실시간 필터 UX (`map.addListener('idle', ...)` 연결)

---

## 9. 결론

**Match Rate 100% (27/27), 가중 총점 99.5%** — 이전 Minor 3건 + Convention Warn 1건 전부 해소.

**다음 단계: `/pdca report GEO-최적화`**
