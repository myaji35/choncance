"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/components/search-bar";
import { HeroCarousel } from "@/components/hero-carousel";
import { AdvancedSearchBar } from "@/components/advanced-search-bar";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowDown } from 'lucide-react';
// Clerk removed - using Supabase auth
import { useRouter } from "next/navigation";

interface Property {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  thumbnailUrl: string | null;
  images: string[];
  province: string;
  city: string;
  tags: Array<{
    name: string;
    category: string;
  }>;
  host: {
    user: {
      name: string | null;
      image: string | null;
    };
  };
}

export function LandingPageClient() {
  const router = useRouter();
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

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

  // Fetch featured properties
  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        const response = await fetch('/api/properties?status=APPROVED');
        const data = await response.json();
        // 최대 6개만 표시
        setFeaturedProperties(data.properties.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch featured properties:', error);
      } finally {
        setLoadingProperties(false);
      }
    }

    fetchFeaturedProperties();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHeaderVisible ? "bg-white/95 backdrop-blur-md shadow-md dark:bg-gray-900/95" : "bg-black/30 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 relative">
              <Image
                src="/vintee-logo.png"
                alt="VINTEE"
                width={32}
                height={32}
                className={`h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300 ${
                  isHeaderVisible
                    ? 'drop-shadow-sm'
                    : 'drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]'
                }`}
                style={!isHeaderVisible ? {
                  filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(255,255,255,0.8))'
                } : {
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}
                priority
              />
              <span className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                isHeaderVisible ? 'text-primary' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
              }`}>
                VINTEE
              </span>
            </Link>

            {/* Search Bar - visible when header is visible */}
            <div className={`hidden md:block flex-1 max-w-md mx-4 lg:mx-8 transition-all duration-300 ${
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

            <nav className="hidden items-center gap-4 lg:gap-8 lg:flex">
              <Link
                href="#how-it-works"
                className={`transition-colors whitespace-nowrap text-sm lg:text-base ${
                  isHeaderVisible
                    ? "text-gray-600 hover:text-primary dark:text-gray-300"
                    : "text-white hover:text-white/80"
                }`}
              >
                이용방법
              </Link>
              <Link
                href="#featured-experiences"
                className={`transition-colors whitespace-nowrap text-sm lg:text-base ${
                  isHeaderVisible
                    ? "text-gray-600 hover:text-primary dark:text-gray-300"
                    : "text-white hover:text-white/80"
                }`}
              >
                추천 숙소
              </Link>
              <Link
                href="#stories"
                className={`transition-colors whitespace-nowrap text-sm lg:text-base ${
                  isHeaderVisible
                    ? "text-gray-600 hover:text-primary dark:text-gray-300"
                    : "text-white hover:text-white/80"
                }`}
              >
                스토리
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
                
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/95 text-gray-900 border-gray-300 hover:bg-white shadow-sm backdrop-blur-sm text-xs sm:text-sm px-3 sm:px-4"
                  >
                    로그인
                  </Button>
                
                <Link href="/signup" className="hidden sm:inline-block">
                  <Button
                    size="sm"
                    className="bg-primary text-white hover:bg-primary/90 shadow-md text-xs sm:text-sm px-3 sm:px-4"
                  >
                    회원가입
                  </Button>
                </Link>
              

              
                <Link href="/bookings" className="hidden sm:inline-block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/95 text-gray-900 border-gray-300 hover:bg-white shadow-sm backdrop-blur-sm text-xs sm:text-sm"
                  >
                    내 예약
                  </Button>
                </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        <HeroCarousel
          images={[
            "/images/hero/hero-1.jpg",
            "/images/hero/hero-2.jpg",
            "/images/hero/hero-3.jpg",
          ]}
          interval={5000}
        />
        <div className="relative z-10 text-white px-4 sm:px-6 py-8 max-w-5xl w-full flex flex-col items-center">
          <h1 className="text-display-md md:text-display-lg font-extralight mb-4 sm:mb-6 leading-tight tracking-tight animate-slide-up text-balance">
            도시의 소음은 잠시 끄고, <br className="hidden sm:block" />
            당신의 진짜 쉼을 켜세요
          </h1>
          <p className="text-body-lg md:text-heading-sm mb-8 sm:mb-12 font-light tracking-wide animate-fade-in px-4 text-balance" style={{ animationDelay: '0.2s' }}>
            VINTEE가 제안하는 빈티지한 시골의 진정한 쉼으로 당신을 초대합니다.
          </p>
          <div className="w-full max-w-4xl px-2 sm:px-0 animate-fade-in-up animation-delay-600">
            <AdvancedSearchBar
              onSearch={(params) => {
                const searchParams = new URLSearchParams();
                if (params.location) searchParams.set("location", params.location);
                if (params.checkIn) searchParams.set("checkIn", params.checkIn);
                if (params.checkOut) searchParams.set("checkOut", params.checkOut);
                if (params.guests) {
                  searchParams.set("adults", params.guests.adults.toString());
                  if (params.guests.children > 0) searchParams.set("children", params.guests.children.toString());
                  if (params.guests.infants > 0) searchParams.set("infants", params.guests.infants.toString());
                  if (params.guests.pets > 0) searchParams.set("pets", params.guests.pets.toString());
                }
                router.push(`/explore?${searchParams.toString()}`);
              }}
            />
          </div>
          <div className="absolute bottom-6 sm:bottom-10 animate-bounce">
            <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-heading-xl md:text-display-sm font-light text-center mb-3 sm:mb-4 md:mb-6 text-gray-800 dark:text-gray-100">VINTEE 이용방법</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 sm:mb-12 md:mb-20 text-body-lg md:text-heading-sm">빈티지한 시골의 쉼을 찾는 가장 쉬운 여정</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 max-w-6xl mx-auto text-center">
            <div className="stagger-item flex flex-col items-center px-4">
              <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-4 sm:mb-6 md:mb-8 bg-primary/10 rounded-full transform hover:scale-110 transition-all duration-300 shadow-soft hover:shadow-medium">
                <span className="text-4xl sm:text-4xl md:text-5xl">🎨</span>
              </div>
              <h3 className="text-heading-md md:text-heading-lg font-medium mb-2 sm:mb-3 md:mb-4">테마 발견</h3>
              <p className="text-gray-600 dark:text-gray-400 text-body-sm md:text-body">#논뷰맛집 #불멍과별멍 #찐할머니손맛<br/>당신을 위한 테마를 찾아보세요.</p>
            </div>
            <div className="stagger-item flex flex-col items-center px-4">
              <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-4 sm:mb-6 md:mb-8 bg-primary/10 rounded-full transform hover:scale-110 transition-all duration-300 shadow-soft hover:shadow-medium">
                <span className="text-4xl sm:text-4xl md:text-5xl">📖</span>
              </div>
              <h3 className="text-heading-md md:text-heading-lg font-medium mb-2 sm:mb-3 md:mb-4">스토리 탐색</h3>
              <p className="text-gray-600 dark:text-gray-400 text-body-sm md:text-body">호스트의 진솔한 이야기를 통해<br/>공간에 대한 깊은 이해를 더하세요.</p>
            </div>
            <div className="stagger-item flex flex-col items-center px-4">
              <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-4 sm:mb-6 md:mb-8 bg-primary/10 rounded-full transform hover:scale-110 transition-all duration-300 shadow-soft hover:shadow-medium">
                <span className="text-4xl sm:text-4xl md:text-5xl">🏡</span>
              </div>
              <h3 className="text-heading-md md:text-heading-lg font-medium mb-2 sm:mb-3 md:mb-4">경험 예약</h3>
              <p className="text-gray-600 dark:text-gray-400 text-body-sm md:text-body">단 몇 번의 클릭으로<br/>당신만의 빈티지 휴식을 예약하세요.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-experiences" className="py-24 px-6 md:px-12 lg:px-20 bg-secondary/20 dark:bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-display-sm md:text-display-md font-light text-center mb-6 text-gray-800 dark:text-gray-100">추천 VINTEE 숙소</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-20 text-body-lg md:text-heading-sm">엄선된 빈티지 감성의 시골 숙소를 만나보세요</p>

          {loadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-lg rounded-xl">
                  <CardContent className="p-0">
                    <div className="relative h-72 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProperties.map((property, index) => (
                <Link key={property.id} href={`/property/${property.id}`} className="stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card className="overflow-hidden border-0 card-elevated rounded-xl cursor-pointer h-full hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative h-72">
                        <Image
                          src={property.thumbnailUrl || property.images[0] || '/placeholder-property.svg'}
                          alt={property.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* Tags overlay */}
                        {property.tags.length > 0 && (
                          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            {property.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.name}
                                className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full text-gray-800"
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <CardTitle className="text-2xl mb-2 font-light line-clamp-1">
                          {property.name}
                        </CardTitle>
                        <CardDescription className="text-base text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {property.description}
                        </CardDescription>

                        {/* Host info */}
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                          <span>호스트: {property.host.user.name || '익명'}</span>
                        </div>

                        {/* Location and Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {property.province} {property.city}
                          </span>
                          <span className="text-lg font-semibold text-primary">
                            ₩{property.pricePerNight.toLocaleString()}<span className="text-sm font-normal text-gray-500">/박</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                아직 승인된 숙소가 없습니다.
              </p>
            </div>
          )}

          {/* View All Button */}
          {!loadingProperties && featuredProperties.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/explore">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full">
                  모든 숙소 둘러보기
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="stories" className="py-24 px-6 md:px-12 lg:px-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image src="/hanok-host.svg" alt="강원도 어느 한옥 스테이 호스트" fill className="object-cover" />
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
          <h2 className="text-4xl md:text-5xl font-light mb-6">당신만의 VINTEE를 시작하세요</h2>
          <p className="text-xl md:text-2xl mb-10 font-light">빈티지한 감성과 함께하는 특별한 시골 여행이 기다립니다</p>
          <Button size="lg" variant="secondary" className="px-12 py-8 text-xl rounded-full" asChild>
            <Link href="/explore">지금 탐색하기</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-12 lg:px-20 bg-gray-900 text-gray-400">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">VINTEE</h3>
            <p className="text-sm">빈티지한 감성의 시골 여행</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">탐색</h4>
            <ul>
              <li className="mb-2"><Link href="#" className="hover:text-white">테마별</Link></li>
              <li className="mb-2"><Link href="#" className="hover:text-white">지역별</Link></li>
              <li className="mb-2"><Link href="#" className="hover:text-white">인기 숙소</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">소개</h4>
            <ul>
              <li className="mb-2"><Link href="#" className="hover:text-white">VINTEE 스토리</Link></li>
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
          <p className="text-sm">&copy; 2025 VINTEE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
