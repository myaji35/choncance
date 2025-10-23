import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyById } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyTags } from "@/components/property/property-tags";
import { HostStory } from "@/components/property/host-story";
import { ExperienceInfo } from "@/components/property/experience-info";
import { HonestGuide } from "@/components/property/honest-guide";

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const property = getPropertyById(params.id);

  if (!property) {
    notFound();
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
            <PropertyGallery images={property.images} title={property.title} />

            {/* Property Header */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {property.title}
              </h1>
              <p className="text-lg text-gray-600">{property.location}</p>
              <PropertyTags tags={property.tags} />
            </div>

            {/* Property Description */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">소개</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </section>

            {/* Host Story */}
            <HostStory hostStory={property.hostStory} />

            {/* Experience Info */}
            <ExperienceInfo
              experiences={property.experiences}
              providedItems={property.providedItems}
            />

            {/* Honest Guide */}
            <HonestGuide honestGuide={property.honestGuide} />
          </div>

          {/* Right Column - Booking Sidebar (Desktop) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <Card className="shadow-lg">
                <CardContent className="p-6 space-y-6">
                  {/* Price */}
                  <div className="pb-6 border-b">
                    <p className="text-sm text-gray-600 mb-1">1박 기준</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ₩{property.pricePerNight.toLocaleString()}
                    </p>
                  </div>

                  {/* Booking Button */}
                  <Link href={`/booking/${property.id}`} className="block">
                    <Button className="w-full" size="lg">
                      예약하기
                    </Button>
                  </Link>

                  <p className="text-xs text-gray-500 text-center">
                    예약 확정 전에는 요금이 청구되지 않습니다
                  </p>
                </CardContent>
              </Card>
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
      </div>
    </div>
  );
}
