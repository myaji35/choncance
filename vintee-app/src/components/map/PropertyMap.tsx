"use client";

import { useEffect, useRef, useState } from "react";

interface NearbyAttraction {
  name: string;
  distance: string;
  latitude?: number;
  longitude?: number;
}

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  nearbyAttractions?: NearbyAttraction[];
}

interface KakaoLatLngBounds {
  extend: (latlng: unknown) => void;
}

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number }
        ) => {
          setBounds: (bounds: KakaoLatLngBounds) => void;
        };
        LatLng: new (lat: number, lng: number) => unknown;
        LatLngBounds: new () => KakaoLatLngBounds;
        Marker: new (options: {
          position: unknown;
          map?: unknown;
          image?: unknown;
          title?: string;
        }) => { setMap: (map: unknown) => void };
        MarkerImage: new (
          src: string,
          size: unknown,
          options?: { offset?: unknown }
        ) => unknown;
        Size: new (w: number, h: number) => unknown;
        Point: new (x: number, y: number) => unknown;
        InfoWindow: new (options: { content: string }) => {
          open: (map: unknown, marker: unknown) => void;
        };
        event: {
          addListener: (target: unknown, type: string, cb: () => void) => void;
        };
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
        const maps = window.kakao.maps;
        const center = new maps.LatLng(latitude, longitude);
        const map = new maps.Map(containerRef.current, { center, level: 6 });

        // 메인 마커 (숙소)
        const mainMarker = new maps.Marker({ position: center, map, title });
        new maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;font-weight:600;color:#16325C;">${title}</div>`,
        }).open(map, mainMarker);

        // 보조 마커 (주변 관광지) — 좌표 있는 것만
        const attractionsWithCoords = nearbyAttractions.filter(
          (a) => a.latitude !== undefined && a.longitude !== undefined
        );

        if (attractionsWithCoords.length > 0) {
          // 보조 마커 이미지 (주황색 작은 원)
          const iconSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#F59E0B" stroke="white" stroke-width="2"/></svg>'
          )}`;
          const markerImage = new maps.MarkerImage(
            iconSvg,
            new maps.Size(24, 24),
            { offset: new maps.Point(12, 12) }
          );

          const bounds = new maps.LatLngBounds();
          bounds.extend(center);

          attractionsWithCoords.forEach((a) => {
            const pos = new maps.LatLng(a.latitude!, a.longitude!);
            const marker = new maps.Marker({
              position: pos,
              map,
              image: markerImage,
              title: a.name,
            });
            const infoWindow = new maps.InfoWindow({
              content: `<div style="padding:6px 10px;font-size:12px;color:#16325C;"><strong>${a.name}</strong><br/><span style="color:#6B7280">${a.distance}</span></div>`,
            });
            maps.event.addListener(marker, "click", () => {
              infoWindow.open(map, marker);
            });
            bounds.extend(pos);
          });

          map.setBounds(bounds);
        }
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, title, nearbyAttractions]);

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
