"""
VINTEE 태그 자동 분류기
리뷰 텍스트 + 편의시설 기반 키워드 매칭
"""
from utils import get_logger

logger = get_logger(__name__)

TAG_KEYWORDS: dict[str, list[str]] = {
    "#논뷰맛집":    ["논", "논뷰", "rice field", "들판", "논밭", "논 뷰"],
    "#불멍과별멍":  ["불멍", "캠프파이어", "별보기", "별멍", "모닥불", "캠프파이어", "별자리"],
    "#아궁이체험":  ["아궁이", "장작", "전통 부뚜막", "군불"],
    "#농사체험":    ["농사", "모내기", "수확", "텃밭", "딸기 따기", "고구마", "감자 캐기"],
    "#반려동물동반": ["반려견", "강아지", "펫", "동물 동반", "pet", "반려동물", "개"],
    "#개별바베큐":  ["바베큐", "BBQ", "그릴", "숯불", "바베큐장"],
    "#계곡앞":     ["계곡", "물놀이", "천", "계곡물", "냇가"],
    "#산속힐링":   ["산속", "숲", "등산", "자연 속", "산 속", "숲속"],
    "#SNS맛집":    ["인스타", "포토존", "감성", "뷰맛집", "사진", "인스타그램"],
    "#혼캉스":     ["혼자", "1인", "혼캉스", "solo", "혼행", "혼자 여행"],
    "#커플추천":   ["커플", "연인", "데이트", "프로포즈"],
    "#아이동반":   ["아이", "어린이", "가족", "아이들", "유아", "키즈"],
    "#전통가옥":   ["한옥", "전통", "초가", "기와", "사랑채"],
    "#낚시체험":   ["낚시", "물고기", "낚시터", "민물낚시"],
}


class TagClassifier:
    """태그 자동 분류기"""

    def classify(
        self,
        reviews: list[dict],
        name: str = "",
        amenities: list[str] = None,
        address: str = "",
    ) -> list[str]:
        """
        리뷰 + 이름 + 편의시설 + 주소 기반 태그 분류
        returns: 매칭된 태그 리스트 (예: ["#논뷰맛집", "#반려동물동반"])
        """
        # 전체 텍스트 통합 (소문자)
        all_text = " ".join([
            " ".join([r.get("text", "") for r in (reviews or [])]),
            name or "",
            " ".join(amenities or []),
            address or "",
        ]).lower()

        matched_tags = []
        for tag, keywords in TAG_KEYWORDS.items():
            if any(kw.lower() in all_text for kw in keywords):
                matched_tags.append(tag)

        logger.info(
            "태그 분류 완료",
            name=name,
            matched_count=len(matched_tags),
            tags=matched_tags,
        )
        return matched_tags
