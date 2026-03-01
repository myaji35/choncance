# [Design] pension-crawler
# VINTEE Intelligence Pipeline — 상세 설계 문서

**Feature ID:** pension-crawler
**Phase:** Design
**Level:** Enterprise (데이터 파이프라인)
**Created:** 2026-03-01
**Author:** PDCA Skill + Senior Engineering Team
**Based on:** `docs/01-plan/features/pension-crawler.plan.md`

---

## 1. 시스템 아키텍처 상세 (System Architecture Detail)

### 전체 파이프라인 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                  VINTEE Intelligence Pipeline (VIP)          │
│                                                             │
│  ┌──────────┐    ┌──────────────────────────────────────┐   │
│  │Scheduler │───▶│         Crawler Workers              │   │
│  │APScheduler│   │  NaverCrawler  KakaoCrawler           │   │
│  │주 1회 전체│   │  YanoljaCrawler YeogiCrawler          │   │
│  │일 1회 증분│   │  AirbnbCrawler  BlogCrawler           │   │
│  └──────────┘    └──────────┬───────────────────────────┘   │
│                             │ raw JSON                       │
│                  ┌──────────▼───────────────────────────┐   │
│                  │        raw_crawl_results (PostgreSQL)  │   │
│                  │   source | name | address | rating    │   │
│                  │   reviews | amenities | crawled_at    │   │
│                  └──────────┬───────────────────────────┘   │
│                             │ is_processed = FALSE           │
│                  ┌──────────▼───────────────────────────┐   │
│                  │           Normalizer                   │   │
│                  │  - 중복 제거 (rapidfuzz 주소+이름)     │   │
│                  │  - 표준 스키마 변환                    │   │
│                  │  - 지역 파싱 (region/subregion)        │   │
│                  └──────────┬───────────────────────────┘   │
│                             │ normalized data                │
│                  ┌──────────▼───────────────────────────┐   │
│                  │         Score Engine                   │   │
│                  │  - avg_rating 멀티소스 가중치           │   │
│                  │  - Claude Haiku 감성분석               │   │
│                  │  - VINTEE 태그 키워드 매칭              │   │
│                  │  - VINTEE Score 최종 산출              │   │
│                  └──────────┬───────────────────────────┘   │
│                             │ scored data                    │
│                  ┌──────────▼───────────────────────────┐   │
│                  │   property_intelligence (PostgreSQL)   │   │
│                  │   vintee_score | auto_tags             │   │
│                  │   is_recruited | recruit_note          │   │
│                  └──────────┬───────────────────────────┘   │
│                             │                               │
│              ┌──────────────┼──────────────┐               │
│    ┌─────────▼──────┐  ┌───▼──────────┐  ┌▼──────────┐    │
│    │ 추천 알고리즘   │  │ Admin UI     │  │ Host CRM  │    │
│    │ (향후 연동)    │  │/admin/intel  │  │ 영입 관리  │    │
│    └───────────────┘  └──────────────┘  └───────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Python 크롤러 모듈 구조 (Crawler Module Architecture)

### 2.1 디렉토리 구조

```
backend/crawler/
├── __init__.py
├── main.py                    # 진입점: 스케줄러 실행
├── config.py                  # 설정 (딜레이, User-Agent, DB URL 등)
├── requirements.txt           # 의존성 목록
├── Dockerfile                 # Docker 이미지
├── .env.example               # 환경 변수 템플릿
│
├── adapters/                  # 플랫폼별 크롤러 (어댑터 패턴)
│   ├── __init__.py
│   ├── base.py                # BaseCrawler 추상 클래스
│   ├── naver.py               # 네이버 플레이스 크롤러
│   ├── kakao.py               # 카카오맵 크롤러
│   ├── yanolja.py             # 야놀자 크롤러
│   ├── yeogi.py               # 여기어때 크롤러
│   ├── airbnb.py              # 에어비앤비 크롤러
│   └── blog.py                # 네이버 블로그 크롤러
│
├── pipeline/                  # 파이프라인 처리 단계
│   ├── __init__.py
│   ├── normalizer.py          # 데이터 정규화 + 중복 제거
│   ├── score_engine.py        # VINTEE Score 알고리즘
│   └── tag_classifier.py      # 자동 태그 분류
│
├── db/                        # 데이터베이스 레이어
│   ├── __init__.py
│   ├── models.py              # SQLAlchemy ORM 모델
│   ├── session.py             # DB 세션 관리
│   └── repository.py          # CRUD 레포지토리
│
├── utils/                     # 유틸리티
│   ├── __init__.py
│   ├── address_parser.py      # 주소 파싱 (region/subregion 추출)
│   ├── rate_limiter.py        # 요청 속도 제한
│   ├── user_agent.py          # User-Agent 로테이션
│   └── logger.py              # 구조화 로깅
│
└── tests/                     # 단위 테스트
    ├── test_normalizer.py
    ├── test_score_engine.py
    └── test_tag_classifier.py
```

