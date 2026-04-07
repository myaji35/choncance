"use client";

import { useEffect, useRef, useState } from "react";

interface NearbyAttraction {
  name: string;
  distance: string;
}

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  nearbyAttractions?: NearbyAttraction[];
}

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void;
        Map: new (container: HTMLElement, options: { center: unknown; level: number }) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: { position: unknown; map?: unknown }) => unknown;
      };
    };
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const SCRIPT_ID = "kakao-map-sdk";

function loadKakao(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.kakao?.maps) return Promise.resolve();
  if (!KAKAO_KEY) return Promise.reject(new Error("KAKAO_MAP_KEY 미설정"));

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => window.kakao!.maps.load(() => resolve()));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao!.maps.load(() => resolve());
    script.onerror = () => reject(new Error("Kakao Map SDK 로드 실패"));
    document.head.appendChild(script);
  });
}

export default function PropertyMap({
  latitude,
  longitude,
  title,
  nearbyAttractions = [],
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadKakao()
      .then(() => {
        if (cancelled || !containerRef.current || !window.kakao) return;
        const { Map, LatLng, Marker } = window.kakao.maps;
        const center = new LatLng(latitude, longitude);
        const map = new Map(containerRef.current, { center, level: 5 });
        new Marker({ position: center, map });
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  const directionUrl = `https://map.kakao.com/link/to/${encodeURIComponent(title)},${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      {error ? (
        <div className="flex h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
          <p>지도를 표시할 수 없습니다</p>
          <p className="mt-1 text-xs">({error})</p>
          <p className="mt-2 text-xs text-gray-400">
            위치: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-[280px] w-full rounded-lg border border-gray-200 bg-gray-100"
        />
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          좌표: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </span>
        <a
          href={directionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-[#00A1E0] px-3 py-1.5 text-xs font-semibold text-[#00A1E0] hover:bg-[#00A1E0] hover:text-white"
        >
          길찾기 →
        </a>
      </div>

      {nearbyAttractions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h3 className="text-xs font-semibold text-gray-600">주변 관광지</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {nearbyAttractions.map((a) => (
              <li key={a.name}>
                · {a.name} <span className="text-gray-500">({a.distance})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
