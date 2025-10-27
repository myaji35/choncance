import type { Property, Theme } from "@/types";

// Mock Properties Data
export const properties: Property[] = [
  // 논뷰 맛집 Properties
  {
    id: "1",
    title: "황금들녘 한옥 스테이",
    location: "전라남도 담양군",
    description: "끝없이 펼쳐진 논밭 풍경을 감상할 수 있는 전통 한옥입니다.",
    imageUrl: "/placeholder-property-1.jpg",
    themeIds: ["nonview"],
    tags: ["#논뷰", "#한옥", "#반려동물동반"],
    images: [
      "/placeholder-property-1.jpg",
      "/placeholder-property-1-2.jpg",
      "/placeholder-property-1-3.jpg",
      "/placeholder-property-1-4.jpg",
    ],
    hostStory: "서울에서 30년간 직장 생활을 하다가 고향인 담양으로 돌아왔습니다. 할아버지께서 지으신 이 한옥은 오랜 세월 비어있었지만, 저희 부부가 1년간 정성껏 고쳐 이제 손님을 맞이하고 있습니다.\n\n마당에서 보이는 논밭은 할아버지께서 평생 일구신 곳이에요. 봄에는 초록 물결이, 가을에는 황금빛 벼이삭이 춤을 춥니다. 이곳에서 느린 시간의 소중함을 느끼시길 바랍니다.\n\n도시의 바쁜 일상에서 벗어나 진정한 휴식을 찾고자 하는 분들께 저희 한옥을 열어드립니다.",
    experiences: [
      {
        id: "exp1-1",
        title: "논두렁 산책",
        description: "아침 일찍 논두렁을 걸으며 새소리와 함께 하루를 시작하세요",
        iconName: "Footprints",
      },
      {
        id: "exp1-2",
        title: "전통 다도 체험",
        description: "한옥 대청마루에서 즐기는 전통 차 한 잔의 여유",
        iconName: "Coffee",
      },
      {
        id: "exp1-3",
        title: "계절 농사 체험",
        description: "계절에 따라 모내기, 벼베기 등 농사 일손 돕기 (선택사항)",
        iconName: "Sprout",
      },
    ],
    providedItems: ["한복 대여", "반려동물 동반 가능", "전통 다기 세트", "짚신 체험"],
    honestGuide: [
      "완벽한 디지털 단절을 위해 와이파이가 불안정할 수 있습니다",
      "전통 한옥의 특성상 방음이 완벽하지 않아 자연의 소리가 들립니다",
      "여름철 모기와 작은 벌레들이 자연스럽게 찾아올 수 있습니다",
    ],
    pricePerNight: 180000,
  },
  {
    id: "2",
    title: "산골 논뷰 펜션",
    location: "경상북도 영주시",
    description: "계단식 논밭이 아름다운 산속 힐링 공간입니다.",
    imageUrl: "/placeholder-property-2.jpg",
    themeIds: ["nonview"],
    tags: ["#논뷰", "#산속", "#텃밭체험"],
    images: [
      "/placeholder-property-2.jpg",
      "/placeholder-property-2-2.jpg",
      "/placeholder-property-2-3.jpg",
      "/placeholder-property-2-4.jpg",
    ],
    hostStory: "산 중턱에 위치한 저희 펜션은 계단식 논밭의 아름다운 전망을 자랑합니다.",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 150000,
  },
  {
    id: "3",
    title: "벼이삭 게스트하우스",
    location: "충청남도 공주시",
    description: "황금 벼이삭이 춤추는 들판 앞 아늑한 공간입니다.",
    imageUrl: "/placeholder-property-3.jpg",
    themeIds: ["nonview"],
    tags: ["#논뷰", "#가을", "#사진맛집"],
    images: [
      "/placeholder-property-3.jpg",
      "/placeholder-property-3-2.jpg",
      "/placeholder-property-3-3.jpg",
      "/placeholder-property-3-4.jpg",
    ],
    hostStory: "",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 120000,
  },
  {
    id: "4",
    title: "들꽃마을 농가주택",
    location: "전라북도 전주시",
    description: "논밭과 들꽃이 어우러진 전원 생활을 경험할 수 있습니다.",
    imageUrl: "/placeholder-property-4.jpg",
    themeIds: ["nonview"],
    tags: ["#논뷰", "#들꽃", "#농촌체험"],
    images: [
      "/placeholder-property-4.jpg",
      "/placeholder-property-4-2.jpg",
      "/placeholder-property-4-3.jpg",
      "/placeholder-property-4-4.jpg",
    ],
    hostStory: "",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 130000,
  },

  // 불멍과 별멍 Properties
  {
    id: "5",
    title: "별빛 캠핑 하우스",
    location: "강원도 평창군",
    description: "도심에서 벗어나 별빛 가득한 밤하늘을 즐기세요.",
    imageUrl: "/placeholder-property-5.jpg",
    themeIds: ["fire-stars"],
    tags: ["#불멍", "#별멍", "#캠핑"],
    images: [
      "/placeholder-property-5.jpg",
      "/placeholder-property-5-2.jpg",
      "/placeholder-property-5-3.jpg",
    ],
    hostStory: "천문학을 전공한 저는 항상 맑은 하늘을 찾아다녔습니다. 이곳 평창의 밤하늘은 은하수가 선명하게 보이는 최고의 관측지입니다.\n\n낮에는 정원에서 모닥불을 피우고, 밤에는 천체 망원경으로 별을 관측할 수 있도록 준비했습니다. 도시의 불빛에서 벗어나 우주의 신비를 느껴보세요.\n\n겨울에는 눈 덮인 산과 별빛이 어우러져 환상적인 풍경을 선사합니다.",
    experiences: [
      {
        id: "exp5-1",
        title: "천체 관측",
        description: "전문 천체 망원경으로 별자리와 행성을 관찰하세요",
        iconName: "Telescope",
      },
      {
        id: "exp5-2",
        title: "모닥불 체험",
        description: "프라이빗 정원에서 모닥불을 피우고 마시멜로 구워먹기",
        iconName: "Flame",
      },
      {
        id: "exp5-3",
        title: "은하수 사진 촬영",
        description: "호스트가 알려주는 은하수 사진 촬영 팁 (카메라 필수)",
        iconName: "Camera",
      },
    ],
    providedItems: ["장작 무제한 제공", "마시멜로 세트", "천체 망원경 사용", "캠핑 의자"],
    honestGuide: [
      "최고의 별 관측을 위해 외부 조명이 최소화되어 밤에는 어둡습니다",
      "산속이라 겨울철 매우 추울 수 있으니 두꺼운 옷을 준비해주세요",
      "날씨가 흐리면 별 관측이 어려울 수 있습니다 (환불 불가)",
    ],
    pricePerNight: 200000,
  },
  {
    id: "6",
    title: "모닥불 정원 펜션",
    location: "경기도 가평군",
    description: "프라이빗 정원에서 모닥불과 함께 힐링하는 시간입니다.",
    imageUrl: "/placeholder-property-6.jpg",
    themeIds: ["fire-stars"],
    tags: ["#불멍", "#정원", "#프라이빗"],
    images: ["/placeholder-property-6.jpg"],
    hostStory: "",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 170000,
  },
  {
    id: "7",
    title: "은하수 산장",
    location: "충청북도 단양군",
    description: "별똥별을 볼 수 있는 맑은 하늘 아래 산장입니다.",
    imageUrl: "/placeholder-property-7.jpg",
    themeIds: ["fire-stars"],
    tags: ["#별멍", "#산장", "#천문관측"],
    images: ["/placeholder-property-7.jpg"],
    hostStory: "",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 160000,
  },
  {
    id: "8",
    title: "장작불 오두막",
    location: "강원도 홍천군",
    description: "장작불 타닥타닥 소리와 함께 시골의 밤을 만끽하세요.",
    imageUrl: "/placeholder-property-8.jpg",
    themeIds: ["fire-stars"],
    tags: ["#불멍", "#장작", "#오두막"],
    images: ["/placeholder-property-8.jpg"],
    hostStory: "",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 140000,
  },

  // 찐 할머니 손맛 Properties
  {
    id: "9",
    title: "할매네 시골밥상",
    location: "경상남도 하동군",
    description: "할머니의 정성이 담긴 텃밭 채소로 만든 밥상을 맛보세요.",
    imageUrl: "/placeholder-property-9.jpg",
    themeIds: ["grandma-taste"],
    tags: ["#할머니손맛", "#시골밥상", "#텃밭"],
    images: ["/placeholder-property-9.jpg"],
    hostStory: "",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 110000,
  },
  {
    id: "10",
    title: "전통 고택 스테이",
    location: "경상북도 안동시",
    description: "200년 고택에서 맛보는 전통 한정식입니다.",
    imageUrl: "/placeholder-property-10.jpg",
    themeIds: ["grandma-taste"],
    tags: ["#할머니손맛", "#고택", "#한정식"],
    images: ["/placeholder-property-10.jpg"],
    hostStory: "",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 250000,
  },
  {
    id: "11",
    title: "시골 외할머니집",
    location: "전라남도 순천시",
    description: "직접 담근 장으로 만든 구수한 시골 밥상입니다.",
    imageUrl: "/placeholder-property-11.jpg",
    themeIds: ["grandma-taste"],
    tags: ["#할머니손맛", "#전통장", "#구수함"],
    images: ["/placeholder-property-11.jpg"],
    hostStory: "",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 120000,
  },
  {
    id: "12",
    title: "산골 할매 밥집",
    location: "강원도 정선군",
    description: "산나물과 토종닭으로 만든 할머니표 건강식입니다.",
    imageUrl: "/placeholder-property-12.jpg",
    themeIds: ["grandma-taste"],
    tags: ["#할머니손맛", "#산나물", "#토종닭"],
    images: ["/placeholder-property-12.jpg"],
    hostStory: "",
    experiences: [],
    providedItems: [],
    honestGuide: [],
    pricePerNight: 130000,
  },
];

