"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { NotificationButton } from "@/components/notifications/notification-button";
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
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 relative">
            <Image
              src="/choncance-logo.png"
              alt="촌캉스"
              width={32}
              height={32}
              className="h-8 w-8 md:h-10 md:w-10 drop-shadow-sm"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
              priority
            />
            <span className="text-xl md:text-2xl font-bold text-primary">촌캉스</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar
              placeholder="어떤 쉼을 찾고 있나요?"
              onSearch={(query) => {
                router.push(`/explore?search=${encodeURIComponent(query)}`);
              }}
            />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/explore"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              숙소 둘러보기
            </Link>
            <Link
              href="/become-a-host"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              호스트 되기
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2 ml-4">
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
                  className="border-2 border-gray-400 bg-white text-gray-900 font-medium hover:bg-primary hover:text-white hover:border-primary transition-all"
                >
                  내 예약
                </Button>
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                      },
                    }}
                  />
                  <span className="text-sm text-gray-600">내 계정</span>
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
