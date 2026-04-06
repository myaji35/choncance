"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface BookingData {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalPrice: number;
  message: string | null;
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기중", color: "#F59E0B" },
  CONFIRMED: { label: "확정", color: "#00A1E0" },
  COMPLETED: { label: "완료", color: "#10B981" },
  CANCELLED: { label: "취소", color: "#EF4444" },
};

export default function HostBookingsClient({
  bookings,
}: {
  bookings: BookingData[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const changeStatus = async (id: string, status: string) => {
    setLoadingId(id);
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast(data.error || "상태 변경에 실패했습니다", "error");
    } else {
      const data = await res.json();
      toast(data.message);
      router.refresh();
    }
    setLoadingId(null);
  };

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === "PENDING").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div>
      {/* 필터 탭 */}
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map(
          (key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filter === key
                  ? "bg-[#16325C] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {key === "ALL" ? "전체" : statusConfig[key]?.label}{" "}
              <span className="text-xs opacity-70">{counts[key]}</span>
            </button>
          )
        )}
      </div>

      {/* 예약 목록 */}
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-gray-400">예약이 없습니다</p>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((b) => {
            const st = statusConfig[b.status] || { label: b.status, color: "#6B7280" };
            const isLoading = loadingId === b.id;

            return (
              <div
                key={b.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400">{b.propertyTitle}</p>
                    <p className="mt-0.5 font-bold text-gray-900">
                      {b.guestName}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        ({b.guestEmail})
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(b.checkIn).toLocaleDateString("ko-KR")} ~{" "}
                      {new Date(b.checkOut).toLocaleDateString("ko-KR")} ·{" "}
                      {b.guestCount}명
                    </p>
                    {b.totalPrice > 0 && (
                      <p className="text-sm font-medium text-[#16325C]">
                        {b.totalPrice.toLocaleString()}원
                      </p>
                    )}
                    {b.message && (
                      <p className="mt-1 text-xs text-gray-400">
                        &quot;{b.message}&quot;
                      </p>
                    )}
                  </div>
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: st.color }}
                  >
                    {st.label}
                  </span>
                </div>

                {/* 액션 버튼 */}
                <div className="mt-3 flex gap-2">
                  {b.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => changeStatus(b.id, "CONFIRMED")}
                        disabled={isLoading}
                        className="rounded-lg bg-[#00A1E0] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0090C7] disabled:opacity-50"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => changeStatus(b.id, "CANCELLED")}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        거절
                      </button>
                    </>
                  )}
                  {b.status === "CONFIRMED" && (
                    <button
                      onClick={() => changeStatus(b.id, "COMPLETED")}
                      disabled={isLoading}
                      className="rounded-lg bg-[#10B981] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#059669] disabled:opacity-50"
                    >
                      완료 처리
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
