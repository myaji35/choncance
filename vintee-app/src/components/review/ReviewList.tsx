"use client";

import { useState } from "react";
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

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    const res = await fetch(
      `/api/properties/${propertyId}/reviews?page=${nextPage}&limit=10`
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
        <StarRating value={summary.avgRating} size="sm" />
        <span className="text-sm text-gray-500">
          {formatRating(summary.avgRating)} ({summary.totalCount}개 후기)
        </span>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

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
