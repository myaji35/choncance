"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = session?.user as { name?: string; role?: string } | undefined;

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#16325C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-lg font-bold text-[#16325C]">VINTEE</span>
        </Link>

        {/* 데스크탑 메뉴 */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/properties" className="text-sm text-gray-600 hover:text-[#16325C]">
            숙소 찾기
          </Link>
          {session ? (
            <>
              {user?.role === "HOST" && (
                <Link href="/host" className="text-sm text-gray-600 hover:text-[#16325C]">
                  호스트 관리
                </Link>
              )}
              <Link href="/bookings" className="text-sm text-gray-600 hover:text-[#16325C]">
                내 예약
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {user?.name}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-[#16325C]">
                로그인
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#00A1E0] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0090C7]"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* 모바일 햄버거 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden"
          aria-label="메뉴"
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#16325C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
