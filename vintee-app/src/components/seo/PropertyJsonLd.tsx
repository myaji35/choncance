import { parseJsonArray } from "@/lib/utils/geo";

interface PropertyJsonLdProps {
  property: {
    title: string;
    description: string | null;
    location: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    pricePerNight: number | null;
    amenities: string;
    phone: string | null;
    thumbnailUrl: string | null;
    checkinTime: string | null;
    checkoutTime: string | null;
    numberOfRooms: number;
    petsAllowed: boolean;
    maxGuests: number;
  };
  reviews: {
    rating: number;
    content: string;
    guestName: string;
  }[];
  summary: {
    avgRating: number;
    totalCount: number;
  };
  url: string;
}

export default function PropertyJsonLd({ property, reviews, summary, url }: PropertyJsonLdProps) {
  const amenities = parseJsonArray<string>(property.amenities);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.title,
    description: property.description ?? property.title,
    url,
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressRegion: property.location,
      streetAddress: property.address ?? property.location,
    },
    ...(property.latitude !== null && property.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.latitude,
            longitude: property.longitude,
          },
        }
      : {}),
    ...(property.pricePerNight
      ? { priceRange: `₩${property.pricePerNight.toLocaleString()}/박` }
      : {}),
    ...(property.phone ? { telephone: property.phone } : {}),
    ...(property.thumbnailUrl ? { image: property.thumbnailUrl } : {}),
    ...(amenities.length > 0
      ? {
          amenityFeature: amenities.map((a) => ({
            "@type": "LocationFeatureSpecification",
            name: a,
          })),
        }
      : {}),
    ...(property.checkinTime ? { checkinTime: property.checkinTime } : {}),
    ...(property.checkoutTime ? { checkoutTime: property.checkoutTime } : {}),
    numberOfRooms: property.numberOfRooms,
    petsAllowed: property.petsAllowed,
    maximumAttendeeCapacity: property.maxGuests,
    ...(summary.totalCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(summary.avgRating.toFixed(1)),
            reviewCount: summary.totalCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
            },
            author: { "@type": "Person", name: r.guestName },
            reviewBody: r.content,
          })),
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
