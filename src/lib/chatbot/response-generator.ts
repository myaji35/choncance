import { ChatIntent } from "@/components/chatbot/types";
import { ClassifiedIntent } from "./intent-classifier";
import { prisma } from "@/lib/prisma";
import { PropertyReference } from "@/components/chatbot/types";

export interface ChatResponse {
  message: string;
  propertyReferences?: PropertyReference[];
}

/**
 * 의도에 따라 적절한 응답을 생성합니다.
 */
export async function generateResponse(
  userMessage: string,
  classifiedIntent: ClassifiedIntent
): Promise<ChatResponse> {
  switch (classifiedIntent.intent) {
    case ChatIntent.TAG_BASED:
      return await handleTagBasedSearch(classifiedIntent);

    case ChatIntent.PROPERTY_SEARCH:
      return await handlePropertySearch(classifiedIntent);

    case ChatIntent.PROPERTY_RECOMMEND:
      return await handlePropertyRecommend(userMessage);

    case ChatIntent.REVIEW_INQUIRY:
      return await handleReviewInquiry();

    case ChatIntent.PRICE_INQUIRY:
      return await handlePriceInquiry();

    case ChatIntent.BOOKING_HELP:
      return handleBookingHelp();

    case ChatIntent.GENERAL_QUESTION:
    default:
      return handleGeneralQuestion(userMessage);
  }
}

/**
 * 태그 기반 검색
 */
