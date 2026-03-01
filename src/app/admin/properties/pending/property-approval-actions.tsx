"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Eye, Loader2 } from "lucide-react";

interface PropertyApprovalActionsProps {
  propertyId: string;
  propertyName: string;
}

export function PropertyApprovalActions({
  propertyId,
  propertyName,
}: PropertyApprovalActionsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!confirm(`"${propertyName}" 숙소를 승인하시겠습니까?`)) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/admin/properties/${propertyId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "APPROVED" }),
        }
      );

      if (!response.ok) throw new Error("승인 처리 실패");

      router.refresh();
    } catch {
      alert("숙소 승인에 실패했습니다");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (rejectReason.trim().length < 10) {
      setRejectError("거절 사유는 최소 10자 이상 입력해주세요");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/admin/properties/${propertyId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "REJECTED",
            rejectionReason: rejectReason.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("거절 처리 실패");

      setRejectOpen(false);
      router.refresh();
    } catch {
      alert("숙소 거절에 실패했습니다");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/property/${propertyId}`)}
          disabled={isProcessing}
        >
          <Eye className="h-4 w-4 mr-2" />
          상세보기
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleApprove}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          승인
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setRejectReason("");
            setRejectError(null);
            setRejectOpen(true);
          }}
          disabled={isProcessing}
        >
          <X className="h-4 w-4 mr-2" />
          거절
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>숙소 거절</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">거절 사유 *</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError(null);
                }}
                placeholder="거절 사유를 입력해주세요 (최소 10자)"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 text-right">
                {rejectReason.length}/500
              </p>
              {rejectError && (
                <p className="text-sm text-red-600">{rejectError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? "처리 중..." : "거절 확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
