"use client";

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { NotificationButton } from "@/components/notifications/notification-button";
import { UserRoleButton } from "@/components/layout/user-role-button";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide header on landing page (it has its own custom header)
  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/vintee-logo.png"
              alt="VINTEE"
              width={40}
              height={40}
              className="h-10 w-10 drop-shadow-sm"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
              priority
            />
            <span className="text-2xl font-bold text-primary whitespace-nowrap">VINTEE</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6 shrink-0">
            <Link
              href="/explore"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
            >
              숙소 둘러보기
            </Link>
            <Link
              href="/recommendations"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
            >
              추천
            </Link>
            <Link
              href="/how-to-use"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
            >
              이용방법
            </Link>
            <Link
              href="/become-a-host"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
            >
              호스트 되기
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-sm">
            <SearchBar
              placeholder="어떤 쉼을 찾고 있나요?"
              onSearch={(query) => {
                router.push(`/explore?search=${encodeURIComponent(query)}`);
              }}
            />
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="border-gray-300">
                  로그인
                </Button>
              </SignInButton>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                  회원가입
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <NotificationButton />
              <Link href="/bookings">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-gray-400 bg-white text-gray-900 font-medium hover:bg-primary hover:text-white hover:border-primary transition-all whitespace-nowrap"
                >
                  내 예약
                </Button>
              </Link>
              <UserRoleButton />
            </SignedIn>
          </div>
        </div>

        {/* Tablet/Mobile Header */}
        <div className="flex lg:hidden h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/vintee-logo.png"
              alt="VINTEE"
              width={32}
              height={32}
              className="h-8 w-8 drop-shadow-sm"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
              priority
            />
            <span className="text-xl font-bold text-primary whitespace-nowrap">VINTEE</span>
          </Link>

          {/* Auth and Menu */}
          <div className="flex items-center gap-2">
            <SignedIn>
              <NotificationButton />
            </SignedIn>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              aria-label="메뉴"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/explore"
              className="block py-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              숙소 둘러보기
            </Link>
            <Link
              href="/recommendations"
              className="block py-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              추천
            </Link>
            <Link
              href="/how-to-use"
              className="block py-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              이용방법
            </Link>
            <Link
              href="/become-a-host"
              className="block py-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              호스트 되기
            </Link>

            <SignedOut>
              <div className="pt-3 border-t space-y-2">
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full border-gray-300">
                    로그인
                  </Button>
                </SignInButton>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">
                    회원가입
                  </Button>
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="pt-3 border-t space-y-2">
                <Link href="/bookings" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    내 예약
                  </Button>
                </Link>
                <div className="flex items-center gap-3 pt-2">
                  <NotificationButton />
                  <UserRoleButton />
                </div>
              </div>
            </SignedIn>
          </nav>
        </div>
      )}

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar
          placeholder="어떤 쉼을 찾고 있나요?"
          onSearch={(query) => {
            router.push(`/explore?search=${encodeURIComponent(query)}`);
          }}
        />
      </div>
    </header>
  );
}
