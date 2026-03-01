"""
데이터 정규화 + 중복 제거 파이프라인
rapidfuzz 기반 한국어 주소+이름 유사도 비교
"""
from rapidfuzz import fuzz
from utils import parse_region, get_logger
from db import CrawlRepository

logger = get_logger(__name__)

DUPLICATE_THRESHOLD = 85  # 유사도 85 이상이면 동일 숙소로 판단


class Normalizer:
    """원시 크롤링 데이터를 정규화하고 중복을 제거"""

    def __init__(self, repo: CrawlRepository):
        self.repo = repo

    def normalize(self, raw: dict) -> dict:
        """단일 raw 레코드 정규화"""
        region, subregion = parse_region(raw.get("address", ""))
        return {
            "name": self._clean_name(raw.get("name", "")),
            "address": raw.get("address"),
            "region": region,
            "subregion": subregion,
            "lat": raw.get("lat"),
            "lng": raw.get("lng"),
            "phone": raw.get("phone"),
            "avg_rating": raw.get("source_rating"),
            "total_reviews": raw.get("review_count", 0),
            f"{raw.get('source', 'naver')}_id": raw.get("source_id"),
        }

    def deduplicate(self, records: list[dict]) -> list[dict]:
        """
        레코드 리스트에서 중복 제거
        이름 + 주소 유사도로 판단
        """
        unique = []
        for record in records:
            is_dup = False
            for existing in unique:
                name_sim = fuzz.ratio(
                    record.get("name", ""),
                    existing.get("name", "")
                )
                addr_sim = fuzz.ratio(
                    record.get("address", "") or "",
                    existing.get("address", "") or ""
                )
                # 이름 유사도 85+ AND 주소 유사도 70+ → 중복
                if name_sim >= DUPLICATE_THRESHOLD and addr_sim >= 70:
                    is_dup = True
                    # 더 많은 정보를 가진 레코드로 업데이트
                    self._merge(existing, record)
                    break

            if not is_dup:
                unique.append(record)

        logger.info(f"중복 제거", before=len(records), after=len(unique))
        return unique

    def _clean_name(self, name: str) -> str:
        """펜션명 정제 (불필요한 suffix 제거)"""
        suffixes = ["펜션", "민박", "게스트하우스", "빌라", "리조트"]
        cleaned = name.strip()
        # 중복 suffix 제거
        for suf in suffixes:
            if cleaned.endswith(suf) and len(cleaned) > len(suf) + 1:
                cleaned = cleaned[:-len(suf)].strip() + " " + suf
        return cleaned

    def _merge(self, base: dict, new: dict):
        """base에 new의 추가 정보 병합"""
        for key, val in new.items():
            if val and not base.get(key):
                base[key] = val
