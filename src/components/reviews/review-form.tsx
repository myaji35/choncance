"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  bookingId: string;
  propertyId: string;
  propertyName: string;
  onSuccess?: () => void;
}

export function ReviewForm({
  bookingId,
  propertyId,
  propertyName,
  onSuccess,
}: ReviewFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");
  const [snsShareConsent, setSnsShareConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "별점을 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    if (content.trim().length < 10) {
      toast({
        title: "리뷰 내용을 10자 이상 작성해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          propertyId,
          rating,
          content: content.trim(),
          snsShareConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "리뷰 작성에 실패했습니다");
      }

      toast({
        title: data.message || "리뷰가 작성되었습니다",
        description:
          data.creditsAwarded > 0
            ? `${data.creditsAwarded} 크레딧이 지급되었습니다!`
            : undefined,
      });

      // Reset form
      setRating(0);
      setContent("");
      setSnsShareConsent(false);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/bookings");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      toast({
        title: "오류",
        description:
          error instanceof Error
            ? error.message
            : "리뷰 작성 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg">{propertyName}</h3>
        <p className="text-sm text-gray-600">이용하신 숙소는 어떠셨나요?</p>
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>별점 *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600">
            {rating === 1 && "별로예요"}
            {rating === 2 && "그저 그래요"}
            {rating === 3 && "괜찮아요"}
            {rating === 4 && "좋아요"}
            {rating === 5 && "최고예요!"}
          </p>
        )}
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <Label htmlFor="content">리뷰 내용 *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="숙소에 대한 솔직한 후기를 남겨주세요. (최소 10자)"
          rows={6}
          className="resize-none"
        />
        <p className="text-sm text-gray-500">
          {content.length} / 500자 (최소 10자)
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
            <Label
              htmlFor="sns-consent"
              className="text-sm font-medium cursor-pointer"
            >
              SNS 공유 동의 시 1,000 크레딧 적립! 🎁
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              작성하신 리뷰를 VINTEE의 공식 SNS 채널(페이스북, 인스타그램, 틱톡,
              쓰레드)에 공유하는 것에 동의하시면 1,000 크레딧을 지급해드립니다.
              크레딧은 다음 예약 시 할인으로 사용하실 수 있습니다.
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

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1"
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "작성 중..." : "리뷰 작성"}
        </Button>
      </div>
    </form>
  );
}