### 2.2 BaseCrawler 추상 클래스 설계

```python
# adapters/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class RawProperty:
    """크롤링 원시 데이터 구조"""
    source: str                    # 'naver'|'kakao'|'yanolja'|'yeogi'|'airbnb'|'blog'
    source_id: Optional[str]       # 플랫폼 고유 ID
    name: str                      # 펜션명
    address: Optional[str]
    phone: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    source_rating: Optional[float] # 원본 별점 (1.0~5.0)
    review_count: int = 0
    raw_reviews: list = None       # [{"text": str, "rating": float, "date": str}]
    amenities: list = None         # ["wifi", "parking", ...]
    extra_data: dict = None        # 플랫폼별 추가 데이터

class BaseCrawler(ABC):
    """모든 크롤러의 추상 기본 클래스"""

    SOURCE_NAME: str = ""          # 서브클래스에서 반드시 정의

    def __init__(self, config: dict):
        self.config = config
        self.delay_min = config.get("delay_min", 3)
        self.delay_max = config.get("delay_max", 5)

    @abstractmethod
    async def search_pensions(self, region: str) -> List[RawProperty]:
        """지역별 펜션 검색"""
        pass

    @abstractmethod
    async def get_detail(self, source_id: str) -> Optional[RawProperty]:
        """숙소 상세 정보 수집"""
        pass

    @abstractmethod
    async def get_reviews(self, source_id: str, limit: int = 50) -> list:
        """리뷰 수집"""
        pass

    async def crawl_region(self, region: str) -> List[RawProperty]:
        """공통 크롤링 플로우: 검색 → 상세 → 리뷰"""
        properties = await self.search_pensions(region)
        results = []
        for prop in properties:
            await self._rate_limit()
            detail = await self.get_detail(prop.source_id)
            if detail:
                detail.raw_reviews = await self.get_reviews(prop.source_id)
                results.append(detail)
        return results

    async def _rate_limit(self):
        """속도 제한 (3~5초 랜덤 딜레이)"""
        import asyncio, random
        delay = random.uniform(self.delay_min, self.delay_max)
        await asyncio.sleep(delay)
```

### 2.3 NaverCrawler 구현 설계

```python
# adapters/naver.py
from playwright.async_api import async_playwright
from .base import BaseCrawler, RawProperty

class NaverCrawler(BaseCrawler):
    SOURCE_NAME = "naver"
    BASE_URL = "https://map.naver.com/v5/search/"
    SEARCH_KEYWORD = "{region} 펜션"

    async def search_pensions(self, region: str) -> list:
        """Playwright로 네이버 플레이스 검색"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.set_extra_http_headers({
                "User-Agent": self._get_user_agent()
            })
            # ... 구현 상세 (scroll, pagination 처리)

    async def get_detail(self, source_id: str) -> RawProperty:
        """네이버 플레이스 상세 API"""
        url = f"https://place.map.naver.com/place/{source_id}"
        # httpx로 정적 API 엔드포인트 호출 (더 빠름)

    async def get_reviews(self, source_id: str, limit: int = 50) -> list:
        """네이버 리뷰 수집 (최대 50개)"""
        # 방문자 리뷰 + 블로그 리뷰 통합
```

### 2.4 Score Engine 설계

