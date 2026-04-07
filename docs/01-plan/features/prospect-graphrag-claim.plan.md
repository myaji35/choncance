# Plan: Prospect + GraphRAG + Claim Model

**Feature**: prospect-graphrag-claim
**Phase**: Plan
**Date**: 2026-04-07
**Priority**: P0 (핵심 사업 전략)
**Level**: Dynamic → Enterprise (GraphRAG 도입)
**Owner**: 대표님 (강승식) + VINTEE Engineering

---

## 1. Executive Summary

### 1.1 한 줄 요약

공공데이터 기반 펜션을 사전 등록(Prospect)해 AI 검색 시대에 한국 촌캉스 카테고리를 선점하고, GraphRAG 맥락 추천 엔진으로 차별화하며, Claim + 구독/수수료 하이브리드로 수익화한다.

### 1.2 전략적 축

```
1) GEO 자동 지원 (구현 완료) ─┐
2) GraphRAG 맥락 추천 (신규) ─┼→ VINTEE의 해자(Moat)
3) Claim 플로우 (신규)      ─┘
```

### 1.3 경쟁 차별화

- 에어비앤비·야놀자: 호스트 Push 모델 + 단순 검색
- **VINTEE**: 공공데이터 Pull 모델 + GraphRAG 맥락 추천 + 자동 GEO/AI 최적화

---

## 2. 목표

### 2.1 사업 목표 (24개월)

| 지표 | Month 6 | Month 12 | Month 24 |
|---|:---:|:---:|:---:|
| Prospect 숙소 수 | 3,500 | 5,000 | 8,000 |
| 유료 호스트 수 | 420 | 1,400 | 4,300 |
| 월 GMV | 2억 | 5억 | 15억 |
| 월 순이익 | BEP | 2,600만 | 9,300만 |
| AI 검색 인용률(한국 촌캉스) | 30% | 60% | 80% |

### 2.2 기술 목표

- GraphRAG 자연어 검색 응답 시간 < 2초 (p95)
- 자동 GEO 점수 평균 70점 이상 (Prospect 단계)
- Claim → 유료 전환율 > 70%
- LLM 비용 / 매출 비율 < 2%

### 2.3 품질 목표

- Match Rate 95% 이상 (gap-detector)
- Zero legal incident (Phase 0 자문 기반)
- 호스트 이탈률 월 5% 이내

---

## 3. 핵심 기능 스펙

### 3.1 Property 상태 머신 확장

```
[prospect] ──claim 신청──▶ [claim_pending]
                                │
                         본인 확인 성공
                                ▼
                          [claimed] ──3개월 후──▶ [active]
                                │                     │
                         결제 실패                   활성
                                ▼                     │
                          [dormant] ◀── 결제 중단 ──┘
                                │
                          관리자 차단
                                ▼
                          [suspended]

상태:
  prospect           공공데이터 자동 등록, 예약 불가, GEO 노출
  claim_pending      인수 신청 제출, 본인 확인 대기
  claimed            인수 완료, 3개월 트라이얼 (예약 가능)
  active             유료 구독 활성
  dormant            결제 실패 or 일시정지 (프로필 유지)
  suspended          관리자 차단
  rejected           호스트가 "내 숙소 아님" 신고 완료
  deleted            호스트 삭제 요청 처리 완료
```

### 3.2 GraphRAG 엔진

#### 3.2.1 노드(Node) 종류

| 노드 | 예시 | 구현 |
|---|---|---|
| Property | 논뷰 한옥 펜션 | 기존 |
| Region | 충남 아산 (계층) | 신규 |
| Attraction | 현충사, 아산온천 | 신규 |
| Tag (Theme) | 한옥, 글램핑, 바다 | 신규 |
| Tag (Feature) | 반려동물OK, 바비큐 | 신규 |
| Tag (Mood) | 조용함, 낭만적 | 신규 |
| Tag (Activity) | 별관측, 감귤따기 | 신규 |
| Tag (Audience) | 가족, 커플, 혼자 | 신규 |
| Season | 봄, 여름, 가을, 겨울 | 신규 |
| Host | 김호스트 | 기존 |
| Review | 리뷰 텍스트 | 기존 |

