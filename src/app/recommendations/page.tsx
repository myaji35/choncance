import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, MapPin, Calendar, Star } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// 추천 카테고리별 데이터 가져오기
async function getRecommendations() {
  const [popularProperties, viewTags, activityTags, facilityTags, vibeTags] = await Promise.all([
    // 인기 숙소 (예약 많은 순)
    prisma.property.findMany({
      where: { status: "APPROVED" },
      include: {
        host: { select: { user: { select: { name: true } } } },
        tags: true,
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { bookings: { _count: "desc" } },
      take: 8,
    }),
    // 카테고리별 태그
    prisma.tag.findMany({ where: { category: "VIEW" } }),
    prisma.tag.findMany({ where: { category: "ACTIVITY" } }),
    prisma.tag.findMany({ where: { category: "FACILITY" } }),
    prisma.tag.findMany({ where: { category: "VIBE" } }),
  ]);

  return {
    popularProperties,
    tagsByCategory: {
      VIEW: viewTags,
      ACTIVITY: activityTags,
      FACILITY: facilityTags,
      VIBE: vibeTags,
    },
  };
}

// 테마별 큐레이션 데이터
const themeCurations = [
  {
    id: "winter-healing",
    title: "겨울 힐링 여행",
    description: "추운 겨울, 따뜻한 감성과 함께하는 촌캉스",
    image: "/placeholder-property.svg",
    tags: ["#불멍과별멍", "#아궁이체험", "#온돌방"],
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "pet-friendly",
    title: "반려동물과 함께",
    description: "우리 강아지와 행복한 추억 만들기",
    image: "/placeholder-property.svg",
    tags: ["#반려동물동반", "#넓은마당", "#산책로"],
    color: "bg-green-50 border-green-200",
  },
  {
    id: "nature-view",
    title: "자연 뷰 맛집",
    description: "창문만 열면 펼쳐지는 힐링 풍경",
    image: "/placeholder-property.svg",
    tags: ["#논뷰맛집", "#산뷰맛집", "#강뷰맛집"],
    color: "bg-emerald-50 border-emerald-200",
  },
  {
    id: "experience",
    title: "농촌 체험 가득",
    description: "도시에서는 할 수 없는 특별한 경험",
    image: "/placeholder-property.svg",
    tags: ["#농사체험", "#장작패기", "#텃밭가꾸기"],
    color: "bg-amber-50 border-amber-200",
  },
];

// 지역별 추천
const regionalRecommendations = [
  { region: "강원", description: "산과 바다가 어우러진 힐링 여행", count: 12 },
  { region: "전라", description: "맛과 멋이 가득한 농촌 체험", count: 15 },
  { region: "경상", description: "전통과 자연이 살아있는 촌캉스", count: 10 },
  { region: "충청", description: "수도권에서 가까운 힐링 스팟", count: 8 },
  { region: "제주", description: "섬의 여유로움이 있는 특별한 휴식", count: 5 },
];

export default async function RecommendationsPage() {
  const { popularProperties, tagsByCategory } = await getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">VINTEE 추천</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              당신을 위한 특별한 촌캉스
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              테마별 큐레이션으로 찾는 완벽한 농촌 휴가 경험
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 테마별 큐레이션 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">테마별 큐레이션</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {themeCurations.map((theme) => (
              <Link key={theme.id} href={`/explore?theme=${theme.id}`}>
                <Card className={`border-2 hover:shadow-lg transition-all cursor-pointer h-full ${theme.color}`}>
                  <CardHeader className="pb-3">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={theme.image}
                        alt={theme.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardTitle className="text-xl">{theme.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {theme.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 인기 숙소 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">인기 숙소</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProperties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="relative w-full h-48">
                    <Image
                      src={property.thumbnailUrl || property.images[0] || "/placeholder-property.svg"}
                      alt={property.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    {property._count.bookings > 5 && (
                      <Badge className="absolute top-3 left-3 bg-primary">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        인기
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{property.name}</CardTitle>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {property.city}, {property.province}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {property.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {Number(property.pricePerNight).toLocaleString()}원
                        </span>
                        <span className="text-sm text-gray-500"> / 박</span>
                      </div>
                      {property._count.reviews > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">4.5</span>
                          <span className="text-gray-400">({property._count.reviews})</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/explore">
              <Button variant="outline" size="lg">
                더 많은 숙소 보기
              </Button>
            </Link>
          </div>
        </section>

        {/* 카테고리별 태그 탐색 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">원하는 테마를 선택하세요</h2>
          <Tabs defaultValue="VIEW" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="VIEW">뷰</TabsTrigger>
              <TabsTrigger value="ACTIVITY">액티비티</TabsTrigger>
              <TabsTrigger value="FACILITY">시설</TabsTrigger>
              <TabsTrigger value="VIBE">분위기</TabsTrigger>
            </TabsList>

            {Object.entries(tagsByCategory).map(([category, tags]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tags.map((tag) => (
                    <Link key={tag.id} href={`/explore?tag=${encodeURIComponent(tag.name)}`}>
                      <Card className="hover:shadow-md hover:border-primary transition-all cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <div className="text-2xl mb-2">{tag.icon || "🏡"}</div>
                          <h3 className="font-semibold text-gray-900 mb-1">{tag.name}</h3>
                          <p className="text-xs text-gray-500">{tag.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* 지역별 추천 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <MapPin className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">지역별 추천</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {regionalRecommendations.map((region) => (
              <Link key={region.region} href={`/explore?province=${region.region}`}>
                <Card className="hover:shadow-md hover:border-primary transition-all cursor-pointer h-full">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-primary mb-2">{region.region}</h3>
                    <p className="text-sm text-gray-600 mb-3">{region.description}</p>
                    <p className="text-xs text-gray-500">{region.count}개 숙소</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 시즌별 추천 */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">지금 이 계절, 이런 여행 어때요?</h2>
            <p className="text-gray-600 mb-8">
              겨울에 어울리는 따뜻한 감성의 촌캉스를 찾아보세요
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/explore?tag=불멍과별멍">
                <Badge className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/90">
                  #불멍과별멍
                </Badge>
              </Link>
              <Link href="/explore?tag=아궁이체험">
                <Badge className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/90">
                  #아궁이체험
                </Badge>
              </Link>
              <Link href="/explore?tag=온돌방">
                <Badge className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/90">
                  #온돌방
                </Badge>
              </Link>
              <Link href="/explore?tag=스키장근처">
                <Badge className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/90">
                  #스키장근처
                </Badge>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
