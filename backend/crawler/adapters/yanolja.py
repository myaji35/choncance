"""
야놀자 크롤러
Playwright 기반 (JS 렌더링 필요)
"""
from typing import Optional
from playwright.async_api import async_playwright
from .base import BaseCrawler, RawProperty
from utils import get_logger

logger = get_logger(__name__)


class YanoljaCrawler(BaseCrawler):
    """야놀자 펜션 크롤러 (Playwright)"""

    SOURCE_NAME = "yanolja"
    SEARCH_URL = "https://www.yanolja.com/search?query={region}+펜션&category=pension"

    async def search_pensions(self, region: str) -> list[RawProperty]:
        """야놀자 검색 결과 수집"""
        properties = []
        url = self.SEARCH_URL.format(region=region)

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent=self._get_headers()["User-Agent"]
                )
                page = await context.new_page()

                await page.goto(url, wait_until="networkidle", timeout=30000)
                await self._rate_limiter.acquire()

                # 검색 결과 아이템 수집
                items = await page.query_selector_all("[data-testid='search-item']")

                for item in items[:30]:  # 최대 30개
                    try:
                        name_el = await item.query_selector("[data-testid='property-name']")
                        name = await name_el.inner_text() if name_el else ""

                        rating_el = await item.query_selector("[data-testid='rating-score']")
                        rating_text = await rating_el.inner_text() if rating_el else ""
                        rating = float(rating_text) if rating_text else None

                        link_el = await item.query_selector("a")
                        href = await link_el.get_attribute("href") if link_el else ""
                        source_id = href.split("/")[-1].split("?")[0] if href else ""

                        prop = RawProperty(
                            source=self.SOURCE_NAME,
                            source_id=source_id,
                            name=name,
                            source_rating=rating,
                        )
                        properties.append(prop)

                    except Exception as e:
                        logger.warning("야놀자 아이템 파싱 실패", error=str(e))

                await browser.close()

        except Exception as e:
            logger.error("야놀자 검색 실패", region=region, error=str(e))

        return properties

    async def get_detail(self, source_id: str) -> Optional[RawProperty]:
        """야놀자 숙소 상세 수집"""
        if not source_id:
            return None
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page(
                    user_agent=self._get_headers()["User-Agent"]
                )
                url = f"https://www.yanolja.com/pension/{source_id}"
                await page.goto(url, wait_until="networkidle", timeout=30000)

                name_el = await page.query_selector("h1")
                name = await name_el.inner_text() if name_el else ""

                address_el = await page.query_selector("[data-testid='address']")
                address = await address_el.inner_text() if address_el else ""

                await browser.close()

                return RawProperty(
                    source=self.SOURCE_NAME,
                    source_id=source_id,
                    name=name,
                    address=address,
                )
        except Exception as e:
            logger.warning("야놀자 상세 수집 실패", source_id=source_id, error=str(e))
            return None

    async def get_reviews(self, source_id: str, limit: int = 50) -> list[dict]:
        """야놀자 리뷰 수집"""
        # TODO: API 엔드포인트 분석 후 구현
        return []
