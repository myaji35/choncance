export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { maskName } from "@/lib/utils/review";
import { generateFaqs, parseJsonArray, type NearbyAttraction } from "@/lib/utils/geo";
import ReviewList from "@/components/review/ReviewList";
import BookingForm from "@/components/booking/BookingForm";
import PropertyJsonLd from "@/components/seo/PropertyJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import PropertyMap from "@/components/map/PropertyMap";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vintee.kr";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    select: { title: true, description: true, location: true, thumbnailUrl: true, pricePerNight: true },
  });

  if (!property) return { title: "숙소를 찾을 수 없습니다 | VINTEE" };

  const price = property.pricePerNight
    ? `${property.pricePerNight.toLocaleString()}원/박`
    : "";
  const desc = `${property.location} ${price} — ${property.description?.slice(0, 100) || "VINTEE 촌캉스 숙소"}`;

  return {
    title: `${property.title} | VINTEE`,
    description: desc,
    alternates: { canonical: `${BASE_URL}/property/${id}` },
    openGraph: {
      title: property.title,
      description: desc,
      url: `${BASE_URL}/property/${id}`,
      type: "website",
      ...(property.thumbnailUrl ? { images: [property.thumbnailUrl] } : {}),
    },
  };
}

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

  const highlights = parseJsonArray<string>(property.highlights);
  const attractions = parseJsonArray<NearbyAttraction>(property.nearbyAttractions);
  const faqs = generateFaqs(property, summary);
  const url = `${BASE_URL}/property/${id}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* JSON-LD: LodgingBusiness + FAQPage */}
      <PropertyJsonLd
        property={{
          title: property.title,
          description: property.description,
          location: property.location,
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
          pricePerNight: property.pricePerNight,
          amenities: property.amenities,
          phone: property.phone,
          thumbnailUrl: property.thumbnailUrl,
          checkinTime: property.checkinTime,
          checkoutTime: property.checkoutTime,
          numberOfRooms: property.numberOfRooms,
          petsAllowed: property.petsAllowed,
          maxGuests: property.maxGuests,
        }}
        reviews={reviewData.map((r) => ({
          rating: r.rating,
          content: r.content,
          guestName: r.guestName,
        }))}
        summary={summary}
        url={url}
      />
      <FaqJsonLd property={property} summary={summary} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* 좌측: 숙소 정보 */}
        <article className="space-y-6">
          <header className="rounded-lg border border-gray-200 bg-white p-6">
            <h1 className="text-2xl font-bold text-[#16325C]">{property.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{property.location}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
              {property.pricePerNight && (
                <span className="font-semibold text-[#16325C]">
                  {property.pricePerNight.toLocaleString()}원/박
                </span>
              )}
              <span className="text-gray-400">·</span>
              <span>최대 {property.maxGuests}명</span>
              {property.checkinTime && (
                <>
                  <span className="text-gray-400">·</span>
                  <span>체크인 {property.checkinTime}</span>
                </>
              )}
              {property.checkoutTime && (
                <>
                  <span className="text-gray-400">·</span>
                  <span>체크아웃 {property.checkoutTime}</span>
                </>
              )}
            </div>
          </header>

          {/* 숙소 소개 */}
          {property.description && (
            <section
              aria-label="숙소 소개"
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-[#16325C]">숙소 소개</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {property.description}
              </p>
            </section>
          )}

          {/* 하이라이트 */}
          {highlights.length > 0 && (
            <section
              aria-label="하이라이트"
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-[#16325C]">하이라이트</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-full bg-[#00A1E0] px-3 py-1 text-xs font-medium text-white"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 위치 + 주변 관광지 */}
          {(property.address || attractions.length > 0) && (
            <section
              aria-label="위치"
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-[#16325C]">위치</h2>
              {property.address && (
                <p className="mt-2 text-sm text-gray-700">{property.address}</p>
              )}
              {property.latitude !== null && property.longitude !== null && (
                <div className="mt-4">
                  <PropertyMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    title={property.title}
                    nearbyAttractions={attractions}
                  />
                </div>
              )}
              {attractions.length > 0 && property.latitude === null && (
                <>
                  <h3 className="mt-4 text-sm font-semibold text-gray-600">주변 관광지</h3>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {attractions.map((a) => (
                      <li key={a.name}>
                        · {a.name} <span className="text-gray-500">({a.distance})</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          {/* 호스트 소개 */}
          <section
            aria-label="호스트 소개"
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-[#16325C]">호스트</h2>
            <p className="mt-2 text-sm font-medium text-gray-800">{property.host.name}</p>
            {property.hostIntro && (
              <p className="mt-2 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {property.hostIntro}
              </p>
            )}
            {property.uniqueExperience && (
              <p className="mt-3 text-sm text-gray-700">
                <span className="font-semibold text-[#16325C]">고유 체험: </span>
                {property.uniqueExperience}
              </p>
            )}
          </section>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section
              aria-label="자주 묻는 질문"
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-[#16325C]">자주 묻는 질문</h2>
              <div className="mt-3 divide-y divide-gray-200">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-800 marker:text-[#00A1E0]">
                      {faq.question}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* 리뷰 */}
          <section aria-label="후기">
            <ReviewList
              propertyId={id}
              initialReviews={reviewData}
              summary={summary}
              initialHasMore={total > 10}
            />
          </section>
        </article>

        {/* 우측: 예약 폼 */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <BookingForm
            propertyId={id}
            pricePerNight={property.pricePerNight}
            maxGuests={property.maxGuests}
            hostId={property.host.id}
          />
        </aside>
      </div>
    </div>
  );
}
