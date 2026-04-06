import StarRating from "./StarRating";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    content: string;
    guestName: string;
    createdAt: string;
    hostReply?: string | null;
    repliedAt?: string | null;
  };
  isHost?: boolean;
  onReply?: (reviewId: string) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ReviewCard({
  review,
  isHost,
  onReply,
}: ReviewCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {/* 헤더: 게스트 이름 + 별점 + 날짜 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16325C] text-sm font-bold text-white">
            {review.guestName[0]}
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900">
              {review.guestName}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {/* 리뷰 본문 */}
      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        {review.content}
      </p>

      {/* 호스트 답글 */}
      {review.hostReply && (
        <div className="mt-3 rounded-lg border-l-4 border-[#00A1E0] bg-gray-50 p-3">
          <div className="flex items-center gap-1.5">
            <span className="rounded px-1.5 py-0.5 text-xs font-bold text-white" style={{ background: "#00A1E0" }}>
              호스트
            </span>
            {review.repliedAt && (
              <span className="text-xs text-gray-400">
                {formatDate(review.repliedAt)}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-gray-600">{review.hostReply}</p>
        </div>
      )}

      {/* 호스트 답글 작성 버튼 */}
      {isHost && !review.hostReply && onReply && (
        <button
          type="button"
          onClick={() => onReply(review.id)}
          className="mt-3 text-sm font-medium text-[#00A1E0] hover:underline"
        >
          답글 작성
        </button>
      )}
    </div>
  );
}