```python
# pipeline/score_engine.py
import math
from anthropic import Anthropic

PLATFORM_WEIGHTS = {
    "airbnb": 0.30,
    "yeogi":  0.25,
    "yanolja": 0.20,
    "naver":  0.15,
    "kakao":  0.10,
}

class VinteeScoreEngine:

    def __init__(self, anthropic_client: Anthropic):
        self.client = anthropic_client

    def calculate(self, raw_records: list) -> dict:
        """
        raw_records: 동일 숙소의 멀티소스 원시 데이터 리스트
        returns: {
            avg_rating, review_volume, sentiment_score,
            theme_score, recency_score, vintee_score
        }
        """
        avg_rating = self._calc_avg_rating(raw_records)
        review_volume = self._calc_review_volume(raw_records)
        all_reviews = self._collect_all_reviews(raw_records)
        sentiment_score = self._calc_sentiment(all_reviews)
        theme_score = self._calc_theme_score(all_reviews)
        recency_score = self._calc_recency(all_reviews)

        vintee_score = (
            avg_rating        * 0.30 +
            review_volume     * 0.20 +
            sentiment_score   * 0.25 +
            theme_score       * 0.15 +
            recency_score     * 0.10
        )
        # 1.0 ~ 5.0 범위로 정규화
        vintee_score = max(1.0, min(5.0, vintee_score * 5.0))

        return {
            "avg_rating": round(avg_rating, 2),
            "review_volume": round(review_volume, 3),
            "sentiment_score": round(sentiment_score, 3),
            "theme_score": round(theme_score, 3),
            "recency_score": round(recency_score, 3),
            "vintee_score": round(vintee_score, 2),
        }

    def _calc_avg_rating(self, records: list) -> float:
        """플랫폼별 가중 평균 별점 (0~1 정규화)"""
        total_weight = 0
        weighted_sum = 0
        for r in records:
            w = PLATFORM_WEIGHTS.get(r.source, 0.1)
            if r.source_rating:
                weighted_sum += r.source_rating * w
                total_weight += w * 5.0  # 최대값 5.0
        return weighted_sum / total_weight if total_weight > 0 else 0

    def _calc_review_volume(self, records: list) -> float:
        """log 정규화 리뷰 수 (0~1)"""
        total = sum(r.review_count for r in records)
        MAX_REVIEWS = 1000  # 상한선
        return math.log(total + 1) / math.log(MAX_REVIEWS + 1)

    def _calc_sentiment(self, reviews: list) -> float:
        """Claude Haiku API로 한국어 감성 분석 (0~1)"""
        if not reviews:
            return 0.5

        # 최대 20개 리뷰 샘플로 비용 절감
        sample = reviews[:20]
        texts = "\n".join([r["text"] for r in sample if r.get("text")])

        response = self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": f"""다음 펜션 리뷰들의 전반적인 감성을 분석하여 0.0(매우 부정)~1.0(매우 긍정) 사이의 숫자만 반환하세요.

리뷰:
{texts}

숫자만 반환:"""
            }]
        )
        try:
            return float(response.content[0].text.strip())
        except:
            return 0.5

    def _calc_theme_score(self, reviews: list) -> float:
        """농촌 테마 키워드 매칭 밀도 (0~1)"""
        THEME_KEYWORDS = [
            "논", "농촌", "시골", "자연", "숲", "계곡", "별",
            "불멍", "아궁이", "텃밭", "농사", "힐링", "고요",
        ]
        if not reviews:
            return 0
        all_text = " ".join([r.get("text", "") for r in reviews])
        matches = sum(1 for kw in THEME_KEYWORDS if kw in all_text)
        return min(1.0, matches / len(THEME_KEYWORDS))

    def _calc_recency(self, reviews: list) -> float:
        """최근 6개월 리뷰 비중 (0~1)"""
        from datetime import datetime, timedelta
        if not reviews:
            return 0
        cutoff = datetime.now() - timedelta(days=180)
        recent = sum(1 for r in reviews
                    if r.get("date") and
                    datetime.fromisoformat(r["date"]) >= cutoff)
        return recent / len(reviews)
```

### 2.5 TagClassifier 설계

