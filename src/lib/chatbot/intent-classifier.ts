import { ChatIntent } from "@/components/chatbot/types";

export interface ClassifiedIntent {
  intent: ChatIntent;
  confidence: number;
  keywords: string[];
  filters?: {
    location?: string;
    tags?: string[];
    priceRange?: { min?: number; max?: number };
    guests?: number;
  };
}

/**
 * 사용자 메시지에서 의도를 분류합니다.
 * 간단한 키워드 기반 분류를 사용합니다.
 */
export function classifyIntent(message: string): ClassifiedIntent {
  const lowerMessage = message.toLowerCase().trim();

  // 태그 기반 검색 (#으로 시작하는 태그)
  const tagMatches = message.match(/#[\w가-힣]+/g);
  if (tagMatches && tagMatches.length > 0) {
    return {
      intent: ChatIntent.TAG_BASED,
      confidence: 0.9,
      keywords: tagMatches,
      filters: { tags: tagMatches.map(t => t.replace("#", "")) },
    };
  }

  // 지역 기반 검색
  const locationKeywords = ["강릉", "강원", "경주", "전주", "제주", "부산", "여수", "속초", "양양", "춘천", "가평", "남해"];
  const foundLocation = locationKeywords.find(loc => lowerMessage.includes(loc));

  if (foundLocation) {
    return {
      intent: ChatIntent.PROPERTY_SEARCH,
      confidence: 0.85,
      keywords: [foundLocation],
      filters: { location: foundLocation },
    };
  }

  // 후기 관련
  const reviewKeywords = ["후기", "리뷰", "평가", "평점", "별점"];
  if (reviewKeywords.some(k => lowerMessage.includes(k))) {
    return {
      intent: ChatIntent.REVIEW_INQUIRY,
      confidence: 0.8,
      keywords: reviewKeywords.filter(k => lowerMessage.includes(k)),
    };
  }

  // 가격 관련
  const priceKeywords = ["가격", "얼마", "비용", "요금", "저렴", "비싼"];
  if (priceKeywords.some(k => lowerMessage.includes(k))) {
    return {
      intent: ChatIntent.PRICE_INQUIRY,
      confidence: 0.8,
      keywords: priceKeywords.filter(k => lowerMessage.includes(k)),
    };
  }

  // 예약 관련
  const bookingKeywords = ["예약", "체크인", "체크아웃", "숙박", "묵다"];
  if (bookingKeywords.some(k => lowerMessage.includes(k))) {
    return {
      intent: ChatIntent.BOOKING_HELP,
      confidence: 0.75,
      keywords: bookingKeywords.filter(k => lowerMessage.includes(k)),
    };
  }

  // 추천 관련
  const recommendKeywords = ["추천", "좋은", "힐링", "쉬다", "조용한", "경치", "뷰"];
  if (recommendKeywords.some(k => lowerMessage.includes(k))) {
    return {
      intent: ChatIntent.PROPERTY_RECOMMEND,
      confidence: 0.7,
      keywords: recommendKeywords.filter(k => lowerMessage.includes(k)),
    };
  }

  // 기본값: 일반 질문
  return {
    intent: ChatIntent.GENERAL_QUESTION,
    confidence: 0.5,
    keywords: [],
  };
}

/**
 * 메시지에서 숫자를 추출합니다 (가격, 인원 등)
 */
export function extractNumbers(message: string): number[] {
  const numbers = message.match(/\d+/g);
  return numbers ? numbers.map(Number) : [];
}
