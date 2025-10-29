"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    content: string;
    images: string[];
    createdAt: string | Date;
    user: {
      name: string | null;
      image: string | null;
    };
    hostReply?: string | null;
    repliedAt?: string | Date | null;
  };
  showProperty?: boolean;
  property?: {
    name: string;
  };
}

export function ReviewCard({ review, showProperty = false, property }: ReviewCardProps) {
  const createdDate = new Date(review.createdAt);

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* User Info & Rating */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold">
                  {review.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* User Name & Date */}
            <div>
              <p className="font-semibold text-gray-900">
                {review.user.name || "익명"}
              </p>
              <p className="text-sm text-gray-500">
                {format(createdDate, "PPP", { locale: ko })}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Property Name (if showing) */}
        {showProperty && property && (
          <div className="text-sm font-medium text-gray-700">
            {property.name}
          </div>
        )}

        {/* Review Content */}
        <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {review.images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}

        {/* Host Reply */}
        {review.hostReply && (
          <div className="mt-4 pl-4 border-l-2 border-green-500 bg-green-50 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-gray-900">
                호스트의 답변
              </p>
              {review.repliedAt && (
                <p className="text-xs text-gray-500">
                  {format(new Date(review.repliedAt), "PPP", { locale: ko })}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {review.hostReply}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
