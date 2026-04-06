"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    address: "",
    pricePerNight: "",
    maxGuests: "4",
    phone: "",
    status: "active" as "draft" | "active",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pricePerNight: form.pricePerNight ? Number(form.pricePerNight) : undefined,
        maxGuests: Number(form.maxGuests),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "등록에 실패했습니다");
      setLoading(false);
      return;
    }

    toast("숙소가 등록되었습니다!");
    router.push("/host");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-bold text-[#16325C]">숙소 등록</h1>
      <p className="mt-1 text-sm text-gray-500">촌캉스 숙소를 등록해 보세요</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">숙소명 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
            placeholder="예: 논뷰 한옥 펜션"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">소개</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
            placeholder="숙소의 특징과 매력을 소개해 주세요"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">지역 *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
              placeholder="예: 충남 아산"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">상세 주소</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
              placeholder="상세 주소"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">1박 가격 (원)</label>
            <input
              type="number"
              value={form.pricePerNight}
              onChange={(e) => update("pricePerNight", e.target.value)}
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
              placeholder="120000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">최대 인원</label>
            <input
              type="number"
              value={form.maxGuests}
              onChange={(e) => update("maxGuests", e.target.value)}
              min={1}
              max={20}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">연락처</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
              placeholder="010-0000-0000"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">공개 상태</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          >
            <option value="active">바로 공개</option>
            <option value="draft">임시 저장</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-[#00A1E0] py-2.5 text-sm font-bold text-white hover:bg-[#0090C7] disabled:opacity-50"
          >
            {loading ? "등록 중..." : "숙소 등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
