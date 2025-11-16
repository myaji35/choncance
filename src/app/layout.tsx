import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header-simple";
import { Toaster } from "@/components/ui/toaster";
import { PWAInit } from "@/components/pwa-init";

// Pretendard 폰트 (한글 최적화)
const pretendard = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GeistVF.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/GeistVF.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/GeistVF.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VINTEE", // Updated title
  description: "도시 생활에 지친 MZ세대를 위한 진정성 있는 시골 여행 큐레이션 및 예약 플랫폼.", // Updated description
  manifest: "/manifest.json",
  themeColor: "#0EA5E9",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VINTEE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body
        className={`${pretendard.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        style={{ fontFamily: '"Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}
      >
        {/* PWA Initialization */}
        <PWAInit />

        {/* Site Header */}
        <SiteHeader />

        {/* Main content */}
        <main className="flex-grow">{children}</main>

        {/* Toaster for notifications */}
        <Toaster />

        {/* Footer */}
        <footer className="bg-gray-100 py-6 px-6 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} VINTEE. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/privacy" passHref>
              <Button variant="link" className="text-gray-600">개인정보처리방침</Button>
            </Link>
            <Link href="/terms" passHref>
              <Button variant="link" className="text-gray-600">이용약관</Button>
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}