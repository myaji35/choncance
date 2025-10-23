// ChonCance Type Definitions
import type * as Icons from "lucide-react";

export interface Experience {
  id: string;
  title: string;
  description: string;
  iconName: Exclude<keyof typeof Icons, "default">; // lucide-react icon name
}

export interface Property {
  id: string;
  title: string;
  location: string;
  description: string;
  imageUrl: string;
  themeIds: string[];
  tags: string[]; // e.g., "#반려동물동반", "#아궁이체험"
  // Extended fields for Story 1.2
  images: string[]; // Gallery images (3-5 images)
  hostStory: string; // Long-form narrative (2-3 paragraphs)
  experiences: Experience[]; // 2-4 experiences
  providedItems: string[]; // e.g., "몸빼바지 대여", "고무신 제공"
  honestGuide: string[]; // 2-3 honest inconveniences
  pricePerNight: number;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  propertyIds: string[];
}