```python
# pipeline/tag_classifier.py

TAG_KEYWORDS = {
    "#논뷰맛집":    ["논", "논뷰", "rice field", "들판", "논밭"],
    "#불멍과별멍":  ["불멍", "캠프파이어", "별보기", "별멍", "모닥불"],
    "#아궁이체험":  ["아궁이", "장작", "전통 부뚜막"],
    "#농사체험":    ["농사", "모내기", "수확", "텃밭", "딸기 따기"],
    "#반려동물동반": ["반려견", "강아지", "펫", "동물 동반", "pet"],
    "#개별바베큐":  ["바베큐", "BBQ", "그릴", "숯불"],
    "#계곡앞":     ["계곡", "물놀이", "천", "계곡물"],
    "#산속힐링":   ["산속", "숲", "등산", "자연 속"],
    "#SNS맛집":    ["인스타", "포토존", "감성", "뷰맛집", "사진"],
    "#혼캉스":     ["혼자", "1인", "혼캉스", "solo", "혼행"],
}

class TagClassifier:

    def classify(self, reviews: list, name: str = "", amenities: list = None) -> list:
        """리뷰 + 이름 + 편의시설 기반 태그 분류"""
        all_text = " ".join([
            " ".join([r.get("text", "") for r in (reviews or [])]),
            name or "",
            " ".join(amenities or []),
        ]).lower()

        matched_tags = []
        for tag, keywords in TAG_KEYWORDS.items():
            if any(kw.lower() in all_text for kw in keywords):
                matched_tags.append(tag)

        return matched_tags
```

---

## 3. 데이터베이스 마이그레이션 설계 (DB Migration Design)

### 3.1 Prisma 스키마 추가

```prisma
// prisma/schema.prisma 에 추가

// 원시 크롤링 데이터
model RawCrawlResult {
  id           String   @id @default(cuid())
  source       String   @db.VarChar(20)    // 'naver'|'kakao'|'yanolja'|'yeogi'|'airbnb'|'blog'
  sourceId     String?  @db.VarChar(200)
  name         String   @db.VarChar(300)
  address      String?  @db.Text
  phone        String?  @db.VarChar(30)
  lat          Decimal? @db.Decimal(10, 7)
  lng          Decimal? @db.Decimal(10, 7)
  sourceRating Decimal? @db.Decimal(3, 2)
  reviewCount  Int      @default(0)
  rawReviews   Json?    // [{text, rating, date}]
  amenities    String[] // PostgreSQL Array
  extraData    Json?
  crawledAt    DateTime @default(now())
  isProcessed  Boolean  @default(false)

  @@map("raw_crawl_results")
  @@index([source])
  @@index([isProcessed])
  @@index([crawledAt])
}

// 정규화 + 점수 통합 데이터
model PropertyIntelligence {
  id             String   @id @default(cuid())
  name           String   @db.VarChar(300)
  address        String?  @db.Text
  region         String?  @db.VarChar(50)    // 시도 (강원도, 경기도...)
  subregion      String?  @db.VarChar(50)    // 시군구
  lat            Decimal? @db.Decimal(10, 7)
  lng            Decimal? @db.Decimal(10, 7)
  phone          String?  @db.VarChar(30)

  // VINTEE Score 구성요소
  avgRating      Decimal? @db.Decimal(3, 2)
  totalReviews   Int?
  sentimentScore Decimal? @db.Decimal(4, 3)  // 0.000~1.000
  themeScore     Decimal? @db.Decimal(4, 3)
  recencyScore   Decimal? @db.Decimal(4, 3)
  vinteeScore    Decimal? @db.Decimal(3, 2)  // 1.0~5.0

  // 태그 & 영입 상태
  autoTags       String[] // PostgreSQL GIN index
  isRecruited    Boolean  @default(false)
  recruitNote    String?  @db.Text
  recruitedAt    DateTime?

  // 소스 ID 매핑
  naverId        String?  @db.VarChar(200)
  kakaoId        String?  @db.VarChar(200)
  yanoljaId      String?  @db.VarChar(200)
  yeogiId        String?  @db.VarChar(200)
  airbnbId       String?  @db.VarChar(200)

  // 이미지 (Phase 2)
  thumbnailUrl   String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("property_intelligence")
  @@index([region])
  @@index([vinteeScore(sort: Desc)])
  @@index([isRecruited])
}
```

### 3.2 마이그레이션 명령어

