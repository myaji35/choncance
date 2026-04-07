"use client";

import { useState } from "react";

export interface NearbyAttractionInput {
  name: string;
  distance: string;
}

export interface GeoFieldsValue {
  checkinTime: string;
  checkoutTime: string;
  highlights: string[];
  nearbyAttractions: NearbyAttractionInput[];
  bestSeason: string;
  hostIntro: string;
  uniqueExperience: string;
  petsAllowed: boolean;
  numberOfRooms: string;
}

interface GeoFieldsSectionProps {
  value: GeoFieldsValue;
  onChange: (next: GeoFieldsValue) => void;
}

const SEASONS = ["", "봄", "여름", "가을", "겨울", "봄/가을", "사계절"];

export default function GeoFieldsSection({ value, onChange }: GeoFieldsSectionProps) {
  const [highlightInput, setHighlightInput] = useState("");
  const [attractionName, setAttractionName] = useState("");
  const [attractionDistance, setAttractionDistance] = useState("");

  const update = <K extends keyof GeoFieldsValue>(key: K, v: GeoFieldsValue[K]) =>
    onChange({ ...value, [key]: v });

  const addHighlight = () => {
    const t = highlightInput.trim();
    if (!t || value.highlights.includes(t) || value.highlights.length >= 20) return;
    update("highlights", [...value.highlights, t]);
    setHighlightInput("");
  };

  const removeHighlight = (h: string) =>
    update(
      "highlights",
      value.highlights.filter((x) => x !== h)
    );

  const addAttraction = () => {
    const n = attractionName.trim();
    const d = attractionDistance.trim();
    if (!n || !d || value.nearbyAttractions.length >= 20) return;
    update("nearbyAttractions", [...value.nearbyAttractions, { name: n, distance: d }]);
    setAttractionName("");
    setAttractionDistance("");
  };

  const removeAttraction = (idx: number) =>
    update(
      "nearbyAttractions",
      value.nearbyAttractions.filter((_, i) => i !== idx)
    );

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
        <h3 className="text-sm font-bold text-[#16325C]">GEO 최적화 정보</h3>
        <p className="mt-0.5 text-xs text-gray-600">
          AI 검색과 지도 노출에 활용됩니다. 많이 채울수록 노출 점수가 올라갑니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">체크인 시간</label>
          <input
            type="time"
            value={value.checkinTime}
            onChange={(e) => update("checkinTime", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">체크아웃 시간</label>
          <input
            type="time"
            value={value.checkoutTime}
            onChange={(e) => update("checkoutTime", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">하이라이트</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addHighlight();
              }
            }}
            placeholder="예: 논뷰 전망"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
          <button
            type="button"
            onClick={addHighlight}
            className="rounded-lg border border-[#00A1E0] px-3 py-2.5 text-sm font-semibold text-[#00A1E0] hover:bg-[#00A1E0] hover:text-white"
          >
            추가
          </button>
        </div>
        {value.highlights.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {value.highlights.map((h) => (
              <li
                key={h}
                className="inline-flex items-center gap-1 rounded-full bg-[#00A1E0] px-3 py-1 text-xs font-medium text-white"
              >
                {h}
                <button
                  type="button"
                  onClick={() => removeHighlight(h)}
                  aria-label={`${h} 제거`}
                  className="ml-1 text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">주변 관광지</label>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            type="text"
            value={attractionName}
            onChange={(e) => setAttractionName(e.target.value)}
            placeholder="이름 (예: 현충사)"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
          <input
            type="text"
            value={attractionDistance}
            onChange={(e) => setAttractionDistance(e.target.value)}
            placeholder="거리 (예: 차로 15분)"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
          <button
            type="button"
            onClick={addAttraction}
            className="rounded-lg border border-[#00A1E0] px-3 py-2.5 text-sm font-semibold text-[#00A1E0] hover:bg-[#00A1E0] hover:text-white"
          >
            추가
          </button>
        </div>
        {value.nearbyAttractions.length > 0 && (
          <ul className="mt-2 space-y-1">
            {value.nearbyAttractions.map((a, idx) => (
              <li
                key={`${a.name}-${idx}`}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
              >
                <span>
                  {a.name} <span className="text-gray-500">({a.distance})</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeAttraction(idx)}
                  aria-label={`${a.name} 제거`}
                  className="text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">추천 계절</label>
          <select
            value={value.bestSeason}
            onChange={(e) => update("bestSeason", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          >
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {s || "선택"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">객실 수</label>
          <input
            type="number"
            min={1}
            max={99}
            value={value.numberOfRooms}
            onChange={(e) => update("numberOfRooms", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">고유 체험</label>
        <input
          type="text"
          value={value.uniqueExperience}
          onChange={(e) => update("uniqueExperience", e.target.value)}
          placeholder="예: 감귤 따기, 한복 입기"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">호스트 소개</label>
        <textarea
          value={value.hostIntro}
          onChange={(e) => update("hostIntro", e.target.value)}
          rows={3}
          placeholder="아산에서 3대째 한옥을 운영하고 있습니다..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="petsAllowed"
          type="checkbox"
          checked={value.petsAllowed}
          onChange={(e) => update("petsAllowed", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#00A1E0] focus:ring-[#00A1E0]"
        />
        <label htmlFor="petsAllowed" className="text-sm text-gray-700">
          반려동물 동반 가능
        </label>
      </div>
    </div>
  );
}

export const emptyGeoFields: GeoFieldsValue = {
  checkinTime: "",
  checkoutTime: "",
  highlights: [],
  nearbyAttractions: [],
  bestSeason: "",
  hostIntro: "",
  uniqueExperience: "",
  petsAllowed: false,
  numberOfRooms: "1",
};

export function geoFieldsToPayload(value: GeoFieldsValue) {
  const payload: Record<string, unknown> = {};
  if (value.checkinTime) payload.checkinTime = value.checkinTime;
  if (value.checkoutTime) payload.checkoutTime = value.checkoutTime;
  if (value.highlights.length > 0) payload.highlights = value.highlights;
  if (value.nearbyAttractions.length > 0) payload.nearbyAttractions = value.nearbyAttractions;
  if (value.bestSeason) payload.bestSeason = value.bestSeason;
  if (value.hostIntro) payload.hostIntro = value.hostIntro;
  if (value.uniqueExperience) payload.uniqueExperience = value.uniqueExperience;
  payload.petsAllowed = value.petsAllowed;
  if (value.numberOfRooms) payload.numberOfRooms = Number(value.numberOfRooms);
  return payload;
}
