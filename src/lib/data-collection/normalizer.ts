import type { RawPropertyData, NormalizedData } from "./types";

/**
 * 소스별 평점을 5점 만점으로 정규화
 */
export function normalizeRating(
  rating?: number,
  ratingMax: number = 5
): number {
  if (!rating || rating <= 0) return 0;
  return Math.round((rating / ratingMax) * 5 * 10) / 10;
}

/**
 * 원시 수집 데이터를 정규화
 */
export function normalizeData(raw: RawPropertyData): NormalizedData {
  return {
    ...raw,
    ratingNormalized: normalizeRating(raw.rating, raw.ratingMax ?? 5),
  };
}

/**
 * 지역명 정규화 (시도 추출)
 * "강원도 강릉시 ..." → { region: "강원도", subregion: "강릉시" }
 */
export function extractRegion(address?: string): {
  region?: string;
  subregion?: string;
} {
  if (!address) return {};

  const PROVINCES = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시",
    "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
    "경기도", "강원도", "충청북도", "충청남도",
    "전라북도", "전라남도", "경상북도", "경상남도", "제주도",
    "제주특별자치도",
  ];

  let region: string | undefined;
  let subregion: string | undefined;

  for (const province of PROVINCES) {
    if (address.includes(province)) {
      region = province
        .replace("특별시", "")
        .replace("광역시", "")
        .replace("특별자치시", "")
        .replace("특별자치도", "");
      if (region === "제주") region = "제주도";

      // 시군구 추출
      const rest = address.slice(address.indexOf(province) + province.length).trim();
      const cityMatch = rest.match(/^([가-힣]+(?:시|군|구))/);
      if (cityMatch) subregion = cityMatch[1];
      break;
    }
  }

  return { region, subregion };
}

/**
 * 숙소명에서 자동 태그 추출
 */
export function extractAutoTags(name: string, amenities: string[] = []): string[] {
  const tags: string[] = [];
  const text = `${name} ${amenities.join(" ")}`.toLowerCase();

  const TAG_KEYWORDS: Record<string, string[]> = {
    "#논뷰맛집": ["논", "논밭", "전원"],
    "#계곡앞": ["계곡", "valley"],
    "#바다뷰": ["바다", "해변", "ocean", "sea"],
    "#산속힐링": ["산", "숲", "forest"],
    "#불멍과별멍": ["불멍", "캠프파이어", "모닥불", "별"],
    "#아궁이체험": ["아궁이", "전통"],
    "#농사체험": ["농사", "텃밭", "모내기"],
    "#낚시체험": ["낚시", "fishing"],
    "#반려동물동반": ["반려", "펫", "pet", "dog"],
    "#전통가옥": ["한옥", "초가", "전통"],
    "#개별바베큐": ["바베큐", "bbq", "바비큐"],
    "#취사가능": ["주방", "취사", "kitchen"],
    "#SNS맛집": ["감성", "sns", "인스타"],
    "#커플추천": ["커플", "couple", "2인"],
    "#아이동반": ["어린이", "가족", "아이"],
    "#혼캉스": ["1인", "혼자", "solo"],
  };

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.push(tag);
    }
  }

  return tags;
}
