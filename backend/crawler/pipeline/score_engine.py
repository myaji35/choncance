"""
VINTEE Score 엔진
멀티소스 가중 평균 + Claude Haiku NLP 감성분석
"""
import math
from datetime import datetime, timedelta
from anthropic import Anthropic
from config import PLATFORM_WEIGHTS
from utils import get_logger

logger = get_logger(__name__)

# 감성분석 샘플 수 (비용 최적화)
SENTIMENT_SAMPLE_SIZE = 20
# 리뷰 볼륨 정규화 상한
MAX_REVIEWS = 1000


class VinteeScoreEngine:
    """VINTEE Score 산출 엔진"""

    def __init__(self, anthropic_api_key: str):
        self._client = Anthropic(api_key=anthropic_api_key) if anthropic_api_key else None

    def calculate(self, raw_records: list[dict]) -> dict:
        """
        raw_records: 동일 숙소의 멀티소스 원시 데이터 리스트
        returns: Score 구성요소 dict
        """
        all_reviews = self._collect_all_reviews(raw_records)

        avg_rating = self._calc_avg_rating(raw_records)
        review_volume = self._calc_review_volume(raw_records)
        sentiment_score = self._calc_sentiment(all_reviews)
        theme_score = self._calc_theme_score(all_reviews)
        recency_score = self._calc_recency(all_reviews)

        # VINTEE Score = 가중합 (0~1 구성요소) → 1.0~5.0으로 스케일
        raw_score = (
            avg_rating      * 0.30 +
            review_volume   * 0.20 +
            sentiment_score * 0.25 +
            theme_score     * 0.15 +
            recency_score   * 0.10
        )
        vintee_score = round(max(1.0, min(5.0, 1.0 + raw_score * 4.0)), 2)

        return {
            "avg_rating": round(avg_rating, 3),
            "review_volume": round(review_volume, 3),
            "sentiment_score": round(sentiment_score, 3),
            "theme_score": round(theme_score, 3),
            "recency_score": round(recency_score, 3),
            "vintee_score": vintee_score,
            "total_reviews": sum(r.get("review_count", 0) for r in raw_records),
        }

    def _calc_avg_rating(self, records: list[dict]) -> float:
        """플랫폼별 가중 평균 별점 (0~1 정규화)"""
        total_weight = 0.0
        weighted_sum = 0.0

        for r in records:
            source = r.get("source", "naver")
            w = PLATFORM_WEIGHTS.get(source, 0.10)
            rating = r.get("source_rating") or r.get("avg_rating")
            if rating:
                weighted_sum += float(rating) * w
                total_weight += 5.0 * w  # 최대 별점 5.0

        if total_weight == 0:
            return 0.6  # 기본값 (데이터 없을 때)
        return weighted_sum / total_weight

    def _calc_review_volume(self, records: list[dict]) -> float:
        """log 정규화 리뷰 수 (0~1)"""
        total = sum(int(r.get("review_count", 0) or 0) for r in records)
        return math.log(total + 1) / math.log(MAX_REVIEWS + 1)

    def _collect_all_reviews(self, records: list[dict]) -> list[dict]:
        """전체 리뷰 통합"""
        all_reviews = []
        for r in records:
            reviews = r.get("raw_reviews") or []
            if isinstance(reviews, list):
                all_reviews.extend(reviews)
        return all_reviews

    def _calc_sentiment(self, reviews: list[dict]) -> float:
        """Claude Haiku API로 한국어 감성 분석 (0~1)"""
        if not reviews or not self._client:
            return 0.6  # API 없으면 중립값

        sample = reviews[:SENTIMENT_SAMPLE_SIZE]
        texts = "\n".join([
            r.get("text", "")[:200]  # 리뷰당 최대 200자
            for r in sample
            if r.get("text")
        ])

        if not texts.strip():
            return 0.6

        try:
            response = self._client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=50,
                messages=[{
                    "role": "user",
                    "content": (
                        f"다음 펜션 리뷰들의 전반적인 감성을 분석하여 "
                        f"0.0(매우 부정)~1.0(매우 긍정) 사이의 숫자만 반환하세요.\n\n"
                        f"리뷰:\n{texts}\n\n숫자만:"
                    ),
                }],
            )
            score = float(response.content[0].text.strip())
            return max(0.0, min(1.0, score))
        except Exception as e:
            logger.warning("감성분석 실패, 기본값 사용", error=str(e))
            return 0.6

    def _calc_theme_score(self, reviews: list[dict]) -> float:
        """농촌 테마 키워드 매칭 밀도 (0~1)"""
        THEME_KEYWORDS = [
            "논", "농촌", "시골", "자연", "숲", "계곡", "별",
            "불멍", "아궁이", "텃밭", "농사", "힐링", "고요",
            "산속", "전통", "민박", "촌캉스",
        ]
        if not reviews:
            return 0.3

        all_text = " ".join([r.get("text", "") for r in reviews]).lower()
        matches = sum(1 for kw in THEME_KEYWORDS if kw in all_text)
        return min(1.0, matches / max(len(THEME_KEYWORDS) * 0.5, 1))

    def _calc_recency(self, reviews: list[dict]) -> float:
        """최근 6개월 리뷰 비중 (0~1)"""
        if not reviews:
            return 0.5

        cutoff = datetime.now() - timedelta(days=180)
        recent_count = 0

        for r in reviews:
            date_str = r.get("date")
            if date_str:
                try:
                    review_date = datetime.fromisoformat(str(date_str)[:19])
                    if review_date >= cutoff:
                        recent_count += 1
                except (ValueError, TypeError):
                    pass

        return recent_count / len(reviews)
