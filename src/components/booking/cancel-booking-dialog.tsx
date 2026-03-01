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
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface CancelBookingDialogProps {
  bookingId: string;
  checkInDate: Date;
  totalAmount: number;
  children: React.ReactNode;
}

function calculateCancellationPolicy(checkInDate: Date) {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilCheckIn = (checkInDate.getTime() - now.getTime()) / msPerDay;

  if (daysUntilCheckIn < 1) {
    return {
      allowed: false,
      refundRate: 0,
      description: "체크인 24시간 전에는 취소할 수 없습니다",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    };
  }

  if (daysUntilCheckIn >= 7) {
    return {
      allowed: true,
      refundRate: 1.0,
      description: "전액 환불",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    };
  }

  if (daysUntilCheckIn >= 3) {
    return {
      allowed: true,
      refundRate: 0.5,
      description: "50% 환불",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    };
  }

  return {
    allowed: true,
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
  const [success, setSuccess] = useState<{ refundAmount: number; policy: string } | null>(null);

  const policy = calculateCancellationPolicy(checkInDate);
  const refundAmount = Math.round(totalAmount * policy.refundRate);

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setReason("");
      setError(null);
      setSuccess(null);
    }
    setOpen(val);
  };

  const handleCancel = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      setError("취소 사유를 10자 이상 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: reason.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "예약 취소에 실패했습니다");
      }

      setSuccess({
        refundAmount: data.refund?.amount ?? 0,
        policy: data.refund?.policy ?? policy.description,
      });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "예약 취소에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                예약이 취소되었습니다
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">환불 정책</span>
                  <span className="font-medium">{success.policy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">환불 금액</span>
                  <span className="text-lg font-bold text-green-700">
                    ₩{success.refundAmount.toLocaleString()}
                  </span>
                </div>
                {success.refundAmount > 0 && (
                  <p className="text-xs text-gray-500 pt-1 border-t border-green-200">
                    환불은 3-5 영업일 내에 원 결제 수단으로 처리됩니다
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>확인</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>예약 취소</DialogTitle>
              <DialogDescription>
                예약을 취소하시겠습니까? 취소 정책에 따라 환불 금액이 결정됩니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Cancellation Policy */}
              <div className={`p-4 rounded-lg border ${policy.bgColor} ${policy.borderColor}`}>
                <div className="flex items-start gap-3">
                  <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${policy.color}`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${policy.color}`}>
                      현재 취소 정책: {policy.description}
                    </h4>
                    <div className="space-y-1 text-xs text-gray-600 mt-2">
                      <p>• 체크인 7일 전: 전액 환불</p>
                      <p>• 체크인 3~6일 전: 50% 환불</p>
                      <p>• 체크인 1~2일 전: 환불 불가</p>
                      <p>• 체크인 24시간 이내: 취소 불가</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund Amount */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-gray-600">총 결제 금액</span>
                  <span className="font-medium">₩{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-semibold">예상 환불 금액</span>
                  <span className={`text-lg font-bold ${policy.color}`}>
                    ₩{refundAmount.toLocaleString()}
                  </span>
                </div>
                {refundAmount > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    환불은 3-5 영업일 내에 처리됩니다
                  </p>
                )}
              </div>

              {/* Cancellation Reason */}
              <div className="space-y-2">
                <Label htmlFor="cancel-reason">취소 사유 *</Label>
                <Textarea
                  id="cancel-reason"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError(null);
                  }}
                  placeholder="예약을 취소하는 사유를 입력해주세요 (최소 10자)"
                  rows={3}
                  maxLength={500}
                  className={error ? "border-red-500" : ""}
                  disabled={!policy.allowed}
                />
                <p className="text-xs text-gray-400 text-right">{reason.length}/500</p>
                {error && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              {/* Not allowed warning */}
              {!policy.allowed && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{policy.description}</p>
                  </div>
                </div>
              )}

              {/* No refund warning */}
              {policy.allowed && policy.refundRate === 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      취소하셔도 환불이 되지 않습니다. 그래도 취소하시겠습니까?
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                돌아가기
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancel}
                disabled={isSubmitting || !policy.allowed}
              >
                {isSubmitting ? "처리 중..." : "예약 취소하기"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
