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
import { Check, X, Eye, Loader2, MessageSquare } from "lucide-react";

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
  const [modifyOpen, setModifyOpen] = useState(false);
  const [modifyReason, setModifyReason] = useState("");
  const [modifyError, setModifyError] = useState<string | null>(null);

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

  const handleModifySubmit = async () => {
    if (modifyReason.trim().length < 20) {
      setModifyError("수정 요청 내용은 최소 20자 이상 입력해주세요");
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
            status: "PENDING",
            modificationRequest: modifyReason.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("수정 요청 실패");

      setModifyOpen(false);
      router.refresh();
    } catch {
      alert("수정 요청에 실패했습니다");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (rejectReason.trim().length < 20) {
      setRejectError("거절 사유는 최소 20자 이상 입력해주세요");
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
      <div className="flex gap-2 pt-4 flex-wrap">
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
          variant="outline"
          size="sm"
          onClick={() => {
            setModifyReason("");
            setModifyError(null);
            setModifyOpen(true);
          }}
          disabled={isProcessing}
          className="border-amber-400 text-amber-700 hover:bg-amber-50"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          수정 요청
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

      {/* Reject Dialog */}
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
                placeholder="거절 사유를 입력해주세요 (최소 20자)"
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

      {/* Modification Request Dialog */}
      <Dialog open={modifyOpen} onOpenChange={setModifyOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>수정 요청</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              호스트에게 숙소 정보 수정을 요청합니다. 수정이 필요한 항목을 구체적으로 알려주세요.
            </p>
            <div className="space-y-2">
              <Label htmlFor="modify-reason">수정 요청 내용 *</Label>
              <Textarea
                id="modify-reason"
                value={modifyReason}
                onChange={(e) => {
                  setModifyReason(e.target.value);
                  setModifyError(null);
                }}
                placeholder="수정이 필요한 내용을 구체적으로 입력해주세요 (최소 20자)"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 text-right">
                {modifyReason.length}/500
              </p>
              {modifyError && (
                <p className="text-sm text-red-600">{modifyError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModifyOpen(false)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleModifySubmit}
              disabled={isProcessing}
            >
              {isProcessing ? "처리 중..." : "수정 요청 전송"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
