"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, AlertCircle, Image as ImageIcon } from "lucide-react";

interface WriteReviewDialogProps {
  bookingId: string;
  propertyName: string;
  children: React.ReactNode;
}

export function WriteReviewDialog({
  bookingId,
  propertyName,
  children,
}: WriteReviewDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("별점을 선택해주세요");
      return;
    }

    if (content.trim().length < 10) {
      setError("리뷰 내용을 10자 이상 입력해주세요");
      return;
    }

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
          rating,
          content,
          // TODO: Add image upload functionality
          images: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "리뷰 작성에 실패했습니다");
      }

      // Success
      setOpen(false);
      router.refresh();

      // Show success message
      alert("리뷰가 작성되었습니다!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>리뷰 작성</DialogTitle>
          <DialogDescription>
            {propertyName}에서의 경험을 공유해주세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>별점 *</Label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      i < displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-600 ml-2">
                  {rating}점
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">리뷰 내용 *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              placeholder="숙소에서의 경험을 자세히 알려주세요&#10;- 숙소의 분위기는 어땠나요?&#10;- 호스트는 친절했나요?&#10;- 주변 환경과 시설은 만족스러웠나요?"
              rows={8}
              className={error && content.length < 10 ? "border-red-500" : ""}
            />
            <p className="text-xs text-gray-500">
              최소 10자 이상 작성해주세요 ({content.length}/10)
            </p>
          </div>

          {/* Image Upload Placeholder */}
          <div className="space-y-2">
            <Label>사진 추가 (선택)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">
                이미지 업로드 기능은 준비 중입니다
              </p>
              <p className="text-xs text-gray-500">
                추후 업데이트에서 제공될 예정입니다
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || content.trim().length < 10}
          >
            {isSubmitting ? "작성 중..." : "리뷰 작성하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