```bash
# 마이그레이션 생성
npx prisma migrate dev --name add_intelligence_pipeline

# 프로덕션 적용
npx prisma migrate deploy

# Prisma Client 재생성
npx prisma generate
```

---

## 4. Admin UI 설계 (Next.js `/admin/intelligence`)

### 4.1 페이지 구조

```
src/app/admin/intelligence/
├── page.tsx                  # 인텔리전스 대시보드 (목록 + 필터)
├── [id]/
│   └── page.tsx              # 개별 숙소 상세 (Score 분석 + CRM)
└── _components/
    ├── IntelligenceTable.tsx  # 데이터 테이블 (정렬/필터)
    ├── ScoreBreakdown.tsx     # VINTEE Score 분해도
    ├── TagBadgeList.tsx       # 자동 태그 표시
    ├── RecruitStatusBadge.tsx # 영입 상태 배지
    ├── FilterPanel.tsx        # 필터 패널 (지역/점수/태그/영입상태)
    ├── RegionMap.tsx          # 지역별 현황 지도 (Phase 2)
    └── CrawlStatusCard.tsx    # 크롤링 현황 카드
```

### 4.2 대시보드 화면 와이어프레임

```
┌──────────────────────────────────────────────────────────────────────┐
│  VINTEE Admin  >  Intelligence Dashboard                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 총 수집 숙소 │ │ VINTEE 4.0+ │ │  미영입 고점  │ │ 마지막 크롤링│   │
│  │   12,430    │ │   3,212개  │ │  1,847개    │ │  2시간 전   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                      │
│  [지역 ▼] [점수 ▼] [태그 ▼] [영입상태 ▼] [검색___________] [내보내기]│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 숙소명        │ 지역   │ VINTEE점 │ 태그         │ 영입  │ 상세│   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ 산너머 논뷰펜션│ 강원 횡성│  4.82  │ #논뷰 #불멍  │ 미영입│ →  │   │
│  │ 별밭 농장     │ 충남 홍성│  4.71  │ #농사 #반려  │ 영입완│ →  │   │
│  │ 계곡 숲속 펜션 │ 경북 영주│  4.65  │ #계곡 #SNS  │ 미영입│ →  │   │
│  │ ...           │ ...    │  ...   │ ...          │ ...   │ →  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  [< 이전] 1 2 3 ... 124 [다음 >]                                     │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.3 숙소 상세 + CRM 와이어프레임

```
┌──────────────────────────────────────────────────────────────────────┐
│  VINTEE Admin  >  Intelligence  >  산너머 논뷰펜션                     │
├────────────────────────────┬─────────────────────────────────────────┤
│  📍 기본 정보               │  🎯 VINTEE Score 분석                    │
│  이름: 산너머 논뷰펜션       │  ━━━━━━━━━━━━━━━━━━━━━━━━  4.82        │
│  주소: 강원도 횡성군 ...     │                                         │
│  전화: 010-xxxx-xxxx        │  별점 가중치  ████████░  0.87 × 0.30    │
│  지역: 강원도 / 횡성군       │  리뷰 볼륨   ██████░░░  0.72 × 0.20    │
│                            │  감성 분석   █████████  0.91 × 0.25    │
│  🏷️ 자동 태그               │  테마 점수   ████████░  0.83 × 0.15    │
│  #논뷰맛집 #불멍과별멍       │  최신성      ███████░░  0.75 × 0.10    │
│  #반려동물동반               │                                         │
│                            │  📊 소스별 현황                          │
│  📋 소스 매핑               │  네이버: ⭐4.7 (리뷰 342개)              │
│  네이버: 12345678           │  에어비앤비: ⭐4.9 (리뷰 87개)           │
│  에어비앤비: abc123xyz       │  야놀자: ⭐4.8 (리뷰 213개)             │
├────────────────────────────┴─────────────────────────────────────────┤
│  🤝 호스트 영입 CRM                                                    │
│                                                                      │
│  영입 상태: [미영입 ▼]                                                │
│                                                                      │
│  메모:  ┌──────────────────────────────────────────────────────┐     │
│         │ 2026-03-01 전화 시도 → 부재중                         │     │
│         │                                                      │     │
│         └──────────────────────────────────────────────────────┘     │
│                                                [저장]  [영입 완료 처리]│
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. API 명세 (Admin API Spec)

