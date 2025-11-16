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
  // Use real photos for demo, fallback to placeholder
  const getFallbackImage = () => {
    const propertyImages = [
      '/images/properties/property-1.jpg',
      '/images/properties/property-2.jpg',
      '/images/properties/property-3.jpg',
      '/images/properties/property-4.jpg',
      '/images/properties/property-5.jpg',
    ];
    // Use property ID to consistently select same image
    const index = property.id ? parseInt(property.id.slice(-1), 16) % propertyImages.length : 0;
    return propertyImages[index];
  };

  const imageUrl = property.thumbnailUrl || property.images[0] || getFallbackImage();

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <Card className="overflow-hidden h-full card-interactive border border-gray-200 hover:border-primary/20 transition-all duration-300 shadow-soft hover:shadow-medium">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/20">
          <Image
            src={imageUrl}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
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
          <div className="text-right pt-2 border-t border-gray-100">
            {property.discountRate && property.discountRate > 0 ? (
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <span className="inline-block bg-primary text-white text-xs font-bold px-2 py-0.5 sm:py-1 rounded-md shadow-sm animate-fade-in">
                    {property.discountRate}% 할인
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <p className="text-xs sm:text-sm text-gray-400 line-through">
                    ₩{property.pricePerNight.toLocaleString()}
                  </p>
                </div>
                <p className="text-base sm:text-lg font-bold text-primary group-hover:scale-105 transition-transform duration-200 inline-block">
                  ₩{(property.discountedPrice || (property.pricePerNight * (1 - property.discountRate / 100))).toLocaleString()}
                  <span className="text-xs sm:text-sm font-normal text-gray-600"> / 박</span>
                </p>
              </div>
            ) : (
              <p className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary group-hover:scale-105 transition-all duration-200 inline-block">
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
