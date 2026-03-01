"""
카카오맵 크롤러
카카오 로컬 API (공개 키워드 검색)
"""
from typing import Optional
import httpx
from .base import BaseCrawler, RawProperty
from utils import get_logger

logger = get_logger(__name__)

KAKAO_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"


class KakaoCrawler(BaseCrawler):
    """카카오맵 펜션 크롤러"""

    SOURCE_NAME = "kakao"
    MAX_PAGES = 3

    async def search_pensions(self, region: str) -> list[RawProperty]:
        """카카오 로컬 API로 펜션 검색"""
        properties = []
        query = f"{region} 펜션"

        # 카카오 API 키 없이 웹 스크래핑 방식 사용
        async with httpx.AsyncClient(headers=self._get_headers(), timeout=30) as client:
            for page in range(1, self.MAX_PAGES + 1):
                try:
                    await self._rate_limiter.acquire()
                    resp = await client.get(
                        "https://map.kakao.com/place/searchKeyword.json",
                        params={"q": query, "page": page, "size": 30},
                    )
                    if resp.status_code != 200:
                        break

                    data = resp.json()
                    places = data.get("place", {}).get("list", [])
                    if not places:
                        break

                    for place in places:
                        prop = RawProperty(
                            source=self.SOURCE_NAME,
                            source_id=str(place.get("id", "")),
                            name=place.get("name", ""),
                            address=place.get("address", {}).get("road") or place.get("address", {}).get("jibun"),
                            phone=place.get("phone"),
                            lat=float(place["y"]) if place.get("y") else None,
                            lng=float(place["x"]) if place.get("x") else None,
                            source_rating=float(place["point"]["score"]) if place.get("point", {}).get("score") else None,
                            review_count=int(place.get("commentCount", 0)),
                        )
                        properties.append(prop)

                except Exception as e:
                    logger.warning("카카오 검색 오류", page=page, error=str(e))
                    break

        return properties

    async def get_detail(self, source_id: str) -> Optional[RawProperty]:
        """카카오맵 상세 정보"""
        if not source_id:
            return None
        try:
            async with httpx.AsyncClient(headers=self._get_headers(), timeout=30) as client:
                resp = await client.get(
                    f"https://place.map.kakao.com/main/v/{source_id}"
                )
                if resp.status_code != 200:
                    return None
                # HTML 파싱 로직 (추후 BeautifulSoup 적용)
                return None  # TODO: 파싱 구현
        except Exception as e:
            logger.warning("카카오 상세 수집 실패", source_id=source_id, error=str(e))
            return None

    async def get_reviews(self, source_id: str, limit: int = 50) -> list[dict]:
        """카카오맵 리뷰 수집"""
        reviews = []
        try:
            async with httpx.AsyncClient(headers=self._get_headers(), timeout=30) as client:
                resp = await client.get(
                    f"https://place.map.kakao.com/commentlist/v/{source_id}",
                    params={"page": 1, "size": min(limit, 30)},
                )
                if resp.status_code != 200:
                    return reviews

                data = resp.json()
                for item in data.get("comment", {}).get("list", []):
                    reviews.append({
                        "text": item.get("contents", ""),
                        "rating": item.get("point"),
                        "date": item.get("commentDatetime"),
                    })
        except Exception as e:
            logger.warning("카카오 리뷰 수집 실패", source_id=source_id, error=str(e))

        return reviews
