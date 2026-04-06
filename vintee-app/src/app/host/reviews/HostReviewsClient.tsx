"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReviewCard from "@/components/review/ReviewCard";
import HostResponseForm from "@/components/review/HostResponseForm";

interface ReviewData {
  id: string;
  rating: number;
  content: string;
  guestName: string;
  createdAt: string;
  hostReply: string | null;
  repliedAt: string | null;
  propertyTitle: string;
}

export default function HostReviewsClient({
  reviews,
}: {
  reviews: ReviewData[];
}) {
  const router = useRouter();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-gray-400">아직 리뷰가 없습니다</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id}>
          <p className="mb-1 text-xs font-medium text-gray-500">
            {review.propertyTitle}
          </p>
          <ReviewCard
            review={review}
            isHost
            onReply={(id) => setReplyingTo(id)}
          />
          {replyingTo === review.id && (
            <HostResponseForm
              reviewId={review.id}
              onSuccess={() => {
                setReplyingTo(null);
                router.refresh();
              }}
              onCancel={() => setReplyingTo(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
