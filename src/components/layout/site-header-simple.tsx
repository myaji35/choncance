"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">
                회원가입
              </Button>
            </Link>
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

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    로그인
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    회원가입
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}