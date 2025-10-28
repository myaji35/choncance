"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchBar } from "@/components/search-bar";
import { HeroCarousel } from "@/components/hero-carousel";
import { AdvancedSearchBar } from "@/components/advanced-search-bar";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowDown } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsHeaderVisible(true);
      } else {
        setIsHeaderVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHeaderVisible ? "bg-white/95 backdrop-blur-md shadow-md dark:bg-gray-900/95" : "bg-black/30 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/choncance-logo.png"
                alt="촌캉스"
                width={120}
                height={40}
                className={`h-10 w-auto transition-all duration-300 ${
                  isHeaderVisible ? '' : 'brightness-0 invert'
                }`}
                priority
              />
            </Link>

            {/* Search Bar - visible when header is visible */}
            <div className={`hidden md:block flex-1 max-w-md mx-8 transition-all duration-300 ${
              isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}>
              <SearchBar
                placeholder="어떤 쉼을 찾고 있나요?"
                onSearch={(query) => {
                  console.log('Search:', query);
                  // TODO: Implement search functionality
                }}
              />
            </div>

            <nav className="hidden items-center space-x-6 lg:flex">
              <Link
                href="#how-it-works"
                className={`transition-colors ${
                  isHeaderVisible
                    ? "text-gray-600 hover:text-primary dark:text-gray-300"
                    : "text-white hover:text-white/80"
                }`}
              >
                이용방법
              </Link>
              <Link
                href="#featured-experiences"
                className={`transition-colors ${
                  isHeaderVisible
                    ? "text-gray-600 hover:text-primary dark:text-gray-300"
                    : "text-white hover:text-white/80"
                }`}
              >
                추천 촌캉스
              </Link>
              <Link
                href="#stories"
                className={`transition-colors ${
                  isHeaderVisible
                    ? "text-gray-600 hover:text-primary dark:text-gray-300"
                    : "text-white hover:text-white/80"
                }`}
              >
                스토리
              </Link>
            </nav>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant={isHeaderVisible ? "ghost" : "outline"}
                    className={isHeaderVisible ? "" : "text-white border-white hover:bg-white hover:text-gray-900"}
                  >
                    로그인
                  </Button>
                </SignInButton>
                <Link href="/signup">
                  <Button
                    className={isHeaderVisible ? "" : "bg-white text-gray-900 hover:bg-white/90 shadow-md"}
                  >
                    회원가입
                  </Button>
                </Link>
              </SignedOut>

              <SignedIn>
                <Link href="/bookings">
                  <Button
                    variant={isHeaderVisible ? "ghost" : "outline"}
                    className={isHeaderVisible ? "" : "text-white border-white hover:bg-white hover:text-gray-900"}
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        <HeroCarousel
          images={[
            "/hero-1.svg",
            "/hero-2.svg",
            "/hero-3.svg",
          ]}
          interval={5000}
        />
        <div className="relative z-10 text-white p-6 max-w-5xl w-full flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-extralight mb-6 leading-tight tracking-wide animate-fade-in-up">
            도시의 소음은 잠시 끄고, <br />
            당신의 진짜 쉼을 켜세요
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-light tracking-wide animate-fade-in-up animation-delay-300">
            촌캉스가 제안하는 진정한 쉼의 순간으로 당신을 초대합니다.
          </p>
          <div className="w-full max-w-4xl animate-fade-in-up animation-delay-600">
            <AdvancedSearchBar
              onSearch={(params) => {
                const searchParams = new URLSearchParams();
                if (params.location) searchParams.set("location", params.location);
                if (params.checkIn) searchParams.set("checkIn", params.checkIn);
                if (params.checkOut) searchParams.set("checkOut", params.checkOut);
                if (params.guests) searchParams.set("guests", params.guests.toString());
                router.push(`/explore?${searchParams.toString()}`);
              }}
            />
          </div>
          <div className="absolute bottom-10 animate-bounce">
            <ArrowDown className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 lg:px-20">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-6 text-gray-800 dark:text-gray-100">촌캉스 이용방법</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-20 text-xl">세상 가장 쉬운 쉼을 찾는 여정</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-28 h-28 mb-8 bg-primary/10 rounded-full transform hover:scale-110 transition-transform">
                <span className="text-5xl">🎨</span>
              </div>
              <h3 className="text-3xl font-light mb-4">테마 발견</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">#논뷰맛집 #불멍과별멍 #찐할머니손맛<br/>당신을 위한 테마를 찾아보세요.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-28 h-28 mb-8 bg-primary/10 rounded-full transform hover:scale-110 transition-transform">
                <span className="text-5xl">📖</span>
              </div>
              <h3 className="text-3xl font-light mb-4">스토리 탐색</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">호스트의 진솔한 이야기를 통해<br/>공간에 대한 깊은 이해를 더하세요.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-28 h-28 mb-8 bg-primary/10 rounded-full transform hover:scale-110 transition-transform">
                <span className="text-5xl">🏡</span>
              </div>
              <h3 className="text-3xl font-light mb-4">경험 예약</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">단 몇 번의 클릭으로<br/>당신만의 촌캉스를 예약하세요.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-experiences" className="py-24 px-6 md:px-12 lg:px-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-6 text-gray-800 dark:text-gray-100">추천 촌캉스</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-20 text-xl">지금 가장 인기있는 촌캉스를 만나보세요</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl">
              <CardContent className="p-0">
                <div className="relative h-72">
                  <Image src="/placeholder-property-1.jpg" alt="논뷰 맛집" fill className="object-cover" />
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/80 rounded-full hover:bg-white">
                    <span className="text-2xl">❤️</span>
                  </Button>
                </div>
                <div className="p-6">
                  <CardTitle className="text-2xl mb-3 font-light">#논뷰맛집</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400">멍때리기 좋은 황금빛 논밭 풍경</CardDescription>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl">
              <CardContent className="p-0">
                <div className="relative h-72">
                  <Image src="/placeholder-property-2.jpg" alt="불멍과 별멍" fill className="object-cover" />
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/80 rounded-full hover:bg-white">
                    <span className="text-2xl">❤️</span>
                  </Button>
                </div>
                <div className="p-6">
                  <CardTitle className="text-2xl mb-3 font-light">#불멍과별멍</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400">모닥불 앞에서 누리는 완벽한 단절</CardDescription>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl">
              <CardContent className="p-0">
                <div className="relative h-72">
                  <Image src="/placeholder-property-3.jpg" alt="할매니얼" fill className="object-cover" />
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/80 rounded-full hover:bg-white">
                    <span className="text-2xl">❤️</span>
                  </Button>
                </div>
                <div className="p-6">
                  <CardTitle className="text-2xl mb-3 font-light">#찐할머니손맛</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400">할머니의 손맛이 담긴 시골 밥상</CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section id="stories" className="py-24 px-6 md:px-12 lg:px-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image src="/placeholder-host.jpg" alt="강원도 어느 한옥 스테이 호스트" fill className="object-cover" />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-800 dark:text-gray-100">진정성 있는 이야기</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-10 text-xl">호스트의 삶과 공간이 만나는 곳</p>
              <blockquote className="text-2xl md:text-3xl font-light text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                &ldquo;와이파이가 잘 안 터지고, 가끔 벌레도 나와요. <br />
                하지만 그게 바로 이곳의 매력이에요. <br />
                완벽한 단절, 진짜 쉼이 여기 있습니다.&rdquo;
              </blockquote>
              <p className="text-gray-500 dark:text-gray-400 text-lg">- 강원도 어느 한옥 스테이 호스트</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-6">당신만의 촌캉스를 시작하세요</h2>
          <p className="text-xl md:text-2xl mb-10 font-light">SNS에 공유하고 싶은 순간들이 기다리고 있습니다</p>
          <Button size="lg" variant="secondary" className="px-12 py-8 text-xl rounded-full" asChild>
            <Link href="/explore">지금 탐색하기</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-12 lg:px-20 bg-gray-900 text-gray-400">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">촌캉스</h3>
            <p className="text-sm">진짜 촌캉스를 찾아서</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">탐색</h4>
            <ul>
              <li className="mb-2"><Link href="#" className="hover:text-white">테마별</Link></li>
              <li className="mb-2"><Link href="#" className="hover:text-white">지역별</Link></li>
              <li className="mb-2"><Link href="#" className="hover:text-white">인기 촌캉스</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">소개</h4>
            <ul>
              <li className="mb-2"><Link href="#" className="hover:text-white">촌캉스 스토리</Link></li>
              <li className="mb-2"><Link href="#" className="hover:text-white">호스트 되기</Link></li>
              <li className="mb-2"><Link href="#" className="hover:text-white">채용</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">지원</h4>
            <ul>
              <li className="mb-2"><Link href="#" className="hover:text-white">도움말 센터</Link></li>
              <li className="mb-2"><Link href="#" className="hover:text-white">이용약관</Link></li>
              <li className="mb-2"><Link href="#" className="hover:text-white">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto text-center mt-12 border-t border-gray-800 pt-8">
          <p className="text-sm">&copy; 2025 ChonCance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
