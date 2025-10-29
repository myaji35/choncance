import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Heart } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { TagBadge } from "@/components/property/tag-badge";

async function getWishlist(userId: string) {
  try {
    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            tags: true,
            host: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return wishlists;
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return [];
  }
}

export default async function WishlistPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const wishlists = await getWishlist(userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">내 찜 목록</h1>
          </div>
          <p className="text-gray-600">마음에 드는 숙소를 저장해두었습니다</p>
        </div>

        {!wishlists || wishlists.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-600 mb-4">
                아직 찜한 숙소가 없습니다
              </p>
              <p className="text-sm text-gray-500 mb-6">
                마음에 드는 숙소를 찾아 하트 버튼을 눌러보세요
              </p>
              <Link href="/explore">
                <Button>숙소 둘러보기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              총 {wishlists.length}개의 숙소
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlists.map((wishlist: any) => {
                const property = wishlist.property;
                const imageUrl =
                  property.thumbnailUrl ||
                  property.images[0] ||
                  "/placeholder-property.jpg";

                return (
                  <Link
                    key={wishlist.id}
                    href={`/property/${property.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={property.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          {/* Location & Name */}
                          <div className="mb-3">
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                              <MapPin className="w-3 h-3" />
                              <span>{property.city || property.province}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">
                              {property.name}
                            </h3>
                          </div>

                          {/* Tags */}
                          {property.tags && property.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {property.tags.slice(0, 2).map((tag: any) => (
                                <TagBadge key={tag.id} tag={tag} size="sm" />
                              ))}
                              {property.tags.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{property.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Price */}
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-gray-900">
                              ₩{Number(property.pricePerNight).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-600">/ 박</span>
                          </div>

                          {/* Host */}
                          {property.host?.user?.name && (
                            <div className="mt-2 text-xs text-gray-500">
                              호스트: {property.host.user.name}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
