# [Plan] pension-crawler
# VINTEE Data Intelligence Pipeline — 전국 펜션 크롤링 & 내부 평가 시스템

**Feature ID:** pension-crawler
**Phase:** Plan
**Level:** Dynamic → Enterprise (데이터 파이프라인)
**Created:** 2026-03-01
**Author:** Mary (BMad Analyst) + PDCA Skill

---

## 1. Feature Overview (기능 개요)

### 한 줄 정의
> 전국 펜션 정보를 5개 플랫폼 + 블로그에서 자동 수집하고, 멀티소스 교차검증으로 VINTEE 내부 품질 점수(VINTEE Score)를 산출하여 추천 알고리즘 및 호스트 영입 CRM에 활용하는 자동화 데이터 파이프라인

### 배경 & 필요성
- **콜드스타트 해결:** 신규 플랫폼의 숙소 수 부족 문제를 자동 데이터 수집으로 극복
- **추천 신뢰도 향상:** 외부 검증 데이터 기반 VINTEE Score로 추천 품질 확보
- **호스트 영입 효율화:** 고점수 펜션 우선 영업으로 전환율 3배 목표

### 성공 기준 (Definition of Done)
- [ ] 전국 펜션 3만 개 이상 수집 완료
- [ ] VINTEE Score 산출 정확도 95% 이상 (샘플 검증)
- [ ] 추천 알고리즘 CTR +20% 향상
- [ ] 관리자 대시보드에서 영입 CRM 기능 작동
- [ ] 주 1회 자동 업데이트 스케줄 운영

---

## 2. Scope (범위)

### IN Scope — MVP
| 모듈 | 내용 |
|------|------|
| **크롤러 F1** | 네이버 플레이스, 카카오맵, 야놀자, 여기어때, 에어비앤비, 네이버 블로그 |
| **정규화 F2** | 중복 제거(주소+이름 유사도), 표준 스키마 변환, PostgreSQL 저장 |
| **Score 엔진 F3** | VINTEE Score 알고리즘 (5개 가중치 합산) |
| **태그 분류 F4** | 리뷰 텍스트 기반 VINTEE 태그 자동 추출 |
| **관리자 UI F5** | 수집 현황 대시보드 + 호스트 영입 CRM |

### OUT of Scope — MVP 이후
- 이미지 크롤링 및 AI 이미지 품질 분석
- 실시간 가격 모니터링
- 사용자에게 VINTEE Score 직접 노출
- 호스트 자동 발신 이메일 시스템

---

## 3. Architecture Overview (아키텍처 개요)

```
┌─────────────────────────────────────────────────────┐
│                VINTEE Intelligence Pipeline          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Scheduler: APScheduler]                           │
│       ↓ 주 1회 전체 / 일 1회 변경분                    │
│                                                     │
│  ┌──────────────────────────────────┐               │
│  │     Crawler Workers (병렬)        │               │
│  │  네이버  카카오  야놀자  여기어때  에어비앤비  블로그  │
│  │  (Python + Playwright/requests)  │               │
│  └──────────────┬───────────────────┘               │
│                 ↓ 원시 데이터                          │
│  [raw_crawl_results 테이블] ← PostgreSQL             │
│                 ↓                                   │
│  [Normalizer] 중복제거 + 스키마 통일                   │
│                 ↓                                   │
│  [Score Engine] VINTEE Score + 태그 분류              │
│                 ↓                                   │
│  [property_intelligence 테이블]                      │
│                 ↓                                   │
│  ┌────────────────────────────────┐                 │
│  │  활용 레이어                    │                 │
│  │  - 추천 알고리즘 인풋            │                 │
│  │  - 관리자 대시보드 (호스트 CRM)  │                 │
│  └────────────────────────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

## 4. VINTEE Score Algorithm (핵심 알고리즘)

```python
VINTEE Score (1.0 ~ 5.0) =
  avg_rating        × 0.30   # 멀티소스 가중 평균 별점
  + review_volume   × 0.20   # log(리뷰수 + 1) / log(max + 1) 정규화
  + sentiment_score × 0.25   # Claude Haiku NLP 긍/부정 비율 (0~1)
  + theme_score     × 0.15   # 농촌 테마 키워드 매칭 밀도
  + recency_score   × 0.10   # 최근 6개월 리뷰 비중
