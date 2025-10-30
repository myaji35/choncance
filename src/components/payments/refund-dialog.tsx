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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface RefundDialogProps {
  paymentId: string;
  amount: number;
  trigger?: React.ReactNode;
}

export function RefundDialog({ paymentId, amount, trigger }: RefundDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefund = async () => {
    if (!reason.trim()) {
      setError("환불 사유를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${paymentId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reason.trim(),
          cancelAmount: amount, // 전액 환불
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "환불 요청에 실패했습니다");
      }

      // 성공
      alert("환불이 요청되었습니다. 영업일 기준 3-5일 내에 처리됩니다.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Refund error:", err);
      setError(err instanceof Error ? err.message : "환불 요청 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            환불 요청
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>환불 요청</DialogTitle>
          <DialogDescription>
            환불 사유를 입력해주세요. 환불은 영업일 기준 3-5일이 소요됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 환불 금액 */}
          <div className="space-y-2">
            <Label>환불 금액</Label>
            <div className="text-2xl font-bold text-primary">
              {amount.toLocaleString()}원
            </div>
          </div>

          {/* 환불 사유 */}
          <div className="space-y-2">
            <Label htmlFor="reason">환불 사유 *</Label>
            <Textarea
              id="reason"
              placeholder="환불을 요청하는 사유를 입력해주세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* 주의사항 */}
          <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">환불 안내</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>환불은 원 결제 수단으로 처리됩니다</li>
                <li>체크인 7일 전: 전액 환불</li>
                <li>체크인 3-6일 전: 50% 환불</li>
                <li>체크인 2일 전 ~ 당일: 환불 불가</li>
              </ul>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleRefund}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "처리 중..." : "환불 요청"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
