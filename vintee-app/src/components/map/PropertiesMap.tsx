"use client";

import { useEffect, useRef, useState } from "react";

export interface MapProperty {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  pricePerNight: number | null;
  location: string;
  avgRating?: number;
}

interface PropertiesMapProps {
  properties: MapProperty[];
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

export default function PropertiesMap({ properties }: PropertiesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const withCoords = properties.filter(
    (p) => p.latitude !== null && p.longitude !== null
  );

  useEffect(() => {
    let cancelled = false;
    loadKakao()
      .then(() => {
        if (cancelled || !containerRef.current || !window.kakao) return;
        if (withCoords.length === 0) return;
        const maps = window.kakao.maps;

        const firstLat = withCoords[0].latitude!;
        const firstLng = withCoords[0].longitude!;
        const center = new maps.LatLng(firstLat, firstLng);
        const map = new maps.Map(containerRef.current, { center, level: 13 });

        const bounds = new maps.LatLngBounds();

        withCoords.forEach((p) => {
          const pos = new maps.LatLng(p.latitude!, p.longitude!);
          const marker = new maps.Marker({ position: pos, map, title: p.title });
          bounds.extend(pos);

          const priceStr = p.pricePerNight
            ? `${p.pricePerNight.toLocaleString()}원/박`
            : "가격 문의";
          const ratingStr = p.avgRating ? `★ ${p.avgRating.toFixed(1)}` : "";

          const infoWindow = new maps.InfoWindow({
            content: `
              <a href="/property/${p.id}" style="display:block;padding:10px 12px;min-width:180px;text-decoration:none;color:#16325C;">
                <div style="font-size:13px;font-weight:700;margin-bottom:2px;">${p.title}</div>
                <div style="font-size:11px;color:#6B7280;">${p.location}</div>
                <div style="font-size:12px;font-weight:600;margin-top:4px;">${priceStr}</div>
                ${ratingStr ? `<div style="font-size:11px;color:#F59E0B;margin-top:2px;">${ratingStr}</div>` : ""}
              </a>
            `,
          });

          maps.event.addListener(marker, "click", () => {
            infoWindow.open(map, marker);
          });
        });

        if (withCoords.length > 1) {
          map.setBounds(bounds);
        }
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  if (error) {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
        <p>지도를 표시할 수 없습니다</p>
        <p className="mt-1 text-xs">({error})</p>
        <p className="mt-2 text-xs text-gray-400">
          표시 가능한 숙소 {withCoords.length}개
        </p>
      </div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
        지도에 표시할 숙소가 없습니다 (좌표 정보 없음)
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[500px] w-full rounded-lg border border-gray-200 bg-gray-100"
    />
  );
}