async function handleTagBasedSearch(
  classifiedIntent: ClassifiedIntent
): Promise<ChatResponse> {
  const tags = classifiedIntent.filters?.tags || [];

  if (tags.length === 0) {
    return {
      message: "태그를 찾을 수 없습니다. 예: #논뷰맛집, #힐링, #반려동물동반",
    };
  }

  const properties = await prisma.property.findMany({
    where: {
      status: "APPROVED",
      tags: {
        some: {
          name: {
            in: tags.map(t => `#${t}`),
          },
        },
      },
    },
    include: {
      tags: true,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (properties.length === 0) {
    return {
      message: `죄송합니다. ${tags.map(t => `#${t}`).join(", ")} 태그에 해당하는 숙소를 찾을 수 없습니다.`,
    };
  }

  const propertyRefs: PropertyReference[] = properties.map(p => ({
    id: p.id,
    name: p.name,
    thumbnailUrl: p.thumbnailUrl || p.images[0],
    pricePerNight: Number(p.pricePerNight),
    tags: p.tags.map(t => t.name),
  }));

  return {
    message: `${tags.map(t => `#${t}`).join(", ")} 태그의 숙소 ${properties.length}곳을 찾았어요! 아래에서 확인해보세요.`,
    propertyReferences: propertyRefs,
  };
}

/**
 * 지역 기반 검색
 */
async function handlePropertySearch(
  classifiedIntent: ClassifiedIntent
): Promise<ChatResponse> {
  const location = classifiedIntent.filters?.location;

  if (!location) {
    return {
      message: "어떤 지역의 숙소를 찾으시나요? (예: 강릉, 제주, 경주 등)",
    };
  }

  const properties = await prisma.property.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { address: { contains: location } },
        { province: { contains: location } },
        { city: { contains: location } },
      ],
    },
    include: {
      tags: true,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (properties.length === 0) {
    return {
      message: `죄송합니다. ${location} 지역의 숙소를 찾을 수 없습니다. 다른 지역을 검색해보시겠어요?`,
    };
  }

  const propertyRefs: PropertyReference[] = properties.map(p => ({
    id: p.id,
    name: p.name,
    thumbnailUrl: p.thumbnailUrl || p.images[0],
    pricePerNight: Number(p.pricePerNight),
    tags: p.tags.map(t => t.name),
  }));

  return {
    message: `${location} 지역의 숙소 ${properties.length}곳을 찾았어요! 각 숙소를 클릭하면 자세한 정보를 볼 수 있습니다.`,
    propertyReferences: propertyRefs,
  };
}

/**
 * 추천
 */
async function handlePropertyRecommend(userMessage: string): Promise<ChatResponse> {
  // 힐링, 조용한 등 키워드를 기반으로 관련 태그 찾기
  const healingTags = ["#힐링", "#조용한시골", "#불멍과별멍"];
  const viewTags = ["#논뷰맛집", "#바다뷰", "#산속오두막"];

  let tagsToSearch = healingTags;
  if (userMessage.includes("경치") || userMessage.includes("뷰")) {
    tagsToSearch = viewTags;
  }

  const properties = await prisma.property.findMany({
    where: {
      status: "APPROVED",
      tags: {
        some: {
          name: {
            in: tagsToSearch,
          },
        },
      },
    },
    include: {
      tags: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (properties.length === 0) {
    return {
      message: "죄송합니다. 현재 추천드릴 숙소가 없습니다. 다른 조건으로 검색해보시겠어요?",
    };
  }

  const propertyRefs: PropertyReference[] = properties.map(p => ({
    id: p.id,
    name: p.name,
    thumbnailUrl: p.thumbnailUrl || p.images[0],
    pricePerNight: Number(p.pricePerNight),
    tags: p.tags.map(t => t.name),
  }));

  return {
    message: `이런 숙소는 어떠세요? 힐링하기 좋은 ${properties.length}곳을 추천드립니다.`,
    propertyReferences: propertyRefs,
  };
}

/**
 * 후기 관련
 */
async function handleReviewInquiry(): Promise<ChatResponse> {
  const topRatedProperties = await prisma.property.findMany({
    where: {
      status: "APPROVED",
      reviews: {
        some: {},
      },
    },
    include: {
      tags: true,
      reviews: {
        select: {
          rating: true,
          content: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
    },
    take: 3,
  });

  if (topRatedProperties.length === 0) {
    return {
      message: "아직 후기가 등록된 숙소가 없습니다. 다른 질문이 있으시면 도와드릴게요!",
    };
  }

  const propertyRefs: PropertyReference[] = topRatedProperties.map(p => ({
    id: p.id,
    name: p.name,
    thumbnailUrl: p.thumbnailUrl || p.images[0],
    pricePerNight: Number(p.pricePerNight),
    tags: p.tags.map(t => t.name),
  }));

  return {
    message: `후기가 좋은 숙소 ${topRatedProperties.length}곳을 찾았어요! 각 숙소 페이지에서 자세한 후기를 확인해보세요.`,
    propertyReferences: propertyRefs,
  };
}

/**
 * 가격 관련
 */
async function handlePriceInquiry(): Promise<ChatResponse> {
  const properties = await prisma.property.findMany({
    where: {
      status: "APPROVED",
    },
    select: {
      pricePerNight: true,
    },
  });

  if (properties.length === 0) {
    return {
      message: "현재 등록된 숙소가 없습니다.",
    };
  }

  const prices = properties.map(p => Number(p.pricePerNight));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return {
    message: `현재 VINTEE의 숙소 가격대는 다음과 같습니다:\n\n최저: ${minPrice.toLocaleString()}원/박\n평균: ${avgPrice.toLocaleString()}원/박\n최고: ${maxPrice.toLocaleString()}원/박\n\n원하시는 가격대가 있으시면 말씀해주세요!`,
  };
}

/**
 * 예약 관련 도움말
 */
function handleBookingHelp(): ChatResponse {
  return {
    message: `예약 방법을 안내해드릴게요:\n\n1. 원하는 숙소를 찾아보세요\n2. 숙소 상세 페이지에서 날짜와 인원을 선택하세요\n3. 예약하기 버튼을 클릭하고 필요한 정보를 입력하세요\n4. 결제를 완료하면 예약이 확정됩니다\n\n체크인 시간은 보통 15:00, 체크아웃은 11:00입니다. 더 궁금하신 점이 있으시면 말씀해주세요!`,
  };
}

/**
 * 일반 질문
 */
function handleGeneralQuestion(userMessage: string): ChatResponse {
  const greetings = ["안녕", "hi", "hello", "헬로"];
  if (greetings.some(g => userMessage.toLowerCase().includes(g))) {
    return {
      message: "안녕하세요! VINTEE 상담 어시스턴트입니다. 숙소, 태그, 가격, 후기 등에 대해 무엇이든 물어보세요!",
    };
  }

  return {
    message: "죄송합니다. 질문을 잘 이해하지 못했어요. 다음과 같은 질문을 해보시는 건 어떨까요?\n\n• 강릉 근처 숙소 찾아줘\n• #논뷰맛집 태그 숙소 보여줘\n• 힐링할 수 있는 곳 추천해줘\n• 가격대가 어떻게 돼?\n• 후기 좋은 곳 알려줘",
  };
}