### 5.1 인텔리전스 목록 API

```
GET /api/admin/intelligence
Authorization: Clerk (ADMIN role required)

Query Parameters:
  - region?: string          // '강원도', '경기도' 등
  - subregion?: string       // '횡성군'
  - min_score?: number       // 최소 VINTEE Score (1.0~5.0)
  - max_score?: number       // 최대 VINTEE Score
  - tags?: string[]          // ['#논뷰맛집', '#불멍과별멍']
  - is_recruited?: boolean   // 영입 완료 여부
  - search?: string          // 숙소명 검색
  - sort?: 'vintee_score' | 'review_count' | 'created_at'  // 정렬
  - order?: 'asc' | 'desc'
  - page?: number            // 기본 1
  - limit?: number           // 기본 20, 최대 100

Response 200:
{
  "data": [
    {
      "id": "clxxx",
      "name": "산너머 논뷰펜션",
      "region": "강원도",
      "subregion": "횡성군",
      "vinteeScore": 4.82,
      "totalReviews": 642,
      "autoTags": ["#논뷰맛집", "#불멍과별멍"],
      "isRecruited": false,
      "phone": "010-xxxx-xxxx",
      "thumbnailUrl": null,
      "updatedAt": "2026-03-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 12430,
    "page": 1,
    "limit": 20,
    "totalPages": 622
  },
  "stats": {
    "totalCount": 12430,
    "highScoreCount": 3212,    // 4.0 이상
    "recruitedCount": 583,
    "lastCrawledAt": "2026-03-01T10:00:00Z"
  }
}
```

### 5.2 인텔리전스 상세 API

```
GET /api/admin/intelligence/[id]
Authorization: Clerk (ADMIN role required)

Response 200:
{
  "id": "clxxx",
  "name": "산너머 논뷰펜션",
  "address": "강원도 횡성군 ...",
  "region": "강원도",
  "subregion": "횡성군",
  "lat": 37.123456,
  "lng": 127.654321,
  "phone": "010-xxxx-xxxx",

  "scoreBreakdown": {
    "avgRating": 0.87,
    "reviewVolume": 0.72,
    "sentimentScore": 0.91,
    "themeScore": 0.83,
    "recencyScore": 0.75,
    "vinteeScore": 4.82
  },

  "sourceData": [
    { "source": "naver", "rating": 4.7, "reviewCount": 342, "sourceId": "12345678" },
    { "source": "airbnb", "rating": 4.9, "reviewCount": 87, "sourceId": "abc123" }
  ],

  "autoTags": ["#논뷰맛집", "#불멍과별멍", "#반려동물동반"],

  "recruitStatus": {
    "isRecruited": false,
    "recruitNote": "2026-03-01 전화 시도 → 부재중",
    "recruitedAt": null
  }
}
```

### 5.3 영입 상태 업데이트 API

```
PATCH /api/admin/intelligence/[id]/recruit
Authorization: Clerk (ADMIN role required)

Request Body:
{
  "isRecruited": true,
  "recruitNote": "2026-03-02 계약 완료 - 3월 입점 예정"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "clxxx",
    "isRecruited": true,
    "recruitNote": "...",
    "recruitedAt": "2026-03-02T09:00:00Z"
  }
}
```

### 5.4 크롤링 현황 API

```
GET /api/admin/intelligence/crawl-status
Authorization: Clerk (ADMIN role required)

Response 200:
{
  "lastRun": {
    "startedAt": "2026-03-01T02:00:00Z",
    "completedAt": "2026-03-01T06:30:00Z",
    "totalCrawled": 1247,
    "newProperties": 83,
    "updatedProperties": 1164,
    "errors": 12
  },
  "sourceStats": [
    { "source": "naver", "count": 8234, "lastCrawled": "2026-03-01T06:00:00Z" },
    { "source": "kakao", "count": 7821, "lastCrawled": "2026-03-01T05:30:00Z" },
    { "source": "yanolja", "count": 6103, "lastCrawled": "2026-03-01T05:00:00Z" }
  ],
  "nextRun": "2026-03-08T02:00:00Z"
}
```

---

## 6. Docker & 배포 설계

