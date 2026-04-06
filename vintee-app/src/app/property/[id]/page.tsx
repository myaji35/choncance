export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { maskName } from "@/lib/utils/review";
import ReviewList from "@/components/review/ReviewList";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      host: { select: { name: true } },
    },
  });

  if (!property) {
    redirect("/");
  }

  // 리뷰 데이터 SSR
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* 숙소 정보 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-[#16325C]">{property.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{property.location}</p>
        {property.description && (
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            {property.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span>호스트: {property.host.name}</span>
          {property.pricePerNight && (
            <span>
              {property.pricePerNight.toLocaleString()}원 / 박
            </span>
          )}
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <div className="mt-8">
        <ReviewList
          propertyId={id}
          initialReviews={reviewData}
          summary={summary}
          initialHasMore={total > 10}
        />
      </div>
    </div>
  );
}
