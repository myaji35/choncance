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
import { AlertCircle, Info } from "lucide-react";

interface CancelBookingDialogProps {
  bookingId: string;
  checkInDate: Date;
  totalAmount: number;
  children: React.ReactNode;
}

function calculateCancellationPolicy(checkInDate: Date) {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - now.getTime()) / msPerDay
  );

  // 체크인 7일 전: 전액 환불
  if (daysUntilCheckIn >= 7) {
    return {
      refundRate: 1.0,
      description: "전액 환불",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    };
  }

  // 체크인 3~6일 전: 50% 환불
  if (daysUntilCheckIn >= 3) {
    return {
      refundRate: 0.5,
      description: "50% 환불",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    };
  }

  // 체크인 2일 전 이내: 환불 불가
  return {
    refundRate: 0,
    description: "환불 불가",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  };
}

export function CancelBookingDialog({
  bookingId,
  checkInDate,
  totalAmount,
  children,
}: CancelBookingDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const policy = calculateCancellationPolicy(checkInDate);
  const refundAmount = Math.round(totalAmount * policy.refundRate);

  const handleCancel = async () => {
    if (!reason || reason.trim().length === 0) {
      setError("취소 사유를 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "예약 취소에 실패했습니다");
      }

      // Success - close dialog and refresh
      setOpen(false);
      router.refresh();

      // Show success message (you can add a toast here)
      alert(
        `예약이 취소되었습니다.\n환불 금액: ₩${refundAmount.toLocaleString()}\n처리 기간: 3-5일`
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>예약 취소</DialogTitle>
          <DialogDescription>
            예약을 취소하시겠습니까? 취소 정책에 따라 환불 금액이 결정됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cancellation Policy */}
          <div
            className={`p-4 rounded-lg border ${policy.bgColor} ${policy.borderColor}`}
          >
            <div className="flex items-start gap-3">
              <Info className={`w-5 h-5 mt-0.5 ${policy.color}`} />
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${policy.color}`}>
                  취소 정책
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  {policy.description}
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>• 체크인 7일 전: 전액 환불</p>
                  <p>• 체크인 3~6일 전: 50% 환불</p>
                  <p>• 체크인 2일 전 이내: 환불 불가</p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Amount */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">총 결제 금액</span>
              <span className="font-medium">
                ₩{totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-semibold">예상 환불 금액</span>
              <span className={`text-lg font-bold ${policy.color}`}>
                ₩{refundAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              환불은 3-5 영업일 내에 처리됩니다
            </p>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">취소 사유 *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="예약을 취소하는 사유를 입력해주세요"
              rows={3}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Warning */}
          {policy.refundRate === 0 && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">환불이 불가능합니다</p>
                  <p>
                    체크인 2일 전 이내에는 취소 시 환불이 되지 않습니다. 그래도
                    취소하시겠습니까?
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            돌아가기
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "예약 취소하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
