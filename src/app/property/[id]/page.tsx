import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyById, getProperties } from "@/lib/api/properties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Users, Home, Star } from "lucide-react";
import { PropertyGallery } from "@/components/property/property-gallery";
import { TagList } from "@/components/tag/tag-badge";
import { PropertyCard } from "@/components/property/property-card";
import { BookingWidget } from "@/components/booking/booking-widget";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { ReviewCard } from "@/components/review/review-card";
import { prisma } from "@/lib/prisma";

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  let property;
  try {
    property = await getPropertyById(params.id);
  } catch (error) {
    notFound();
  }

  if (!property) {
    notFound();
  }

  // Serialize Decimal fields for main property
  const serializedProperty = {
    ...property,
    pricePerNight: Number(property.pricePerNight),
    discountedPrice: property.discountedPrice ? Number(property.discountedPrice) : undefined,
  };

  // 관련 숙소 추천 (같은 태그를 가진 숙소)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let relatedProperties: any[] = [];
  if (property.tags.length > 0) {
    try {
      const allProperties = await getProperties([property.tags[0].name]);
      relatedProperties = allProperties
        .filter(p => p.id !== property.id)
        .slice(0, 3)
        .map(p => ({
          ...p,
          pricePerNight: Number(p.pricePerNight),
        }));
    } catch (error) {
      console.error("Failed to fetch related properties:", error);
    }
  }

  // Fetch reviews
  let reviews: any[] = [];
  let averageRating = { average: 0, count: 0 };
  try {
    const reviewData = await prisma.review.findMany({
      where: { propertyId: params.id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    reviews = reviewData;

    if (reviewData.length > 0) {
      const stats = await prisma.review.aggregate({
        where: { propertyId: params.id },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });

      averageRating = {
        average: stats._avg.rating || 0,
        count: stats._count.id,
      };
    }
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Back Navigation */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>탐색으로 돌아가기</span>
        </Link>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-10 md:space-y-12">
            {/* Property Gallery */}
            <PropertyGallery images={serializedProperty.images} title={serializedProperty.name} />

            {/* Property Header */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 flex-1">
                  {serializedProperty.name}
                </h1>
                <WishlistButton
                  propertyId={serializedProperty.id}
                  variant="default"
                  size="lg"
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm sm:text-base md:text-lg">{serializedProperty.address}</p>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>최대 {serializedProperty.maxGuests}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  <span>최소 {serializedProperty.minNights}박</span>
                </div>
              </div>

              {serializedProperty.tags && serializedProperty.tags.length > 0 && (
                <TagList tags={serializedProperty.tags as any} size="sm" className="sm:hidden" />
              )}
              {serializedProperty.tags && serializedProperty.tags.length > 0 && (
                <TagList tags={serializedProperty.tags as any} size="default" className="hidden sm:flex" />
              )}
            </div>

            {/* Property Description */}
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">숙소 소개</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {serializedProperty.description}
              </p>
            </section>

            {/* Host Story */}
            {serializedProperty.hostStory && (
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">호스트 이야기</h2>
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                    {serializedProperty.hostStory}
                  </p>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                    - {serializedProperty.host.user.name || '호스트'}
                  </p>
                </div>
              </section>
            )}

            {/* Amenities */}
            {serializedProperty.amenities && serializedProperty.amenities.length > 0 && (
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">편의시설</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  {serializedProperty.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Rules */}
            {serializedProperty.rules && (
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">숙소 이용규칙</h2>
                <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {serializedProperty.rules}
                  </p>
                </div>
              </section>
            )}

            {/* Check-in/out times */}
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">체크인/체크아웃</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">체크인</p>
                    <p className="text-lg sm:text-xl font-bold">{serializedProperty.checkInTime}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">체크아웃</p>
                    <p className="text-lg sm:text-xl font-bold">{serializedProperty.checkOutTime}</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Right Column - Booking Sidebar (Desktop) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <BookingWidget
                propertyId={serializedProperty.id}
                pricePerNight={serializedProperty.pricePerNight}
                discountRate={serializedProperty.discountRate ?? undefined}
                discountedPrice={serializedProperty.discountedPrice ?? undefined}
                maxGuests={serializedProperty.maxGuests}
                minNights={serializedProperty.minNights}
                maxNights={serializedProperty.maxNights}
              />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg z-10">
          <div className="container mx-auto flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">1박</p>
              {serializedProperty.discountRate && serializedProperty.discountRate > 0 ? (
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded flex-shrink-0">
                    {serializedProperty.discountRate}%
                  </span>
                  <p className="text-xs sm:text-sm text-gray-400 line-through">
                    ₩{serializedProperty.pricePerNight.toLocaleString()}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-red-600">
                    ₩{(serializedProperty.discountedPrice || (serializedProperty.pricePerNight * (1 - serializedProperty.discountRate / 100))).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-base sm:text-lg font-bold">
                  ₩{serializedProperty.pricePerNight.toLocaleString()}
                </p>
              )}
            </div>
            <Link href={`/booking/${serializedProperty.id}`} className="flex-shrink-0">
              <Button size="default" className="text-sm sm:text-base px-4 sm:px-6">예약하기</Button>
            </Link>
          </div>
        </div>

        {/* Add padding at bottom for mobile sticky CTA */}
        <div className="h-20 sm:h-24 lg:hidden" />

        {/* Reviews Section */}
        {averageRating.count > 0 && (
          <section className="py-8 sm:py-10 md:py-12 border-t">
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {averageRating.average.toFixed(1)}
                  </h2>
                </div>
                <div className="text-gray-600">
                  <p className="text-sm sm:text-base font-semibold">리뷰 {averageRating.count}개</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {averageRating.count > 5 && (
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-500">
                  {averageRating.count - 5}개의 리뷰가 더 있습니다
                </p>
              </div>
            )}
          </section>
        )}

        {/* Related Properties Section */}
        {relatedProperties.length > 0 && (
          <section className="mt-12 sm:mt-16 md:mt-20">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                비슷한 촌캉스
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                이 숙소와 비슷한 테마의 촌캉스를 추천합니다
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedProperties.map((relatedProperty) => (
                <PropertyCard
                  key={relatedProperty.id}
                  property={relatedProperty}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
