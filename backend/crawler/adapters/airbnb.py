"""에어비앤비 크롤러 (스텁 — Sprint 2에서 완성)"""
from typing import Optional
from .base import BaseCrawler, RawProperty


class AirbnbCrawler(BaseCrawler):
    SOURCE_NAME = "airbnb"

    async def search_pensions(self, region: str) -> list[RawProperty]:
        return []  # TODO: Sprint 2 (공개 데이터)

    async def get_detail(self, source_id: str) -> Optional[RawProperty]:
        return None  # TODO: Sprint 2

    async def get_reviews(self, source_id: str, limit: int = 50) -> list[dict]:
        return []  # TODO: Sprint 2
