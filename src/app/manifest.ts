import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VINTEE - 빈티지한 시골 여행",
    short_name: "VINTEE",
    description: "MZ세대를 위한 진정한 시골 여행 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0EA5E9",
    orientation: "portrait",
    lang: "ko",
    scope: "/",
    categories: ["travel", "lifestyle"],
    icons: [
      { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
    shortcuts: [
      {
        name: "탐색",
        short_name: "탐색",
        description: "숙소 둘러보기",
        url: "/explore",
      },
      {
        name: "예약",
        short_name: "예약",
        description: "내 예약 확인",
        url: "/bookings",
      },
    ],
  };
}
