"""
BaseCrawler 추상 클래스
모든 플랫폼 크롤러는 이 클래스를 상속
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
from utils import get_logger, RateLimiter, get_random_user_agent

logger = get_logger(__name__)


@dataclass
class RawProperty:
    """크롤링 원시 데이터 표준 구조"""
    source: str                        # 'naver'|'kakao'|'yanolja'|'yeogi'|'airbnb'|'blog'
    name: str
    source_id: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    source_rating: Optional[float] = None
    review_count: int = 0
    raw_reviews: list = field(default_factory=list)  # [{text, rating, date}]
    amenities: list = field(default_factory=list)
    extra_data: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "source": self.source,
            "source_id": self.source_id,
            "name": self.name,
            "address": self.address,
            "phone": self.phone,
            "lat": self.lat,
            "lng": self.lng,
            "source_rating": self.source_rating,
            "review_count": self.review_count,
            "raw_reviews": self.raw_reviews,
            "amenities": self.amenities,
            "extra_data": self.extra_data,
        }


class BaseCrawler(ABC):
    """모든 크롤러의 추상 기본 클래스"""

    SOURCE_NAME: str = ""  # 서브클래스에서 반드시 정의

    def __init__(self):
        self._rate_limiter = RateLimiter()
        self._logger = get_logger(self.__class__.__name__)

    def _get_headers(self) -> dict:
        return {"User-Agent": get_random_user_agent()}

    @abstractmethod
    async def search_pensions(self, region: str) -> list[RawProperty]:
        """지역별 펜션 검색"""
        pass

    @abstractmethod
    async def get_detail(self, source_id: str) -> Optional[RawProperty]:
        """숙소 상세 정보 수집"""
        pass

    @abstractmethod
    async def get_reviews(self, source_id: str, limit: int = 50) -> list[dict]:
        """리뷰 수집. 반환: [{text, rating, date}]"""
        pass

    async def crawl_region(self, region: str) -> list[RawProperty]:
        """
        공통 크롤링 플로우:
        지역 검색 → 상세 수집 → 리뷰 수집
        """
        self._logger.info("크롤링 시작", source=self.SOURCE_NAME, region=region)
        results = []
        errors = []

        try:
            properties = await self.search_pensions(region)
            self._logger.info(f"검색 완료", count=len(properties), region=region)

            for prop in properties:
                try:
                    await self._rate_limiter.acquire()
                    detail = await self.get_detail(prop.source_id)
                    if detail:
                        await self._rate_limiter.acquire()
                        detail.raw_reviews = await self.get_reviews(prop.source_id)
                        results.append(detail)
                except Exception as e:
                    self._logger.warning("상세 수집 실패", source_id=prop.source_id, error=str(e))
                    errors.append({"source_id": prop.source_id, "error": str(e)})

        except Exception as e:
            self._logger.error("크롤링 실패", source=self.SOURCE_NAME, region=region, error=str(e))
            raise

        self._logger.info(
            "크롤링 완료",
            source=self.SOURCE_NAME,
            region=region,
            success=len(results),
            errors=len(errors),
        )
        return results
