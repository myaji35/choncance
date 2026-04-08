"use client";

// ISS-041: 결제하기 버튼
// 운영: 토스 위젯 SDK로 결제 진행 → 성공 콜백에서 /api/payments/confirm 호출
// dev: mock paymentKey로 즉시 confirm 호출 (토스 SDK 설치 없이 동작)

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
  amount: number;
  paymentStatus: string;
  bookingStatus: string;
}

export default function PayButton({
  bookingId,
  amount,
  paymentStatus,
  bookingStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (paymentStatus === "paid") {
    return (
      <div className="rounded-xl border border-[#4A6741]/30 bg-[#F5F1E8] p-4 text-center">
        <p className="text-sm font-bold text-[#4A6741]">결제 완료</p>
        <p className="mt-1 text-xs text-gray-600">
          {amount.toLocaleString()}원이 결제되었어요
        </p>
      </div>
    );
  }

  if (bookingStatus === "CANCELLED") {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
        취소된 예약이에요
      </div>
    );
  }

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      // dev mock: paymentKey = "mock-" + bookingId
      // 운영: 토스 위젯 SDK를 사용해 paymentKey를 받아야 함
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentKey: `mock-${bookingId}-${Date.now()}`,
          orderId: bookingId,
          amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "결제 실패");
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#D97B3F]/30 bg-[#F5F1E8] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D97B3F]">
            결제 필요
          </p>
          <p className="mt-1 text-lg font-bold text-[#1F2937]">
            {amount.toLocaleString()}원
          </p>
        </div>
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="shrink-0 rounded-xl bg-[#D97B3F] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#C26A30] disabled:opacity-50"
        >
          {loading ? "결제 중..." : "결제하기"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
      {!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY && (
        <p className="mt-2 text-[10px] text-gray-500">
          * 개발 환경: TOSS_SECRET_KEY 미설정 → mock 결제로 즉시 처리됩니다.
        </p>
      )}
    </div>
  );
}
