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
import { AlertCircle, XCircle } from "lucide-react";

interface RejectBookingDialogProps {
  bookingId: string;
  children: React.ReactNode;
}

export function RejectBookingDialog({
  bookingId,
  children,
}: RejectBookingDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReject = async () => {
    if (reason.trim().length < 10) {
      setError("거절 사유를 10자 이상 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/host/bookings/${bookingId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "예약 거절에 실패했습니다");
      }

      // Success
      setOpen(false);
      setReason("");
      router.refresh();

      // Show success message
      alert("예약이 거절되었습니다");
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
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            예약 거절
          </DialogTitle>
          <DialogDescription>
            이 예약을 거절하는 이유를 입력해주세요
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">거절 사유 *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="예: 해당 날짜에 이미 예약이 확정되었습니다.&#10;예: 숙소 수리 작업으로 인해 이용이 불가능합니다."
              rows={5}
              className={error && reason.length < 10 ? "border-red-500" : ""}
            />
            <p className="text-xs text-gray-500">
              최소 10자 이상 입력해주세요 ({reason.length}/10)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>참고:</strong> 예약을 거절하면 게스트에게 전액 환불됩니다.
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
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting || reason.trim().length < 10}
          >
            {isSubmitting ? "처리 중..." : "거절하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
