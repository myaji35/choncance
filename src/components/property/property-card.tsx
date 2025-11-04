"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagList } from "@/components/tag/tag-badge";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

interface PropertyCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: any;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const imageUrl = property.thumbnailUrl || property.images[0] || '/placeholder-property.jpg';

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
          <WishlistButton
            propertyId={property.id}
            variant="overlay"
            size="default"
          />
        </div>
        <CardHeader className="space-y-1.5 sm:space-y-2 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-bold line-clamp-1">
            {property.name}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {property.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
            {property.description}
          </p>

          {/* Tags */}
          {property.tags && property.tags.length > 0 && (
            <TagList
              tags={property.tags}
              size="sm"
              maxTags={3}
              className="mt-2 sm:mt-3"
            />
          )}

          {/* Price */}
          <div className="text-right pt-2 border-t">
            {property.discountRate && property.discountRate > 0 ? (
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 sm:py-1 rounded">
                    {property.discountRate}% 할인
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <p className="text-xs sm:text-sm text-gray-400 line-through">
                    ₩{property.pricePerNight.toLocaleString()}
                  </p>
                </div>
                <p className="text-base sm:text-lg font-bold text-red-600">
                  ₩{(property.discountedPrice || (property.pricePerNight * (1 - property.discountRate / 100))).toLocaleString()}
                  <span className="text-xs sm:text-sm font-normal text-gray-600"> / 박</span>
                </p>
              </div>
            ) : (
              <p className="text-base sm:text-lg font-bold text-primary">
                ₩{property.pricePerNight.toLocaleString()}
                <span className="text-xs sm:text-sm font-normal text-gray-600"> / 박</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
