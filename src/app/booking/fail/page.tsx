"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

function BookingFail() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-12 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">결제에 실패했습니다</h2>

          {message && (
            <p className="text-gray-600 mb-2">{decodeURIComponent(message)}</p>
          )}

          {code && (
            <p className="text-sm text-gray-500 mb-8">오류 코드: {code}</p>
          )}

          <div className="space-y-2">
            <Button onClick={() => router.back()} className="w-full">
              다시 시도하기
            </Button>
            <Link href="/explore">
              <Button variant="outline" className="w-full">
                숙소 둘러보기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingFailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingFail />
    </Suspense>
  );
}