### 6.1 crawler Dockerfile

```dockerfile
# backend/crawler/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Playwright 브라우저 의존성
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Playwright 브라우저 설치
RUN playwright install chromium

COPY . .

CMD ["python", "main.py"]
```

### 6.2 requirements.txt

```
playwright==1.40.0
httpx==0.26.0
beautifulsoup4==4.12.3
lxml==5.1.0
rapidfuzz==3.6.1
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
anthropic==0.18.1
apscheduler==3.10.4
python-dotenv==1.0.1
pydantic==2.6.1
structlog==24.1.0
```

### 6.3 docker-compose.yml (기존 VINTEE docker-compose.yml 확장)

```yaml
# 기존 vintee 서비스에 추가

  crawler:
    build:
      context: ./backend/crawler
      dockerfile: Dockerfile
    container_name: vintee-crawler
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - CRAWL_SCHEDULE_FULL=0 2 * * 0      # 매주 일요일 새벽 2시
      - CRAWL_SCHEDULE_INCREMENTAL=0 3 * * *  # 매일 새벽 3시 증분
      - LOG_LEVEL=INFO
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - vintee-network
```

---

## 7. Prisma 마이그레이션 파일

```sql
-- prisma/migrations/TIMESTAMP_add_intelligence_pipeline/migration.sql

-- CreateTable raw_crawl_results
CREATE TABLE "raw_crawl_results" (
    "id" TEXT NOT NULL,
    "source" VARCHAR(20) NOT NULL,
    "sourceId" VARCHAR(200),
    "name" VARCHAR(300) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(30),
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "sourceRating" DECIMAL(3,2),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "rawReviews" JSONB,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extraData" JSONB,
    "crawledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "raw_crawl_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable property_intelligence
CREATE TABLE "property_intelligence" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "address" TEXT,
    "region" VARCHAR(50),
    "subregion" VARCHAR(50),
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "phone" VARCHAR(30),
    "avgRating" DECIMAL(3,2),
    "totalReviews" INTEGER,
    "sentimentScore" DECIMAL(4,3),
    "themeScore" DECIMAL(4,3),
    "recencyScore" DECIMAL(4,3),
    "vinteeScore" DECIMAL(3,2),
    "autoTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isRecruited" BOOLEAN NOT NULL DEFAULT false,
    "recruitNote" TEXT,
    "recruitedAt" TIMESTAMP(3),
    "naverId" VARCHAR(200),
    "kakaoId" VARCHAR(200),
    "yanoljaId" VARCHAR(200),
    "yeogiId" VARCHAR(200),
    "airbnbId" VARCHAR(200),
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "raw_crawl_results_source_idx" ON "raw_crawl_results"("source");
CREATE INDEX "raw_crawl_results_isProcessed_idx" ON "raw_crawl_results"("isProcessed");
CREATE INDEX "property_intelligence_region_idx" ON "property_intelligence"("region");
CREATE INDEX "property_intelligence_vinteeScore_idx" ON "property_intelligence"("vinteeScore" DESC);
CREATE INDEX "property_intelligence_isRecruited_idx" ON "property_intelligence"("isRecruited");
CREATE INDEX "property_intelligence_autoTags_idx" ON "property_intelligence" USING GIN ("autoTags");
```

---

## 8. 구현 순서 (Implementation Order)

### Sprint 1 — 크롤러 인프라 + 네이버 (1주차)

**Step 1: DB 마이그레이션**
```
1. prisma/schema.prisma 에 RawCrawlResult, PropertyIntelligence 추가
2. npx prisma migrate dev --name add_intelligence_pipeline
3. npx prisma generate
```

**Step 2: Python 크롤러 기본 구조**
```
1. backend/crawler/ 디렉토리 생성
2. requirements.txt 작성
3. Dockerfile 작성
4. db/models.py, db/session.py (SQLAlchemy)
5. adapters/base.py (BaseCrawler 추상 클래스)
6. utils/ (logger, rate_limiter, user_agent)
```

**Step 3: 네이버 크롤러 구현**
```
1. adapters/naver.py
2. 강원도 펜션 1,000개 파일럿 테스트
3. raw_crawl_results 테이블 저장 검증
```

