// GraphRAG 태그 분류 체계
// 초기 태그 시드 (규칙 기반 매핑의 타겟)

export type TagType = "theme" | "feature" | "mood" | "activity" | "audience" | "season";

export interface TagSeed {
  type: TagType;
  name: string;
  slug: string;
  aliases?: string[]; // 설명/하이라이트 텍스트 매칭용
}

export const TAG_SEEDS: TagSeed[] = [
  // ─── Theme (분위기/테마) ───
  { type: "theme", name: "한옥", slug: "theme-hanok", aliases: ["한옥", "전통", "고가", "기와"] },
  { type: "theme", name: "글램핑", slug: "theme-glamping", aliases: ["글램핑", "캠핑", "텐트"] },
  { type: "theme", name: "독채", slug: "theme-private-house", aliases: ["독채", "프라이빗"] },
  { type: "theme", name: "오두막", slug: "theme-cabin", aliases: ["오두막", "통나무", "로그하우스"] },
  { type: "theme", name: "농장", slug: "theme-farm", aliases: ["농장", "농원", "텃밭"] },
  { type: "theme", name: "민박", slug: "theme-guesthouse", aliases: ["민박", "게스트하우스"] },
  { type: "theme", name: "펜션", slug: "theme-pension", aliases: ["펜션"] },

  // ─── Feature (시설/편의) ───
  { type: "feature", name: "반려동물OK", slug: "feature-pets-allowed", aliases: ["반려동물", "펫", "애견"] },
  { type: "feature", name: "바비큐", slug: "feature-bbq", aliases: ["바비큐", "BBQ", "고기구이"] },
  { type: "feature", name: "온돌", slug: "feature-ondol", aliases: ["온돌", "방구들"] },
  { type: "feature", name: "벽난로", slug: "feature-fireplace", aliases: ["벽난로", "모닥불"] },
  { type: "feature", name: "테라스", slug: "feature-terrace", aliases: ["테라스", "발코니"] },
  { type: "feature", name: "수영장", slug: "feature-pool", aliases: ["수영장", "풀"] },
  { type: "feature", name: "온천", slug: "feature-hotspring", aliases: ["온천", "스파"] },
  { type: "feature", name: "Wi-Fi", slug: "feature-wifi", aliases: ["Wi-Fi", "와이파이", "인터넷"] },
  { type: "feature", name: "주차장", slug: "feature-parking", aliases: ["주차", "주차장"] },

  // ─── Mood (정서/분위기) ───
  { type: "mood", name: "조용함", slug: "mood-quiet", aliases: ["조용", "고요", "한적"] },
  { type: "mood", name: "낭만적", slug: "mood-romantic", aliases: ["로맨틱", "낭만", "커플"] },
  { type: "mood", name: "힐링", slug: "mood-healing", aliases: ["힐링", "휴식", "쉬어가는"] },
  { type: "mood", name: "아늑함", slug: "mood-cozy", aliases: ["아늑", "포근"] },
  { type: "mood", name: "전통적", slug: "mood-traditional", aliases: ["전통", "옛", "고유"] },
  { type: "mood", name: "자연친화", slug: "mood-nature", aliases: ["자연", "숲", "산속", "논뷰"] },

  // ─── Activity (가능한 활동) ───
  { type: "activity", name: "별관측", slug: "activity-stargazing", aliases: ["별", "은하수", "천문"] },
  { type: "activity", name: "트레킹", slug: "activity-trekking", aliases: ["트레킹", "등산", "하이킹"] },
  { type: "activity", name: "감귤따기", slug: "activity-tangerine", aliases: ["감귤", "귤 따기"] },
  { type: "activity", name: "한복체험", slug: "activity-hanbok", aliases: ["한복"] },
  { type: "activity", name: "다도체험", slug: "activity-tea", aliases: ["다도", "찻잎"] },
  { type: "activity", name: "낚시", slug: "activity-fishing", aliases: ["낚시", "어선"] },
  { type: "activity", name: "요리체험", slug: "activity-cooking", aliases: ["요리", "쿠킹", "대통밥"] },

  // ─── Audience (대상) ───
  { type: "audience", name: "가족", slug: "audience-family", aliases: ["가족", "아이", "키즈"] },
  { type: "audience", name: "커플", slug: "audience-couple", aliases: ["커플", "연인", "데이트"] },
  { type: "audience", name: "친구", slug: "audience-friends", aliases: ["친구", "우정"] },
  { type: "audience", name: "혼자", slug: "audience-solo", aliases: ["혼자", "솔로", "1인"] },
  { type: "audience", name: "반려견동반", slug: "audience-pet-owner", aliases: ["반려견", "강아지"] },

  // ─── Season (추천 계절) ───
  { type: "season", name: "봄", slug: "season-spring", aliases: ["봄", "꽃놀이"] },
  { type: "season", name: "여름", slug: "season-summer", aliases: ["여름", "피서"] },
  { type: "season", name: "가을", slug: "season-autumn", aliases: ["가을", "단풍"] },
  { type: "season", name: "겨울", slug: "season-winter", aliases: ["겨울", "눈꽃", "스키"] },
  { type: "season", name: "사계절", slug: "season-all", aliases: ["사계절", "연중"] },
];

/** 텍스트에서 매칭되는 태그들 반환 */
export function matchTagsInText(text: string): TagSeed[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = new Set<TagSeed>();
  for (const tag of TAG_SEEDS) {
    const aliases = tag.aliases ?? [tag.name];
    for (const alias of aliases) {
      if (lower.includes(alias.toLowerCase())) {
        matched.add(tag);
        break;
      }
    }
  }
  return Array.from(matched);
}
