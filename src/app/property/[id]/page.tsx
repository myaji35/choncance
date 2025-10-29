import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyById, getProperties } from "@/lib/api/properties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Users, Home } from "lucide-react";
import { PropertyGallery } from "@/components/property/property-gallery";
import { TagList } from "@/components/tag-badge";
import { PropertyCard } from "@/components/property/property-card";
import { BookingWidget } from "@/components/booking/booking-widget";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

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

  // 관련 숙소 추천 (같은 태그를 가진 숙소)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let relatedProperties: any[] = [];
  if (property.tags.length > 0) {
    try {
      const allProperties = await getProperties([property.tags[0].name]);
      relatedProperties = allProperties
        .filter(p => p.id !== property.id)
        .slice(0, 3);
    } catch (error) {
      console.error("Failed to fetch related properties:", error);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>탐색으로 돌아가기</span>
        </Link>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Property Gallery */}
            <PropertyGallery images={property.images} title={property.name} />

            {/* Property Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">
                  {property.name}
                </h1>
                <WishlistButton
                  propertyId={property.id}
                  variant="default"
                  size="lg"
                />
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <p className="text-lg">{property.address}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>최대 {property.maxGuests}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  <span>최소 {property.minNights}박</span>
                </div>
              </div>

              {property.tags && property.tags.length > 0 && (
                <TagList tags={property.tags} size="md" />
              )}
            </div>

            {/* Property Description */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">숙소 소개</h2>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </section>

            {/* Host Story */}
            {property.hostStory && (
              <section className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">호스트 이야기</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                    {property.hostStory}
                  </p>
                  <p className="mt-4 text-sm text-gray-600">
                    - {property.host.user.name || '호스트'}
                  </p>
                </div>
              </section>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">편의시설</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Rules */}
            {property.rules && (
              <section className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">숙소 이용규칙</h2>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {property.rules}
                  </p>
                </div>
              </section>
            )}

            {/* Check-in/out times */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">체크인/체크아웃</h2>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">체크인</p>
                    <p className="text-xl font-bold">{property.checkInTime}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">체크아웃</p>
                    <p className="text-xl font-bold">{property.checkOutTime}</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Right Column - Booking Sidebar (Desktop) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <BookingWidget
                propertyId={property.id}
                pricePerNight={Number(property.pricePerNight)}
                maxGuests={property.maxGuests}
                minNights={property.minNights}
                maxNights={property.maxNights}
              />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 p-4 shadow-lg z-10">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">1박</p>
              <p className="text-lg font-bold">
                ₩{property.pricePerNight.toLocaleString()}
              </p>
            </div>
            <Link href={`/booking/${property.id}`}>
              <Button size="lg">예약하기</Button>
            </Link>
          </div>
        </div>

        {/* Add padding at bottom for mobile sticky CTA */}
        <div className="h-20 lg:hidden" />

        {/* Related Properties Section */}
        {relatedProperties.length > 0 && (
          <section className="mt-20">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                비슷한 촌캉스
              </h2>
              <p className="text-gray-600">
                이 숙소와 비슷한 테마의 촌캉스를 추천합니다
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((relatedProperty) => (
                <PropertyCard key={relatedProperty.id} property={relatedProperty} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
