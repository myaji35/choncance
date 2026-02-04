"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

function BookingConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentKey || !orderId || !amount) {
        setError("결제 정보가 올바르지 않습니다");
        setIsConfirming(false);
        return;
      }

      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "결제 승인에 실패했습니다");
        }

        setBookingId(data.bookingId);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount]);

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-2xl font-bold mb-2">결제 확인 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">결제 실패</h2>
            <p className="text-gray-600 mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            예약이 완료되었습니다!
          </h2>
          <p className="text-gray-600 mb-8">
            예약 확인 메일을 발송했습니다
          </p>

          <div className="space-y-2">
            {bookingId && (
              <Link href={`/bookings/${bookingId}`}>
                <Button className="w-full">예약 상세보기</Button>
              </Link>
            )}
            <Link href="/bookings">
              <Button variant="outline" className="w-full">
                내 예약 목록
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" className="w-full">
                다른 숙소 둘러보기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingConfirmation />
    </Suspense>
  );
}

