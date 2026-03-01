"""한국 주소 파싱 유틸리티 (region/subregion 추출)"""
import re

# 17개 시도 매핑
REGIONS = {
    "서울": "서울특별시",
    "부산": "부산광역시",
    "대구": "대구광역시",
    "인천": "인천광역시",
    "광주": "광주광역시",
    "대전": "대전광역시",
    "울산": "울산광역시",
    "세종": "세종특별자치시",
    "경기": "경기도",
    "강원": "강원도",
    "충북": "충청북도",
    "충남": "충청남도",
    "전북": "전라북도",
    "전남": "전라남도",
    "경북": "경상북도",
    "경남": "경상남도",
    "제주": "제주특별자치도",
}

# 시군구 패턴
SUBREGION_PATTERN = re.compile(
    r"([\w]+(?:시|군|구))(?:\s|$)"
)


def parse_region(address: str) -> tuple[str | None, str | None]:
    """
    주소에서 (시도, 시군구) 추출
    예: "강원도 횡성군 갑천면 ..." → ("강원도", "횡성군")
    """
    if not address:
        return None, None

    region = None
    subregion = None

    # 시도 추출
    for short, full in REGIONS.items():
        if short in address or full in address:
            region = full
            break

    # 시군구 추출
    match = SUBREGION_PATTERN.search(address)
    if match:
        subregion = match.group(1)

    return region, subregion