#### 3.2.2 엣지(Edge) 종류

```
Property -[LOCATED_IN]-> Region
Property -[HAS_ATTRACTION]-> Attraction (distance, travel_time)
Property -[HAS_TAG]-> Tag (score, source)
Property -[BEST_SEASON]-> Season
Property -[HOSTED_BY]-> Host
Review -[ABOUT]-> Property
Review -[MENTIONS]-> Tag (sentiment)
Region -[PARENT_OF]-> Region (계층)
Attraction -[NEAR]-> Attraction
Tag -[RELATED_TO]-> Tag (유사도)
```

#### 3.2.3 추천 쿼리 플로우

```
1. User Query (자연어) ─→ "가족이랑 가을에 조용한 한옥"
2. Entity Extraction (Claude Haiku) ─→ { audience:[가족], season:[가을], mood:[조용함], theme:[한옥] }
3. Tag Resolution (임베딩 매칭) ─→ Tag IDs
4. Graph Traversal (2-hop SQL) ─→ 후보 Property 20개 + 스코어
5. LLM Rerank (Claude Haiku) ─→ Top 5 + 설명
6. Response Composition ─→ 카드 + 매칭 근거 블록
```

#### 3.2.4 자동 태그 추출 파이프라인

```
Step 1: 규칙 기반 (deterministic)
  - highlights → PropertyTag(type=theme)
  - petsAllowed → Tag("반려동물OK")
  - bestSeason → Tag(season)
  - uniqueExperience → split → Tag(activity)

Step 2: LLM 설명 분석 (GPT-4o-mini)
  Prompt:
    "다음 숙소 설명에서 카테고리별 태그를 추출하세요:
     - theme (분위기/테마)
     - mood (정서)
     - activity (가능한 활동)
     - audience (대상)
     - feature (시설/편의)
     결과는 JSON array: [{type, name, confidence}]"

Step 3: 리뷰 감성 태깅
  - Review.content → LLM → positive/negative 태그 + 감성

Step 4: 임베딩 생성
  - text-embedding-3-small (1536 dim)
  - Tag.embedding에 BLOB 저장
```

### 3.3 Claim 플로우

#### 3.3.1 본인 확인 방법 (우선순위)

1. **사업자등록증 업로드 + 사업자 조회 API 대조** (가장 강력)
2. 해당 숙소 공개 전화번호로 SMS 인증
3. 이메일 도메인 확인 (보조)
4. 지자체 인허가 DB 조회 (관리자 수동)

#### 3.3.2 Claim API 엔드포인트

```
POST /api/properties/:id/claim
  body: { method, businessRegNo?, phone?, email, notes }
  → ClaimRequest 생성
  → 관리자 큐에 등록

POST /api/claims/:token/verify
  → 인증 완료
  → Property.status = "claimed"
  → 3개월 트라이얼 자동 시작

POST /api/properties/:id/reject
  body: { reason }
  → "내 숙소 아님" 신고
  → Property.status = "rejected"
  → 관리자 검토 큐

GET /api/host/claims
  → 내가 인수한 숙소 목록
```

### 3.4 자동 GEO 지원 (기존 재활용)

Prospect 수집 즉시 자동 적용:
- ✅ LodgingBusiness JSON-LD (`PropertyJsonLd.tsx`)
- ✅ FAQPage JSON-LD (`FaqJsonLd.tsx` + `generateFaqs()`)
- ✅ 시맨틱 HTML (`property/[id]/page.tsx`)
- ✅ sitemap.xml (`sitemap.ts`)
- ✅ llms.txt (`public/llms.txt`)
- ⏳ **신규**: LLM 기반 숙소 설명 확장
- ⏳ **신규**: LLM 기반 다국어 자동 생성 (Pro 플랜)
- ⏳ **신규**: 지역 가이드 블로그 자동 생성 (Pro 플랜)

