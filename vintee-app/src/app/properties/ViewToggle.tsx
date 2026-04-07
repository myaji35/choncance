"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ViewToggleProps {
  view: "list" | "map";
}

export default function ViewToggle({ view }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = (next: "list" | "map") => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "list") {
      params.delete("view");
    } else {
      params.set("view", next);
    }
    const qs = params.toString();
    router.push(`/properties${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-gray-300">
      <button
        type="button"
        onClick={() => setView("list")}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition ${
          view === "list"
            ? "bg-[#00A1E0] text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        aria-pressed={view === "list"}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        리스트
      </button>
      <button
        type="button"
        onClick={() => setView("map")}
        className={`flex items-center gap-1.5 border-l border-gray-300 px-3 py-2 text-sm font-semibold transition ${
          view === "map"
            ? "bg-[#00A1E0] text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        aria-pressed={view === "map"}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        지도
      </button>
    </div>
  );
}
