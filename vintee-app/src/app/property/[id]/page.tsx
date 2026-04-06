export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { maskName } from "@/lib/utils/review";
import ReviewList from "@/components/review/ReviewList";
import BookingForm from "@/components/booking/BookingForm";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, name: true } },
    },
  });

  if (!property) notFound();

  const [reviews, total, agg] = await Promise.all([
    prisma.review.findMany({
      where: { propertyId: id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.review.count({ where: { propertyId: id } }),
    prisma.review.aggregate({
      where: { propertyId: id },
      _avg: { rating: true },
    }),
  ]);

  const reviewData = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    guestName: maskName(r.user.name),
    createdAt: r.createdAt.toISOString(),
    hostReply: r.hostReply,
    repliedAt: r.repliedAt?.toISOString() ?? null,
  }));

  const summary = {
    avgRating: agg._avg.rating ?? 0,
    totalCount: total,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* 좌측: 숙소 정보 */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h1 className="text-2xl font-bold text-[#16325C]">{property.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{property.location}</p>
            {property.description && (
              <p className="mt-4 text-sm leading-relaxed text-gray-700">
                {property.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                호스트: {property.host.name}
              </span>
              <span className="flex items-center gap-1">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                최대 {property.maxGuests}명
              </span>
              {property.phone && (
                <span className="flex items-center gap-1">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
                  </svg>
                  {property.phone}
                </span>
              )}
            </div>
          </div>

          {/* 리뷰 섹션 */}
          <ReviewList
            propertyId={id}
            initialReviews={reviewData}
            summary={summary}
            initialHasMore={total > 10}
          />
        </div>

        {/* 우측: 예약 폼 */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <BookingForm
            propertyId={id}
            pricePerNight={property.pricePerNight}
            maxGuests={property.maxGuests}
            hostId={property.host.id}
          />
        </div>
      </div>
    </div>
  );
}