### 3.5 구독 + 결제

#### 3.5.1 플랜 확정

```
Free          : 0원 (Claim만, 예약 불가)
Trial         : 0원 (3개월, 모든 기능 + 5% 수수료)
Starter       : 10,000원/월 + 5% 수수료 (No Sale No Fee)
Pro           : 30,000원/월 + 2.5% 수수료
SuccessFee    : 0원/월 + 8% 수수료
```

#### 3.5.2 결제 연동

- PG: **토스페이먼츠** (한국 최적)
- 정기결제: 빌링키 발급 + 매월 자동 청구
- Webhook: 결제 성공/실패/취소 이벤트 → 상태 머신 전이
- 다크패턴 방지: 트라이얼 만료 7일 전 이메일·대시보드 배너 고지

#### 3.5.3 No Sale No Fee 로직

```
매월 1일 00:00 Cron:
  for host in Starter:
    if host.property.bookings(last_30d).count == 0:
      skip this month's charge
      send: "이번 달 예약이 없어 구독료가 면제되었습니다"
```

### 3.6 데이터 수집 파이프라인

#### 3.6.1 소스 (공공데이터 전용)

| 소스 | API | 수집 주기 |
|---|---|---|
| 한국관광공사 TourAPI | `http://apis.data.go.kr/B551011/KorService1` | 주 1회 전체 sync |
| 공공데이터포털 숙박업 | `data.go.kr` | 월 1회 |
| 지자체 농촌관광 | 개별 API | 월 1회 |

#### 3.6.2 수집 플로우

```
1. TourAPI 호출 (페이지네이션)
2. 응답 파싱 → Property 매핑
3. 중복 확인 (사업자번호 or 전화번호 or 위치 100m)
4. Property 생성 (status=prospect)
5. 자동 GEO 파이프라인 실행
6. 자동 태그 추출 파이프라인 실행
7. sitemap 업데이트
```

---

## 4. 비기능 요구사항

### 4.1 성능

- 메인 페이지 LCP < 2.5s
- 자연어 검색 응답 < 2s (p95)
- GraphRAG 쿼리 캐싱 (인기 쿼리 1h TTL)

### 4.2 보안

- 사업자등록증 이미지 암호화 저장 (KMS 키)
- Claim 신청 rate limit (IP당 5회/시간)
- LLM 프롬프트 injection 방어 (입력 sanitize)

### 4.3 확장성

- Month 6 기준 3,500 Prospect + 500 유료
- Month 24 기준 8,000 Prospect + 4,300 유료
- SQLite 한계 초과 시 Postgres 마이그레이션 계획 Phase 7

### 4.4 접근성

- 모든 새 페이지 aria-label 준수
- 한글/영문 스크린리더 호환

### 4.5 법적

- `docs/05-legal/prospect-legal-review.md` 쟁점 8건 모두 해결
- 변호사 자문 의견서 수령 후 Phase 1 착수
- Opt-out 요청 24시간 이내 처리 SLA

---

## 5. 기술 스택

### 5.1 유지 (기존)

- Next.js 16 (Turbopack)
- Prisma 7 + SQLite + @prisma/adapter-libsql
- NextAuth v5
- TailwindCSS 4
- Kakao Maps (Townin 키 이식 완료)

### 5.2 신규 추가

- **OpenAI SDK** (`openai` npm)
  - GPT-4o-mini: 태그 추출, 검색 엔티티, 재순위
  - text-embedding-3-small: 태그/쿼리 임베딩
- **토스페이먼츠 SDK** (정기결제 빌링)
- **node-cron** (No Sale No Fee 배치)
- **better-sqlite3** (그래프 쿼리용, 필요 시)
- **zod** (기존, 쿼리 검증 확장)

