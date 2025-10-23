import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link"; // Import Link for navigation
import { Button } from "@/components/ui/button"; // Assuming Button is available

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ChonCance", // Updated title
  description: "도시 생활에 지친 MZ세대를 위한 진정성 있는 촌캉스 경험 큐레이션 및 예약 플랫폼.", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko"> {/* Changed lang to ko */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-700">
            ChonCance
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/explore" passHref>
              <Button variant="ghost">탐색</Button>
            </Link>
            <Link href="/projects" passHref>
              <Button variant="ghost">프로젝트</Button>
            </Link>
            <Link href="/login" passHref>
              <Button>로그인</Button>
            </Link>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-100 py-6 px-6 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} ChonCance. All rights reserved.</p>
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