"""여기어때 크롤러 (스텁 — Sprint 2에서 완성)"""
from typing import Optional
from .base import BaseCrawler, RawProperty


class YeogiCrawler(BaseCrawler):
    SOURCE_NAME = "yeogi"

    async def search_pensions(self, region: str) -> list[RawProperty]:
        return []  # TODO: Sprint 2

    async def get_detail(self, source_id: str) -> Optional[RawProperty]:
        return None  # TODO: Sprint 2

    async def get_reviews(self, source_id: str, limit: int = 50) -> list[dict]:
        return []  # TODO: Sprint 2
