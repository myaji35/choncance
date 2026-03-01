// 수집 소스 타입
export type CrawlSource =
  | "naver"
  | "google"
  | "kakao"
  | "yanolja"
  | "yeogi"
  | "airbnb";

// 원시 수집 데이터 (소스별 정규화 전)
export interface RawPropertyData {
  source: CrawlSource;
  sourceId?: string;
  name: string;
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  rating?: number; // 원본 평점 (스케일 다를 수 있음)
  ratingMax?: number; // 원본 최대 평점 (기본 5)
  reviewCount?: number;
  reviews?: Array<{ text: string; rating: number; date: string }>;
  amenities?: string[];
  thumbnailUrl?: string;
  extraData?: Record<string, unknown>;
}

// 정규화된 데이터 (5점 만점 통일)
export interface NormalizedData extends RawPropertyData {
  ratingNormalized: number; // 5점 만점으로 정규화된 평점
}

// VINTEE Score 구성 내역
export interface ScoreBreakdown {
  naverRating?: number;
  googleRating?: number;
  yanoljaRating?: number;
  yeogiRating?: number;
  reviewVolumeScore: number;
  totalReviews: number;
  finalScore: number;
}

// 수집 작업 요청
export interface CrawlJobRequest {
  source: CrawlSource | "all";
  region?: string;
  limit?: number;
}

// 수집 결과
export interface CrawlResult {
  source: CrawlSource;
  collected: number;
  newProperties: number;
  updatedProperties: number;
  errors: Array<{ message: string; url?: string }>;
}
