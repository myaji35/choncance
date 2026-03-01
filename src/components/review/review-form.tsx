"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/host/image-upload";

const reviewSchema = z.object({
  rating: z.number().min(1, "별점을 선택해주세요").max(5),
  content: z
    .string()
    .min(10, "리뷰는 최소 10자 이상 작성해주세요")
    .max(500, "리뷰는 최대 500자까지 작성 가능합니다"),
  images: z.array(z.string()).optional(),
  snsShareConsent: z.boolean().optional().default(false),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  bookingId: string;
  propertyId: string;
  propertyName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  bookingId,
  propertyId,
  propertyName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [snsShareConsent, setSnsShareConsent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      content: "",
      images: [],
      snsShareConsent: false,
    },
  });

  const contentValue = watch("content");

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue("rating", rating, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          propertyId,
          rating: data.rating,
          content: data.content,
          images: images,
          snsShareConsent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "리뷰 등록에 실패했습니다");
      }

      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Review submission error:", err);
      setError(err.message || "리뷰 등록 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Property Name */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{propertyName}</h3>
        <p className="text-sm text-gray-600 mt-1">
          숙소에 대한 경험을 공유해주세요
        </p>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label>
          별점 <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRatingClick(rating)}
              onMouseEnter={() => setHoverRating(rating)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  rating <= (hoverRating || selectedRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {selectedRating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {selectedRating}점
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="text-sm text-red-500">{errors.rating.message}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">
          리뷰 내용 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="content"
          placeholder="숙소에 대한 솔직한 의견을 작성해주세요. 다른 게스트들에게 큰 도움이 됩니다."
          rows={6}
          {...register("content")}
          className={errors.content ? "border-red-500" : ""}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
        <p className="text-xs text-gray-500">
          최소 10자 이상, 최대 500자까지 작성 가능합니다
        </p>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>사진 (선택)</Label>
        <ImageUpload
          value={images}
          onChange={setImages}
          maxImages={5}
          label=""
          folder="reviews"
        />
        <p className="text-xs text-gray-500">
          최대 5장까지 업로드 가능합니다
        </p>
      </div>

      {/* SNS Consent */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox
            id="sns-consent"
            checked={snsShareConsent}
            onCheckedChange={(checked) => setSnsShareConsent(checked === true)}
          />
          <div className="flex-1">
            <Label htmlFor="sns-consent" className="text-sm font-medium cursor-pointer">
              SNS 공유 동의 시 1,000 크레딧 적립! 🎁
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              작성하신 리뷰를 VINTEE의 공식 SNS 채널(페이스북, 인스타그램, 틱톡, 쓰레드)에
              공유하는 것에 동의하시면 1,000 크레딧을 지급해드립니다.
            </p>
          </div>
        </div>
        {snsShareConsent && (
          <div className="ml-7 p-3 bg-white rounded border border-blue-200">
            <p className="text-xs text-gray-600">
              ✓ 공개되는 정보: 별점, 리뷰 내용, 작성자 이름(첫 글자 마스킹)
              <br />✓ 공유 채널: Facebook, Instagram, TikTok, Threads
              <br />✓ 크레딧은 리뷰 작성 즉시 지급됩니다
            </p>
          </div>
        )}
      </div>

      {/* Content Length */}
      <p className="text-xs text-gray-500 text-right">
        {contentValue?.length ?? 0} / 500자
      </p>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              등록 중...
            </>
          ) : (
            "리뷰 등록하기"
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
        )}
      </div>
    </form>
  );
}
