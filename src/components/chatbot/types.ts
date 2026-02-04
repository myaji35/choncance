export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  propertyReferences?: PropertyReference[];
}

export interface PropertyReference {
  id: string;
  name: string;
  thumbnailUrl?: string;
  pricePerNight: number;
  tags: string[];
}

export enum ChatIntent {
  PROPERTY_SEARCH = "PROPERTY_SEARCH",
  PROPERTY_RECOMMEND = "PROPERTY_RECOMMEND",
  TAG_BASED = "TAG_BASED",
  REVIEW_INQUIRY = "REVIEW_INQUIRY",
  BOOKING_HELP = "BOOKING_HELP",
  PRICE_INQUIRY = "PRICE_INQUIRY",
  GENERAL_QUESTION = "GENERAL_QUESTION",
}
