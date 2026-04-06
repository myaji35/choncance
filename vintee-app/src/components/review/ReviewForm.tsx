"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import StarRating from "./StarRating";
import {
  createReviewSchema,
  type CreateReviewInput,
} from "@/lib/validations/review";

interface ReviewFormProps {
  bookingId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ bookingId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      bookingId,
      rating: 0,
      content: "",
      snsShareConsent: false,
    },
  });

  const contentValue = watch("content");

  const onSubmit = async (data: CreateReviewInput) => {
    if (rating < 1) {
      setServerError("별점을 선택해주세요");
      return;
    }

    setSubmitting(true);
    setServerError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, rating }),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(err.error || "리뷰 등록에 실패했습니다");
      setSubmitting(false);
      return;
    }

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* 별점 */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          이번 숙소는 어떠셨나요?
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating === 0 && serverError.includes("별점") && (
          <p className="mt-1 text-xs text-red-500">별점을 선택해주세요</p>
        )}
      </div>

      {/* 후기 내용 */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          후기 내용
        </label>
        <textarea
          {...register("content")}
          rows={5}
          placeholder="최소 10자 이상 작성해 주세요"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
        />
        <div className="mt-1 flex justify-between">
          {errors.content ? (
            <p className="text-xs text-red-500">{errors.content.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">
            {contentValue?.length || 0}/500
          </span>
        </div>
      </div>

      {/* SNS 공유 동의 */}
      <label className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <input
          type="checkbox"
          {...register("snsShareConsent")}
          className="mt-0.5 rounded border-gray-300"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">
            SNS에 리뷰를 공유해도 좋습니다
          </span>
          <p className="mt-0.5 text-xs text-gray-500">
            동의 시 1,000 크레딧이 지급됩니다
          </p>
        </div>
      </label>

      {/* 에러 메시지 */}
      {serverError && !serverError.includes("별점") && (
        <p className="text-sm text-red-500">{serverError}</p>
      )}

      {/* 제출 */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[#00A1E0] py-2.5 text-sm font-bold text-white hover:bg-[#0090C7] disabled:opacity-50"
      >
        {submitting ? "등록 중..." : "리뷰 등록"}
      </button>
    </form>
  );
}
