"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagList } from "@/components/tag-badge";

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
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg font-bold line-clamp-1">
            {property.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {property.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.description}
          </p>

          {/* Tags */}
          {property.tags && property.tags.length > 0 && (
            <TagList
              tags={property.tags}
              size="sm"
              maxTags={3}
              className="mt-3"
            />
          )}

          {/* Price */}
          <div className="text-right pt-2 border-t">
            <p className="text-lg font-bold text-primary">
              ₩{property.pricePerNight.toLocaleString()}
              <span className="text-sm font-normal text-gray-600"> / 박</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
