"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

interface ApproveButtonProps {
  hostId: string;
  hostName: string;
}

export function HostApproveButton({ hostId, hostName }: ApproveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm(`${hostName}님의 호스트 신청을 승인하시겠습니까?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/hosts/${hostId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "승인에 실패했습니다");
      }

      alert("호스트가 승인되었습니다");
      router.refresh();
    } catch (error) {
      console.error("Host approval failed:", error);
      alert(error instanceof Error ? error.message : "승인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleApprove}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Check className="h-4 w-4 mr-1" />
      )}
      승인
    </Button>
  );
}

export function HostRejectButton({ hostId, hostName }: ApproveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    const reason = prompt(
      `${hostName}님의 호스트 신청을 거부합니다.\n거부 사유를 입력해주세요 (10자 이상):`
    );

    if (!reason) return;

    if (reason.trim().length < 10) {
      alert("거부 사유를 10자 이상 입력해주세요");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/hosts/${hostId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "거부에 실패했습니다");
      }

      alert("호스트 신청이 거부되었습니다");
      router.refresh();
    } catch (error) {
      console.error("Host rejection failed:", error);
      alert(error instanceof Error ? error.message : "거부에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleReject}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <X className="h-4 w-4 mr-1" />
      )}
      거부
    </Button>
  );
}
