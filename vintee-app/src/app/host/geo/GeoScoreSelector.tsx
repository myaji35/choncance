"use client";

import { useRouter } from "next/navigation";

interface GeoScoreSelectorProps {
  properties: { id: string; title: string; location: string }[];
  selectedId: string;
}

export default function GeoScoreSelector({ properties, selectedId }: GeoScoreSelectorProps) {
  const router = useRouter();

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">숙소 선택</label>
      <select
        value={selectedId}
        onChange={(e) => router.push(`/host/geo?propertyId=${e.target.value}`)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
      >
        {properties.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title} — {p.location}
          </option>
        ))}
      </select>
    </div>
  );
}