### 5.3 인프라

- Vercel Pro (프로덕션)
- OpenAI API (LLM)
- 토스페이먼츠 빌링
- Cloudinary or Vercel Blob (사업자등록증 이미지)
- Sentry (에러 모니터링)
- PostHog or Vercel Analytics (전환율)

---

## 6. 실행 로드맵 (Phase 0~6)

### Phase 0: 법적 기반 (1주) — 🔴 필수 선행

- [ ] 변호사 자문 진행 (`docs/05-legal/prospect-legal-review.md` 기반)
- [ ] 자문 의견서 수령
- [ ] 이용약관 v2 / 개인정보처리방침 v2 초안 검토
- [ ] Phase 1 Go/No-Go 결정

**Deliverable**: 자문 의견서, 약관 v2, Go/No-Go 결정

### Phase 1: GraphRAG MVP (3주) ⭐ 핵심

**Week 1: 스키마 + 규칙 기반**
- [ ] Tag/PropertyTag/ReviewTag/Region/Attraction 테이블 생성
- [ ] 마이그레이션
- [ ] 규칙 기반 태그 추출 (highlights/petsAllowed/bestSeason)
- [ ] 기존 5개 숙소 태그화 (수동 검증)

**Week 2: LLM 태그 추출**
- [ ] OpenAI SDK 연동
- [ ] 태그 추출 프롬프트 작성
- [ ] 배치 처리 스크립트
- [ ] 리뷰 감성 태깅

**Week 3: 그래프 쿼리 + 추천 API**
- [ ] 임베딩 저장 및 유사도 함수
- [ ] 2-hop 탐색 SQL 쿼리
- [ ] LLM 재순위 로직
- [ ] `/api/recommend` 엔드포인트
- [ ] 메인 페이지 자연어 검색 UI

**Deliverable**: 5개 시드 숙소로 자연어 질의 → 추천 + 이유 생성 가능

### Phase 2: Prospect 파이프라인 (2주)

**Week 1: TourAPI 연동**
- [ ] TourAPI 키 발급 + 요청 래퍼
- [ ] Property 매핑 + 중복 검증
- [ ] 수집 스크립트 (cron)
- [ ] 초기 500개 수집 테스트

**Week 2: Prospect UX**
- [ ] Property 상태 머신 확장 마이그레이션
- [ ] UnclaimedBanner 컴포넌트
- [ ] 예약 버튼 비활성화 + "인수하기" CTA
- [ ] JSON-LD `availability: OutOfStock` 추가
- [ ] 자동 GEO 파이프라인 연결
- [ ] 자동 태그 파이프라인 연결

**Deliverable**: 500개 Prospect 숙소가 GEO 최적화 + GraphRAG 추천 가능한 상태로 노출

### Phase 3: Claim 플로우 (2주)

**Week 1: 본인 확인**
- [ ] ClaimRequest 테이블
- [ ] Claim 신청 폼 (`/property/:id/claim`)
- [ ] 사업자등록증 업로드 (Vercel Blob)
- [ ] SMS 인증 연동
- [ ] "내 숙소 아님" 신고 플로우

**Week 2: 관리자 + 전이**
- [ ] 관리자 Claim 승인 대시보드 (`/admin/claims`)
- [ ] 상태 전이 로직 (prospect → claim_pending → claimed)
- [ ] 3개월 트라이얼 자동 시작
- [ ] 호스트 웰컴 메일

**Deliverable**: 호스트가 Claim 신청 → 본인 확인 → claimed 상태로 예약 가능

### Phase 4: 구독 + 결제 (3주)

**Week 1: 토스페이먼츠 연동**
- [ ] 토스페이먼츠 개발자 계정
- [ ] 빌링키 발급 플로우
- [ ] Subscription 테이블 + Prisma 모델
- [ ] 4가지 플랜 (Free/Starter/Pro/SuccessFee)

