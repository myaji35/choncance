import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { TagList } from "@/components/tag-badge";

export default async function WishlistPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const wishlists = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          tags: true,
          host: {
            select: {
              businessNumber: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate average rating for each property
  const propertiesWithRating = wishlists.map((w) => {
    const avgRating =
      w.property.reviews.length > 0
        ? w.property.reviews.reduce((sum, r) => sum + r.rating, 0) /
          w.property.reviews.length
        : 0;

    return {
      ...w,
      property: {
        ...w.property,
        avgRating,
      },
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 fill-red-500 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">찜한 숙소</h1>
          </div>
          <p className="text-gray-600">
            마음에 드는 숙소를 저장하고 나중에 다시 확인하세요
          </p>
        </div>

        {/* Wishlist Grid */}
        {propertiesWithRating.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesWithRating.map(({ property }) => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full group">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={
                        property.thumbnailUrl ||
                        property.images[0] ||
                        "/placeholder-property.jpg"
                      }
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <WishlistButton
                      propertyId={property.id}
                      variant="overlay"
                      size="default"
                    />
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Property Name */}
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                      {property.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {property.city}, {property.province}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {property.description}
                    </p>

                    {/* Tags */}
                    {property.tags && property.tags.length > 0 && (
                      <TagList
                        tags={property.tags}
                        size="sm"
                        maxTags={3}
                        className="mt-2"
                      />
                    )}

                    {/* Rating and Price */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      {property._count.reviews > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {property.avgRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({property._count.reviews})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">리뷰 없음</span>
                      )}

                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          ₩
                          {(typeof property.pricePerNight === "number"
                            ? property.pricePerNight
                            : property.pricePerNight.toNumber()
                          ).toLocaleString()}
                          <span className="text-sm font-normal text-gray-600">
                            {" "}
                            / 박
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                아직 찜한 숙소가 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                마음에 드는 숙소를 찜하고 나중에 다시 확인하세요
              </p>
              <Link href="/explore">
                <Button size="lg">
                  <Heart className="w-4 h-4 mr-2" />
                  숙소 둘러보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