**Step 4: 정규화 파이프라인 기본**
```
1. pipeline/normalizer.py
2. 중복 제거 로직 (rapidfuzz)
3. 지역 파싱 (utils/address_parser.py)
```

### Sprint 2 — 멀티소스 크롤러 (2주차)

```
1. adapters/kakao.py
2. adapters/yanolja.py
3. adapters/yeogi.py
4. adapters/airbnb.py (공개 데이터)
5. adapters/blog.py (키워드 기반)
6. main.py 스케줄러 통합
```

### Sprint 3 — Score 엔진 + Admin API (3주차)

```
1. pipeline/score_engine.py (Claude Haiku 연동)
2. pipeline/tag_classifier.py
3. property_intelligence 테이블 저장
4. src/app/api/admin/intelligence/ API 구현
5. Admin 인증 미들웨어 (ADMIN role 체크)
```

### Sprint 4 — Admin UI (4주차)

```
1. src/app/admin/intelligence/page.tsx
2. src/app/admin/intelligence/[id]/page.tsx
3. _components/ 컴포넌트들
4. 호스트 영입 CRM 기능
5. 전체 통합 테스트
```

---

## 9. 보안 설계 (Security Design)

### 9.1 Admin 접근 제어

```typescript
// src/middleware.ts 수정 필요
// /admin/* 경로는 ADMIN role 사용자만 접근

// src/app/api/admin/intelligence/route.ts
import { auth } from "@clerk/nextjs";

export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  // DB에서 user role 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  if (user?.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }
  // ...
}
```

### 9.2 크롤러 법적 안전장치

```python
# config.py
CRAWL_CONFIG = {
    "delay_min": 3,        # 최소 3초 딜레이
    "delay_max": 5,        # 최대 5초 딜레이
    "max_requests_per_hour": 300,   # 시간당 최대 요청
    "respect_robots_txt": True,     # robots.txt 준수
    "store_source": True,           # 출처 반드시 기록
    "internal_only": True,          # 내부 분석 전용
}

# 수집 데이터 라벨링
# source: 수집 출처 반드시 기록
# data_usage: "internal_analysis_only"
```

---

## 10. 테스트 설계 (Test Design)

### 단위 테스트

```python
# tests/test_score_engine.py
def test_vintee_score_calculation():
    engine = VinteeScoreEngine(mock_anthropic_client)
    records = [
        MockRecord(source="naver", source_rating=4.5, review_count=200),
        MockRecord(source="airbnb", source_rating=4.8, review_count=50),
    ]
    result = engine.calculate(records)
    assert 1.0 <= result["vintee_score"] <= 5.0
    assert 0.0 <= result["sentiment_score"] <= 1.0

# tests/test_normalizer.py
def test_duplicate_removal():
    normalizer = Normalizer()
    records = [
        {"name": "산너머 논뷰 펜션", "address": "강원도 횡성군 갑천면 ..."},
        {"name": "산너머논뷰펜션",   "address": "강원도 횡성군 갑천면 ..."},
    ]
    result = normalizer.deduplicate(records)
    assert len(result) == 1  # 중복 제거
```

### API 통합 테스트

```typescript
// tests/api/admin-intelligence.test.ts
describe("GET /api/admin/intelligence", () => {
  it("ADMIN 유저만 접근 가능", async () => {
    // ...
  });
  it("지역 필터가 작동한다", async () => {
    // ...
  });
  it("VINTEE Score 정렬이 작동한다", async () => {
    // ...
  });
});
```

---

## 11. 성공 기준 (Definition of Done)

- [ ] `npx prisma migrate dev` 성공 — 두 테이블 생성 완료
- [ ] 네이버 크롤러로 강원도 펜션 1,000개 수집 성공
- [ ] VINTEE Score 1.0~5.0 범위 내 산출 검증
- [ ] `/api/admin/intelligence` API 응답 200 OK
- [ ] Admin UI 페이지 렌더링 정상
- [ ] 영입 상태 PATCH API 작동 확인
- [ ] Docker 컨테이너 독립 실행 가능

---

**[Plan] ✅ → [Design] ✅ → [Do] → [Check] → [Act]**

다음 단계: `/pdca do pension-crawler` 실행하여 구현 시작
