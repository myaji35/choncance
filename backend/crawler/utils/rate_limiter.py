"""요청 속도 제한 유틸리티"""
import asyncio
import random
import time
from collections import deque
from config import CRAWL_CONFIG


class RateLimiter:
    """시간당 최대 요청 수 제한"""

    def __init__(self, max_per_hour: int = None):
        self.max_per_hour = max_per_hour or CRAWL_CONFIG["max_requests_per_hour"]
        self._timestamps: deque = deque()

    async def acquire(self):
        """요청 전 딜레이 + 속도 제한 적용"""
        now = time.time()
        cutoff = now - 3600

        # 1시간 이전 타임스탬프 제거
        while self._timestamps and self._timestamps[0] < cutoff:
            self._timestamps.popleft()

        if len(self._timestamps) >= self.max_per_hour:
            # 가장 오래된 요청이 1시간 후 만료될 때까지 대기
            sleep_time = self._timestamps[0] + 3600 - now + 1
            await asyncio.sleep(sleep_time)

        # 랜덤 딜레이 (법적 안전장치: 3~5초)
        delay = random.uniform(
            CRAWL_CONFIG["delay_min"],
            CRAWL_CONFIG["delay_max"]
        )
        await asyncio.sleep(delay)
        self._timestamps.append(time.time())
