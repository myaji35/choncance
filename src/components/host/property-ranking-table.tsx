"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";
import Link from "next/link";

interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
}

interface PropertyRankingTableProps {
  data: PropertyPerformance[];
}

export function PropertyRankingTable({ data }: PropertyRankingTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          숙소별 성과
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map((property, index) => (
              <Link
                key={property.propertyId}
                href={`/host/properties/${property.propertyId}`}
              >
                <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Property Name */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {property.propertyName}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>총 예약: {property.totalBookings}건</span>
                      <span>확정: {property.confirmedBookings}건</span>
                      {property.reviewCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>
                            {property.averageRating.toFixed(1)} (
                            {property.reviewCount}개)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ₩{(property.totalRevenue / 10000).toFixed(0)}만
                    </div>
                    <div className="text-xs text-gray-500 mt-1">총 매출</div>
                  </div>

                  {/* Top Badge */}
                  {index === 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      TOP
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <p>숙소 데이터가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
