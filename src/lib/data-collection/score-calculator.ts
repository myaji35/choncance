import type { NormalizedData, ScoreBreakdown } from "./types";

// 소스별 가중치
const WEIGHTS = {
  naver: 0.30,
  google: 0.30,
  reviewVolume: 0.20,
  yanolja: 0.10,
  yeogi: 0.10,
} as const;

/**
 * 리뷰 볼륨 → 5점 만점 점수
 * 100개 기준, 이상은 5점, 0개는 0점
 */
function reviewVolumeScore(totalReviews: number): number {
  return Math.min(5, (totalReviews / 100) * 5);
}

/**
 * 여러 소스의 수집 데이터로 VINTEE Score 계산
 */
export function calculateVinteeScore(sources: NormalizedData[]): {
  score: number;
  breakdown: ScoreBreakdown;
} {
  const sourceMap = new Map<string, NormalizedData>();
  for (const s of sources) {
    sourceMap.set(s.source, s);
  }

  const naver = sourceMap.get("naver");
  const google = sourceMap.get("google");
  const yanolja = sourceMap.get("yanolja");
  const yeogi = sourceMap.get("yeogi");

  const totalReviews = sources.reduce(
    (sum, s) => sum + (s.reviewCount ?? 0),
    0
  );
  const volScore = reviewVolumeScore(totalReviews);

  let weightedSum = 0;
  let totalWeight = 0;

  if (naver?.ratingNormalized) {
    weightedSum += naver.ratingNormalized * WEIGHTS.naver;
    totalWeight += WEIGHTS.naver;
  }
  if (google?.ratingNormalized) {
    weightedSum += google.ratingNormalized * WEIGHTS.google;
    totalWeight += WEIGHTS.google;
  }
  if (yanolja?.ratingNormalized) {
    weightedSum += yanolja.ratingNormalized * WEIGHTS.yanolja;
    totalWeight += WEIGHTS.yanolja;
  }
  if (yeogi?.ratingNormalized) {
    weightedSum += yeogi.ratingNormalized * WEIGHTS.yeogi;
    totalWeight += WEIGHTS.yeogi;
  }

  // 리뷰 볼륨은 항상 포함
  weightedSum += volScore * WEIGHTS.reviewVolume;
  totalWeight += WEIGHTS.reviewVolume;

  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const finalScore = Math.max(1.0, Math.min(5.0, Math.round(rawScore * 10) / 10));

  const breakdown: ScoreBreakdown = {
    naverRating: naver?.ratingNormalized,
    googleRating: google?.ratingNormalized,
    yanoljaRating: yanolja?.ratingNormalized,
    yeogiRating: yeogi?.ratingNormalized,
    reviewVolumeScore: Math.round(volScore * 10) / 10,
    totalReviews,
    finalScore,
  };

  return { score: finalScore, breakdown };
}
