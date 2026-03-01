"""
네이버 플레이스 크롤러
Playwright로 JS 렌더링 처리
"""
import json
import re
from typing import Optional
import httpx
from playwright.async_api import async_playwright, Page
from .base import BaseCrawler, RawProperty
from utils import get_logger

logger = get_logger(__name__)

NAVER_SEARCH_URL = "https://map.naver.com/v5/api/search"
NAVER_PLACE_URL = "https://place.map.naver.com/place/v1/summary/"
NAVER_REVIEW_URL = "https://place.map.naver.com/place/v1/comment/visitor"


class NaverCrawler(BaseCrawler):
    """네이버 플레이스 펜션 크롤러"""

    SOURCE_NAME = "naver"
    MAX_PAGES = 5  # 검색 결과 최대 5페이지 수집

    async def search_pensions(self, region: str) -> list[RawProperty]:
        """네이버 플레이스 API로 지역별 펜션 검색"""
        properties = []
        query = f"{region} 펜션"

        async with httpx.AsyncClient(headers=self._get_headers(), timeout=30) as client:
            for page in range(1, self.MAX_PAGES + 1):
                try:
                    await self._rate_limiter.acquire()
                    params = {
                        "query": query,
                        "type": "place",
                        "searchCoord": "",
                        "displayCount": 40,
                        "isPlaceRecommendationReplace": "true",
                        "lang": "ko",
                        "page": page,
                    }
                    resp = await client.get(NAVER_SEARCH_URL, params=params)
                    if resp.status_code != 200:
                        break

                    data = resp.json()
                    places = (
                        data.get("result", {})
                        .get("place", {})
                        .get("list", [])
                    )
                    if not places:
                        break

                    for place in places:
                        prop = RawProperty(
                            source=self.SOURCE_NAME,
                            source_id=place.get("id"),
                            name=place.get("name", ""),
                            address=place.get("roadAddress") or place.get("address"),
                            phone=place.get("phone"),
                            lat=float(place["y"]) if place.get("y") else None,
                            lng=float(place["x"]) if place.get("x") else None,
                            source_rating=float(place["reviewScore"]) if place.get("reviewScore") else None,
                            review_count=int(place.get("reviewCount", 0)),
                        )
                        properties.append(prop)

                except Exception as e:
                    logger.warning("네이버 검색 오류", page=page, error=str(e))
                    break

        logger.info("네이버 검색 완료", region=region, count=len(properties))
        return properties

    async def get_detail(self, source_id: str) -> Optional[RawProperty]:
        """네이버 플레이스 상세 정보 API 호출"""
        if not source_id:
            return None

        try:
            async with httpx.AsyncClient(headers=self._get_headers(), timeout=30) as client:
                resp = await client.get(f"{NAVER_PLACE_URL}{source_id}")
                if resp.status_code != 200:
                    return None

                data = resp.json()
                result = data.get("result", {})

                amenities = []
                for facility in result.get("facility", {}).get("items", []):
                    amenities.append(facility.get("name", ""))

                return RawProperty(
                    source=self.SOURCE_NAME,
                    source_id=source_id,
                    name=result.get("name", ""),
                    address=result.get("roadAddress") or result.get("address"),
                    phone=result.get("phone"),
                    lat=float(result["y"]) if result.get("y") else None,
                    lng=float(result["x"]) if result.get("x") else None,
                    source_rating=float(result["reviewScore"]) if result.get("reviewScore") else None,
                    review_count=int(result.get("reviewCount", 0)),
                    amenities=amenities,
                    extra_data={
                        "category": result.get("category"),
                        "imageUrl": result.get("imageUrl"),
                        "businessHours": result.get("businessHours"),
                    },
                )
        except Exception as e:
            logger.warning("네이버 상세 수집 실패", source_id=source_id, error=str(e))
            return None

    async def get_reviews(self, source_id: str, limit: int = 50) -> list[dict]:
        """네이버 방문자 리뷰 수집"""
        reviews = []
        if not source_id:
            return reviews

        try:
            async with httpx.AsyncClient(headers=self._get_headers(), timeout=30) as client:
                params = {
                    "id": source_id,
                    "page": 1,
                    "display": min(limit, 50),
                    "lang": "ko",
                }
                resp = await client.get(NAVER_REVIEW_URL, params=params)
                if resp.status_code != 200:
                    return reviews

                data = resp.json()
                for item in data.get("result", {}).get("items", []):
                    reviews.append({
                        "text": item.get("body", ""),
                        "rating": item.get("rating"),
                        "date": item.get("created"),
                    })

        except Exception as e:
            logger.warning("네이버 리뷰 수집 실패", source_id=source_id, error=str(e))

        return reviews
