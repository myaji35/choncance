import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyById } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

interface BookingPageProps {
  params: {
    id: string;
  };
}

export default function BookingPage({ params }: BookingPageProps) {
  const property = getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-12">
        {/* Back Navigation */}
        <Link
          href={`/property/${property.id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 md:mb-8 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>숙소 상세로 돌아가기</span>
        </Link>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">예약하기</h1>
          <p className="text-base sm:text-lg text-gray-600">{property.title}</p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                예약 페이지 준비 중
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                현재 예약 시스템을 구축하고 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Property Info */}
              <div className="pb-4 sm:pb-6 border-b">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">선택하신 숙소</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{property.title}</p>
                <p className="text-sm sm:text-base text-gray-600">{property.location}</p>
              </div>

              {/* Price Info */}
              <div className="pb-4 sm:pb-6 border-b">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">1박 요금</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ₩{property.pricePerNight.toLocaleString()}
                </p>
              </div>

              {/* Coming Soon Features */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">곧 제공될 기능</h3>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-900">날짜 선택</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        체크인/체크아웃 날짜를 선택하실 수 있습니다
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-900">실시간 예약 확정</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        즉시 예약 확정 및 결제가 가능합니다
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                <Link href={`/property/${property.id}`} className="flex-1">
                  <Button variant="outline" className="w-full text-sm sm:text-base">
                    숙소 상세 보기
                  </Button>
                </Link>
                <Link href="/explore" className="flex-1">
                  <Button variant="default" className="w-full text-sm sm:text-base">
                    다른 숙소 둘러보기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-700">
                💡 <strong>알려드립니다:</strong> 예약 시스템은 Story 1.3 (F-03: 간편 예약 및 결제 시스템)에서 구현될 예정입니다.
                현재는 숙소 탐색과 상세 정보 확인 기능을 이용하실 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
