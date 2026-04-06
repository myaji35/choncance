"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

interface BookingFormProps {
  propertyId: string;
  pricePerNight: number | null;
  maxGuests: number;
  hostId: string;
}

export default function BookingForm({
  propertyId,
  pricePerNight,
  maxGuests,
  hostId,
}: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwnProperty = session?.user?.id === hostId;
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const totalPrice = (pricePerNight ?? 0) * nights;

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, checkIn, checkOut, guestCount, message: message || undefined }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "예약에 실패했습니다");
      setLoading(false);
      return;
    }

    toast("예약이 완료되었습니다!");
    router.push("/bookings");
    router.refresh();
  };

  if (!session) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-600">로그인 후 예약할 수 있습니다</p>
        <Link
          href="/login"
          className="mt-3 block w-full rounded-lg bg-[#00A1E0] py-2.5 text-center text-sm font-bold text-white hover:bg-[#0090C7]"
        >
          로그인
        </Link>
      </div>
    );
  }

  if (isOwnProperty) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">본인 숙소는 예약할 수 없습니다</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-5 space-y-4"
    >
      {pricePerNight && (
        <p className="text-lg font-bold text-[#16325C]">
          {pricePerNight.toLocaleString()}원{" "}
          <span className="text-sm font-normal text-gray-500">/ 박</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">체크인</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">체크아웃</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || today}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          인원 (최대 {maxGuests}명)
        </label>
        <select
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
        >
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}명
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          호스트에게 메시지 (선택)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          maxLength={500}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          placeholder="도착 예정 시간 등을 알려주세요"
        />
      </div>

      {nights > 0 && pricePerNight && (
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {pricePerNight.toLocaleString()}원 × {nights}박
            </span>
            <span className="font-bold text-[#16325C]">
              {totalPrice.toLocaleString()}원
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || nights === 0}
        className="w-full rounded-lg bg-[#00A1E0] py-2.5 text-sm font-bold text-white hover:bg-[#0090C7] disabled:opacity-50"
      >
        {loading ? "예약 중..." : nights > 0 ? "예약하기" : "날짜를 선택해주세요"}
      </button>
    </form>
  );
}
