"use client";

import { useState, useEffect } from "react";
import ReviewCard from "./ReviewCard";
import StarRating from "./StarRating";
import { formatRating } from "@/lib/utils/review";

interface ReviewData {
  id: string;
  rating: number;
  content: string;
  guestName: string;
  createdAt: string;
  hostReply?: string | null;
  repliedAt?: string | null;
}

type DayType = "all" | "weekday" | "weekend";
type Season = "all" | "spring" | "summer" | "autumn" | "winter";

interface ReviewListProps {
  propertyId: string;
  initialReviews: ReviewData[];
  summary: { avgRating: number; totalCount: number };
  initialHasMore: boolean;
}

export default function ReviewList({
  propertyId,
  initialReviews,
  summary,
  initialHasMore,
}: ReviewListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  // ISS-038: 필터 상태
  const [dayType, setDayType] = useState<DayType>("all");
  const [season, setSeason] = useState<Season>("all");
  const [filteredSummary, setFilteredSummary] = useState(summary);
  const [distribution, setDistribution] = useState<{
    weekday: number; weekend: number;
    spring: number; summer: number; autumn: number; winter: number;
  } | null>(null);

  const buildQuery = (p: number, dt: DayType, s: Season): string => {
    const parts = [`page=${p}`, `limit=10`];
    if (dt !== "all") parts.push(`dayType=${dt}`);
    if (s !== "all") parts.push(`season=${s}`);
    return parts.join("&");
  };

  const fetchReviews = async (newDay: DayType, newSeason: Season) => {
    setLoading(true);
    const res = await fetch(
      `/api/properties/${propertyId}/reviews?${buildQuery(1, newDay, newSeason)}`
    );
    const data = await res.json();
    setReviews(data.reviews);
    setHasMore(data.pagination.hasMore);
    setPage(1);
    setFilteredSummary({
      avgRating: data.summary.avgRating ?? 0,
      totalCount: data.summary.totalCount ?? 0,
    });
    if (data.summary.distribution) setDistribution(data.summary.distribution);
    setLoading(false);
  };

  // 마운트 시 distribution만 한 번 로드
  useEffect(() => {
    fetch(`/api/properties/${propertyId}/reviews?page=1&limit=1`)
      .then((r) => r.json())
      .then((d) => {
        if (d.summary?.distribution) setDistribution(d.summary.distribution);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDayChange = (dt: DayType) => {
    setDayType(dt);
    fetchReviews(dt, season);
  };
  const handleSeasonChange = (s: Season) => {
    setSeason(s);
    fetchReviews(dayType, s);
  };

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    const res = await fetch(
      `/api/properties/${propertyId}/reviews?${buildQuery(nextPage, dayType, season)}`
    );
    const data = await res.json();
    setReviews((prev) => [...prev, ...data.reviews]);
    setHasMore(data.pagination.hasMore);
    setPage(nextPage);
    setLoading(false);
  };

  if (summary.totalCount === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        아직 후기가 없습니다
      </div>
    );
  }

  return (
    <div>
      {/* 요약 */}
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-lg font-bold text-[#16325C]">후기</h3>
        <StarRating value={filteredSummary.avgRating} size="sm" />
        <span className="text-sm text-gray-500">
          {formatRating(filteredSummary.avgRating)} ({filteredSummary.totalCount}개 후기)
        </span>
      </div>

      {/* ISS-038: 시간대별 필터 */}
      <div className="mb-4 space-y-2 rounded-xl border border-[#4A6741]/15 bg-[#F5F1E8] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#4A6741]">언제 다녀왔는지</span>
          {(["all", "weekday", "weekend"] as DayType[]).map((dt) => {
            const labels = { all: "전체", weekday: "평일", weekend: "주말" };
            const counts = distribution
              ? dt === "weekday"
                ? ` (${distribution.weekday})`
                : dt === "weekend"
                ? ` (${distribution.weekend})`
                : ""
              : "";
            return (
              <button
                key={dt}
                type="button"
                onClick={() => handleDayChange(dt)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  dayType === dt
                    ? "bg-[#4A6741] text-white"
                    : "border border-[#4A6741]/30 bg-white text-[#4A6741] hover:bg-[#4A6741]/10"
                }`}
              >
                {labels[dt]}{counts}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#4A6741]">계절</span>
          {(["all", "spring", "summer", "autumn", "winter"] as Season[]).map((s) => {
            const labels = {
              all: "전체", spring: "봄", summer: "여름", autumn: "가을", winter: "겨울",
            };
            const counts =
              distribution && s !== "all" ? ` (${distribution[s]})` : "";
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSeasonChange(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  season === s
                    ? "bg-[#4A6741] text-white"
                    : "border border-[#4A6741]/30 bg-white text-[#4A6741] hover:bg-[#4A6741]/10"
                }`}
              >
                {labels[s]}{counts}
              </button>
            );
          })}
        </div>
      </div>

      {/* 리뷰 목록 */}
      {reviews.length === 0 && !loading ? (
        <p className="py-8 text-center text-sm text-gray-400">
          이 조건에 해당하는 후기가 아직 없어요
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* 더 보기 */}
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "불러오는 중..." : "더 보기"}
        </button>
      )}
    </div>
  );
}
