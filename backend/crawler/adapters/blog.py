"""네이버 블로그 키워드 크롤러 (스텁 — Sprint 2에서 완성)"""
from typing import Optional
from .base import BaseCrawler, RawProperty


class BlogCrawler(BaseCrawler):
    """네이버 블로그에서 펜션 언급 수집"""
    SOURCE_NAME = "blog"

    async def search_pensions(self, region: str) -> list[RawProperty]:
        return []  # TODO: Sprint 2

    async def get_detail(self, source_id: str) -> Optional[RawProperty]:
        return None  # TODO: Sprint 2

    async def get_reviews(self, source_id: str, limit: int = 50) -> list[dict]:
        return []  # TODO: Sprint 2
