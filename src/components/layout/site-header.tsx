"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { useRouter, usePathname } from "next/navigation";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide header on landing page (it has its own custom header)
  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            촌캉스
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

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </SignInButton>
              <Link href="/signup">
                <Button size="sm">회원가입</Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/bookings">
                <Button variant="ghost" size="sm">
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
        </div>
      </div>

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
