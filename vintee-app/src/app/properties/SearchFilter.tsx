"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchFilterProps {
  locations: string[];
  initialValues: {
    q: string;
    location: string;
    minPrice: string;
    maxPrice: string;
    guests: string;
  };
}

export default function SearchFilter({ locations, initialValues }: SearchFilterProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialValues);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.q) params.set("q", form.q);
    if (form.location) params.set("location", form.location);
    if (form.minPrice) params.set("minPrice", form.minPrice);
    if (form.maxPrice) params.set("maxPrice", form.maxPrice);
    if (form.guests) params.set("guests", form.guests);
    router.push(`/properties?${params.toString()}`);
  };

  const handleReset = () => {
    setForm({ q: "", location: "", minPrice: "", maxPrice: "", guests: "" });
    router.push("/properties");
  };

  const hasFilters = Object.values(form).some((v) => v !== "");

  return (
    <form onSubmit={handleSearch} className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* 키워드 */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">키워드</label>
          <input
            type="text"
            value={form.q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="숙소명, 설명 검색"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
        </div>

        {/* 지역 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">지역</label>
          <select
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          >
            <option value="">전체 지역</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* 가격 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">가격 (원)</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={form.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              placeholder="최소"
              min={0}
              className="w-full rounded-lg border border-gray-300 px-2 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
            />
            <input
              type="number"
              value={form.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              placeholder="최대"
              min={0}
              className="w-full rounded-lg border border-gray-300 px-2 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
            />
          </div>
        </div>

        {/* 인원 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">인원</label>
          <select
            value={form.guests}
            onChange={(e) => update("guests", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          >
            <option value="">상관없음</option>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>{n}명 이상</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[#00A1E0] px-4 py-2 text-sm font-medium text-white hover:bg-[#0090C7]"
        >
          검색
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            초기화
          </button>
        )}
      </div>
    </form>
  );
}