**Week 2: 구독 관리**
- [ ] 플랜 선택 UI
- [ ] 트라이얼 → 유료 전환 플로우
- [ ] 구독 취소 / 플랜 변경
- [ ] Webhook 처리 (결제 성공/실패)

**Week 3: No Sale No Fee + 다크패턴 방지**
- [ ] 월초 배치 (0예약 면제)
- [ ] 트라이얼 만료 7일 전 알림
- [ ] 환불 정책 (일할 계산)
- [ ] 대시보드 "다음 청구일" 명확 표시

**Deliverable**: 4개 플랜 모두 동작 + No Sale No Fee 적용

### Phase 5: 호스트 Pro 가치 (2주)

**Week 1: 인사이트 대시보드**
- [ ] GEO 점수 히스토리 차트
- [ ] AI 검색 노출 카운터 (GSC 연동)
- [ ] "비슷한 숙소 비교 분석"
- [ ] 호스트 페르소나 리포트

**Week 2: 다국어 + 블로그**
- [ ] 다국어 자동 생성 (한/영/일/중)
- [ ] hreflang 메타
- [ ] 지역 가이드 블로그 자동 생성
- [ ] 주간 이메일 리포트

**Deliverable**: Pro 플랜 호스트가 월 3만원의 가치를 체감할 수 있는 상태

### Phase 6: Growth 최적화 (지속)

- [ ] 호스트 세일즈 레터 자동 발송
- [ ] Claim 전환율 A/B 테스트
- [ ] 이탈 호스트 리텐션 캠페인
- [ ] 지자체 B2B API 상품화 (Month 12+)
- [ ] OTA 추천 API 상품화 (Month 18+)

---

## 7. 리스크 관리

### 7.1 주요 리스크와 대응

| 리스크 | 확률 | 영향 | 대응 |
|---|:---:|:---:|---|
| 법적 분쟁 | 중 | 치명 | Phase 0 변호사 자문 필수, 공공데이터 전용, Opt-out 24h SLA |
| LLM 비용 초과 | 저 | 중 | 쿼리 캐싱, Haiku 모델 활용, 월 예산 알림 |
| 호스트 이탈 | 중 | 높 | No Sale No Fee, 3개월 트라이얼, Pro 가치 강화 |
| AI 검색 패널티 | 저 | 높 | 공공데이터 원본 재가공 금지, 재구성된 콘텐츠만 |
| 태그 품질 | 중 | 중 | 규칙 기반 + LLM 이중, 호스트 편집 가능, 피드백 루프 |
| 결제 실패 | 중 | 중 | 3일 유예 + 알림 + dormant 상태로 소프트랜딩 |
| 경쟁사 대응 | 중 | 중 | 데이터 플라이휠 선점, GraphRAG 해자 강화 |

### 7.2 Kill Switch 기준

다음 상황 발생 시 전략 재검토:
- 법적 분쟁 발생 (소장 접수)
- Month 6 유료 호스트 < 100명
- Claim 전환율 < 10%
- LLM 비용 / 매출 > 10%

---

## 8. 의존성

### 8.1 외부 의존성

- [ ] 한국관광공사 TourAPI 키 발급
- [ ] OpenAI API 키 발급 + 월 예산 설정
- [ ] 토스페이먼츠 가맹점 계약
- [ ] Vercel Pro 업그레이드
- [ ] 변호사 자문 일정
- [ ] Kakao Map 도메인 등록 (Townin 앱 → VINTEE 전용으로 이관 고려)

### 8.2 내부 의존성

- GEO-최적화 feature (100% 완료) ✅
- 리뷰 시스템 (100% 완료) ✅
- 한국형 포장 UI (완료) ✅
- Property 모델 9필드 GEO 필드 (완료) ✅

---

## 9. 성공 지표 (KPI)

