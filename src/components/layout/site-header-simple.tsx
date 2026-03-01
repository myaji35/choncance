"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  // Hide header on landing page
  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        {/* Desktop Header */}
        <div className="hidden lg:flex h-20 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/vintee-logo.png"
              alt="VINTEE"
              width={40}
              height={40}
              className="h-10 w-10 drop-shadow-sm"
              priority
            />
            <span className="text-2xl font-bold text-primary whitespace-nowrap">VINTEE</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6 shrink-0">
            <Link
              href="/explore"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              둘러보기
            </Link>
            <Link
              href="/recommendations"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              추천
            </Link>
            <Link
              href="/how-to-use"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              이용방법
            </Link>
            <Link
              href="/become-a-host"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              호스트 되기
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link
                  href="/host/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  호스트 대시보드
                </Link>
                <Link
                  href="/bookings"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  내 예약
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  로그인
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex lg:hidden h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/vintee-logo.png"
              alt="VINTEE"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="text-xl font-bold text-primary">VINTEE</span>
          </Link>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 hover:text-primary">
                  로그인
                </button>
              </SignInButton>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link
                href="/explore"
                className="text-sm font-medium text-gray-600 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                둘러보기
              </Link>
              <Link
                href="/recommendations"
                className="text-sm font-medium text-gray-600 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                추천
              </Link>
              <Link
                href="/how-to-use"
                className="text-sm font-medium text-gray-600 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                이용방법
              </Link>
              <Link
                href="/become-a-host"
                className="text-sm font-medium text-gray-600 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                호스트 되기
              </Link>
              {isSignedIn && (
                <>
                  <Link
                    href="/host/dashboard"
                    className="text-sm font-medium text-gray-600 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    호스트 대시보드
                  </Link>
                  <Link
                    href="/bookings"
                    className="text-sm font-medium text-gray-600 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    내 예약
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