// Mock Themes Data
export const themes: Theme[] = [
  {
    id: "nonview",
    title: "논뷰 맛집",
    description: "끝없이 펼쳐진 논밭을 바라보며 멍때리기 좋은 곳",
    propertyIds: ["1", "2", "3", "4"],
  },
  {
    id: "fire-stars",
    title: "불멍과 별멍",
    description: "모닥불과 별빛 아래에서 진정한 휴식을 찾아보세요",
    propertyIds: ["5", "6", "7", "8"],
  },
  {
    id: "grandma-taste",
    title: "찐 할머니 손맛",
    description: "정성 가득 담긴 할머니의 손맛을 느낄 수 있는 곳",
    propertyIds: ["9", "10", "11", "12"],
  },
];

// Helper functions
export function getPropertyById(id: string): Property | undefined {
  return properties.find((property) => property.id === id);
}

export function getPropertiesByThemeId(themeId: string): Property[] {
  return properties.filter((property) => property.themeIds.includes(themeId));
}

export function getThemeById(id: string): Theme | undefined {
  return themes.find((theme) => theme.id === id);
}

export function getAllThemes(): Theme[] {
  return themes;
}

export function getAllProperties(): Property[] {
  return properties;
}

/**
 * Filter properties by tag name
 * Matches if property's tag includes the tag name (case insensitive)
 */
export function getPropertiesByTagName(tagName: string): Property[] {
  const normalizedTagName = tagName.toLowerCase().replace(/\s+/g, '');

  return properties.filter((property) => {
    return property.tags.some((tag) => {
      const normalizedTag = tag.toLowerCase().replace(/[#\s]/g, '');
      return normalizedTag.includes(normalizedTagName) || normalizedTagName.includes(normalizedTag);
    });
  });
}