### 9.1 Phase 1 완료 시
- GraphRAG 자연어 쿼리 → 추천 성공률 > 80%
- 평균 응답 시간 < 2s
- 태그 정확도 (수동 검증 기준) > 85%

### 9.2 Phase 2 완료 시
- Prospect 숙소 > 500개
- 자동 GEO 평균 점수 > 70
- sitemap 색인 완료 (Google Search Console 확인)

### 9.3 Phase 3 완료 시
- Claim 신청 > 50건
- Claim 승인율 > 90%
- 호스트 본인 확인 평균 시간 < 1영업일

### 9.4 Phase 4 완료 시
- 유료 전환 > 50명
- 결제 성공률 > 95%
- 다크패턴 규제 위반 0건

### 9.5 Phase 5 완료 시
- Pro 플랜 전환율 > 15%
- 다국어 페이지 평균 월 UV > 100 (영문)
- 주간 리포트 오픈율 > 30%

---

## 10. 예산

### 10.1 초기 투자 (Phase 0~1)

| 항목 | 금액 |
|---|---:|
| 변호사 자문 | 100만원 |
| TourAPI 테스트 | 50만원 |
| LLM 초기 인덱싱 | 20만원 |
| 인프라 구축 | 300만원 |
| 마케팅 시드 | 200만원 |
| 예비비 | 330만원 |
| **총 초기 투자** | **1,000만원** |

### 10.2 월 고정비 (Month 6 이후)

| 항목 | 월 금액 |
|---|---:|
| Vercel Pro + DB | 100만원 |
| OpenAI API | 150만원 |
| 토스페이먼츠 (수수료만) | GMV 연동 |
| CS 1명 | 350만원 |
| 법무·회계 | 250만원 |
| **월 고정비** | **850만원** |

### 10.3 재무 예측 (상세: `docs/06-finance/prospect-graphrag-pnl.md`)

- Month 6: BEP 도달
- Month 12: 월 순익 2,600만원
- Month 24: 월 순익 9,300만원 / 연 11.2억원

---

## 11. 오픈 질문 (결정 필요)

1. **VINTEE 전용 Kakao Map 앱 발급**: Townin 키 공용 사용 중. 장기적으로 분리 권장 (트래픽 쿼터·도메인 관리)
2. **SQLite vs Postgres**: Phase 1 MVP는 SQLite로. Phase 7에 Postgres 마이그레이션 여부 결정
3. **CS 조직**: 초기 월 5시간 기준 대표님이 직접 vs 외주 vs 1명 채용
4. **TourAPI 외 추가 소스**: 공공데이터포털 + 지자체 DB를 병렬 수집할지 아니면 TourAPI 안정화 후 추가할지
5. **LLM 모델 혼합**: 태그 추출은 GPT-4o-mini, 재순위는 Claude Haiku 등 멀티 벤더 고려 여부
6. **Pro 플랜 다국어 범위**: 한/영/일/중 4개 or 한/영 2개로 시작

---

## 12. 다음 단계

1. **이 Plan 승인** (대표님)
2. **변호사 자문 일정 확정** (Phase 0)
3. `/pdca design prospect-graphrag-claim` 실행 → 상세 Design 문서
4. Phase 1 착수 (GraphRAG MVP)

---

## 13. 참고 문서

- 법적 체크리스트: `docs/05-legal/prospect-legal-review.md`
- 재무 모델: `docs/06-finance/prospect-graphrag-pnl.md`
- 기존 GEO-최적화 Plan: `docs/01-plan/features/GEO-최적화.plan.md`
- 기존 GEO-최적화 Design: `docs/02-design/features/GEO-최적화.design.md`
- 기존 GEO-최적화 Gap Analysis: `docs/03-analysis/GEO-최적화.analysis.md`

---

*작성: Claude Opus 4.6 with VINTEE Engineering Team*
*PDCA Phase: Plan*