```

### 플랫폼별 평점 가중치 (avg_rating 산출용)
| 플랫폼 | 가중치 | 이유 |
|--------|--------|------|
| 에어비앤비 | 0.30 | 가장 엄격한 리뷰 시스템 |
| 여기어때 | 0.25 | 숙박 전문 플랫폼 |
| 야놀자 | 0.20 | 국내 최대 숙박 데이터 |
| 네이버 플레이스 | 0.15 | 커버리지 최고, 신뢰도 보통 |
| 카카오맵 | 0.10 | 보조 데이터 |

### VINTEE 태그 자동 분류 키워드 사전 (예시)
```python
TAG_KEYWORDS = {
  "#논뷰맛집":     ["논", "논뷰", "rice field", "들판", "논밭"],
  "#불멍과별멍":    ["불멍", "캠프파이어", "별보기", "별멍", "모닥불"],
  "#아궁이체험":    ["아궁이", "장작", "전통 부뚜막"],
  "#농사체험":     ["농사", "모내기", "수확", "텃밭", "딸기 따기"],
  "#반려동물동반":  ["반려견", "강아지", "펫", "동물 동반"],
  "#개별바베큐":    ["바베큐", "BBQ", "그릴", "숯불"],
  "#계곡앞":       ["계곡", "물놀이", "천"],
  "#산속힐링":     ["산속", "숲", "등산", "자연"],
  "#SNS맛집":      ["인스타", "포토존", "감성", "뷰맛집"],
  "#혼캉스":       ["혼자", "1인", "혼캉스", "solo"],
}
```

---

## 5. Data Schema (핵심 DB 스키마)

### raw_crawl_results (원시 수집 데이터)
```sql
CREATE TABLE raw_crawl_results (
  id            TEXT PRIMARY KEY,          -- CUID
  source        VARCHAR(20) NOT NULL,       -- 'naver'|'kakao'|'yanolja'|'yeogi'|'airbnb'|'blog'
  source_id     VARCHAR(200),              -- 플랫폼 고유 ID
  name          VARCHAR(300) NOT NULL,     -- 펜션명
  address       TEXT,
  phone         VARCHAR(30),
  lat           DECIMAL(10,7),
  lng           DECIMAL(10,7),
  source_rating DECIMAL(3,2),             -- 원본 별점
  review_count  INTEGER DEFAULT 0,
  raw_reviews   JSONB,                    -- [{text, rating, date}]
  amenities     TEXT[],
  extra_data    JSONB,                    -- 플랫폼별 추가 정보
  crawled_at    TIMESTAMP DEFAULT NOW(),
  is_processed  BOOLEAN DEFAULT FALSE
);
```

### property_intelligence (정규화 + 점수 통합)
```sql
CREATE TABLE property_intelligence (
  id              TEXT PRIMARY KEY,
  name            VARCHAR(300) NOT NULL,
  address         TEXT,
  region          VARCHAR(50),            -- 시도 (예: 강원도, 경기도)
  subregion       VARCHAR(50),            -- 시군구
  lat             DECIMAL(10,7),
  lng             DECIMAL(10,7),
  phone           VARCHAR(30),

  -- VINTEE Score 구성
  avg_rating      DECIMAL(3,2),
  total_reviews   INTEGER,
  sentiment_score DECIMAL(4,3),          -- 0.000 ~ 1.000
  theme_score     DECIMAL(4,3),
  recency_score   DECIMAL(4,3),
  vintee_score    DECIMAL(3,2),          -- 최종 1.0 ~ 5.0

  -- 태그 & 상태
  auto_tags       TEXT[],
  is_recruited    BOOLEAN DEFAULT FALSE,  -- 호스트 영입 완료
  recruit_note    TEXT,                   -- 영입팀 메모

  -- 소스 ID 매핑
  naver_id        VARCHAR(200),
  kakao_id        VARCHAR(200),
  yanolja_id      VARCHAR(200),
  yeogi_id        VARCHAR(200),
  airbnb_id       VARCHAR(200),

  -- 이미지 (Phase 2)
  thumbnail_url   TEXT,

  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_pi_region ON property_intelligence(region);
CREATE INDEX idx_pi_vintee_score ON property_intelligence(vintee_score DESC);
CREATE INDEX idx_pi_is_recruited ON property_intelligence(is_recruited);
CREATE INDEX idx_pi_tags ON property_intelligence USING GIN(auto_tags);
```

---

## 6. Tech Stack (기술 스택)

| 레이어 | 기술 | 버전 | 이유 |
|--------|------|------|------|
| **크롤러** | Python | 3.11+ | 크롤링 생태계 최적 |
| **브라우저 자동화** | Playwright (Python) | 1.40+ | JS 렌더링, 안티봇 우회 |
| **정적 파싱** | BeautifulSoup4 + httpx | 최신 | 빠른 정적 페이지 |
| **스케줄러** | APScheduler | 3.10+ | 경량, Docker 친화적 |
| **NLP/감성분석** | Claude Haiku API | claude-haiku-4-5 | 한국어 최적, 비용 효율 |
| **중복 제거** | rapidfuzz | 3.x | 한국어 주소/이름 유사도 |
| **DB** | PostgreSQL (Neon) | 15+ | 기존 VINTEE DB 통합 |
| **ORM** | SQLAlchemy | 2.x | Python 표준 |
| **배포** | Docker on Vultr | - | 기존 서버 활용 |
| **관리자 UI** | Next.js (기존 VINTEE) | 14 | 별도 빌드 불필요 |

---

## 7. Implementation Plan (구현 계획)

### Sprint 1 (1주차): 크롤러 인프라 + 네이버
- [ ] Python 크롤러 Docker 환경 구성
- [ ] PostgreSQL `raw_crawl_results` 테이블 마이그레이션 (Prisma)
- [ ] 네이버 플레이스 크롤러 구현 (펜션 기본정보 + 별점 + 리뷰)
- [ ] 강원도 펜션 1,000개 수집 파일럿 테스트

### Sprint 2 (2주차): 멀티소스 크롤러 확장
- [ ] 카카오맵 크롤러
- [ ] 야놀자/여기어때 크롤러 (숙박 정보 + 별점)
- [ ] 에어비앤비 크롤러 (공개 데이터)
- [ ] 네이버 블로그 키워드 크롤러

### Sprint 3 (3주차): 정규화 + Score 엔진
- [ ] `property_intelligence` 테이블 + 정규화 파이프라인
- [ ] 주소 기반 중복 제거 (rapidfuzz)
- [ ] VINTEE Score 알고리즘 구현 + 검증
- [ ] Claude Haiku 감성분석 API 연동

### Sprint 4 (4주차): 태그 분류 + 관리자 대시보드
- [ ] VINTEE 태그 자동 분류 (키워드 사전 + Claude)
- [ ] Next.js 관리자 페이지: `/admin/intelligence`
- [ ] 호스트 영입 CRM (Score 필터 + 지역 필터 + 영입 상태 관리)
- [ ] 스케줄러 배포 + 주간 자동 실행 설정

### Sprint 5 (2개월차): 안정화 + 전국 확대
- [ ] 전국 확대 수집 (5만 개 목표)
- [ ] 추천 알고리즘 VINTEE Score 연동
- [ ] 크롤링 모니터링 알림 (Slack or 이메일)
- [ ] 데이터 품질 검증 대시보드

---

## 8. Risks & Mitigations (리스크 & 대응)

| 리스크 | 가능성 | 영향 | 대응 |
|--------|--------|------|------|
| IP 차단 (야놀자/에어비앤비) | 높음 | 높음 | 딜레이 3~5초, User-Agent 로테이션, 프록시 대기 |
| 플랫폼 DOM 구조 변경 | 중간 | 중간 | 소스별 어댑터 패턴, 알림 모니터링 |
| 한국어 NLP 정확도 | 낮음 | 중간 | Claude Haiku 활용, 10% 샘플 수동 검증 |
| 중복 제거 오류 | 중간 | 중간 | 주소+이름 이중 검증, 오차 허용 임계값 조정 |
| 법적 이슈 | 낮음 | 높음 | 내부 분석 전용, 공개 정보만, robots.txt 준수 |

---

## 9. Legal & Ethical Guidelines (법적/윤리 기준)

- **수집 범위:** 공개된 정보만 (로그인 없이 접근 가능한 데이터)
- **저장:** 수집 출처 (`source` 컬럼) 반드시 기록
- **활용:** VINTEE 내부 분석 전용, 외부 공개 시 출처 명시
- **robots.txt:** 각 플랫폼 robots.txt 준수
- **크롤링 속도:** 분당 10~20 요청 이하, 서버 부하 최소화
- **개인정보:** 호스트 전화번호 등 개인정보는 영입 목적으로만 사용

---

## 10. Dependencies (의존성)

- **기존 VINTEE DB** (Neon PostgreSQL) — 동일 DB에 새 테이블 추가
- **Claude Haiku API** — 감성분석 NLP
- **Vultr 서버** (158.247.235.31) — 크롤러 Docker 배포
- **기존 VINTEE Next.js Admin** — 관리자 UI 확장

---

## 11. Open Questions (미결 사항)

1. 에어비앤비 공개 API 사용 가능 여부 확인 필요 (vs Playwright)
2. VINTEE Score 사용자 노출 시점 및 형태 (배지? 숫자?)
3. 크롤링 데이터 → 호스트 입점 후 데이터 병합 전략
4. 프록시 서버 도입 여부 (IP 차단 대응)

---

**[Plan] → [Design] → [Do] → [Check] → [Act]**

다음 단계: `/pdca design pension-crawler` 실행하여 상세 설계 문서 작성
