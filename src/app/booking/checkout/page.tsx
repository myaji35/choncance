"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Users, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  const propertyId = searchParams.get("propertyId");
  const checkInStr = searchParams.get("checkIn");
  const checkOutStr = searchParams.get("checkOut");
  const guestsStr = searchParams.get("guests");

  const [property, setProperty] = useState<any>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guest information
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      setGuestName(user.fullName || "");
      setGuestEmail(user.emailAddresses[0]?.emailAddress || "");
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const loadData = async () => {
      if (!propertyId || !checkInStr || !checkOutStr || !guestsStr) {
        setError("예약 정보가 올바르지 않습니다");
        setIsLoading(false);
        return;
      }

      try {
        // Load property
        const propResponse = await fetch(`/api/properties/${propertyId}`);
        if (!propResponse.ok) throw new Error("숙소 정보를 불러올 수 없습니다");
        const propData = await propResponse.json();
        setProperty(propData.property);

        // Check availability and get price
        const availParams = new URLSearchParams({
          propertyId,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          guests: guestsStr,
        });
        const availResponse = await fetch(`/api/availability/check?${availParams}`);
        const availData = await availResponse.json();

        if (!availResponse.ok || !availData.available) {
          throw new Error(availData.reason || "이 날짜에는 예약할 수 없습니다");
        }

        setPriceBreakdown(availData.price);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [propertyId, checkInStr, checkOutStr, guestsStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          guests: parseInt(guestsStr || "1"),
          guestInfo: {
            name: guestName,
            phone: guestPhone,
            email: guestEmail,
          },
          specialRequests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "예약에 실패했습니다");
      }

      // Launch Toss Payments using SDK
      const { loadTossPayments } = await import("@tosspayments/payment-sdk");
      const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

      const tossPayments = await loadTossPayments(tossClientKey);

      const successUrl = `${window.location.origin}/booking/success`;
      const failUrl = `${window.location.origin}/booking/fail`;

      // Request payment
      await tossPayments.requestPayment("카드", {
        amount: data.payment.amount,
        orderId: data.payment.orderId,
        orderName: data.payment.orderName,
        customerName: guestName,
        customerEmail: guestEmail,
        customerMobilePhone: guestPhone.replace(/-/g, ""),
        successUrl,
        failUrl,
      });
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">예약 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>돌아가기</Button>
        </div>
      </div>
    );
  }

  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;
  const guests = parseInt(guestsStr || "1");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>돌아가기</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">예약 확인 및 결제</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle>예약자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guestName">이름 *</Label>
                    <Input
                      id="guestName"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      placeholder="홍길동"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestPhone">전화번호 *</Label>
                    <Input
                      id="guestPhone"
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                      placeholder="010-1234-5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestEmail">이메일 *</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">특별 요청사항 (선택)</Label>
                    <Textarea
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="호스트에게 전달할 특별한 요청사항이 있으시면 입력해주세요"
                      rows={4}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "처리 중..." : "예약 확정하기"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>예약 내역</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property && (
                  <>
                    {/* Property Info */}
                    <div className="pb-4 border-b">
                      <h3 className="font-semibold text-lg mb-2">{property.name}</h3>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{property.address}</span>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 mt-0.5 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">체크인</p>
                          <p className="text-sm text-gray-600">
                            {checkIn && format(checkIn, "PPP (eee)", { locale: ko })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {property.checkInTime} 이후
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 mt-0.5 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">체크아웃</p>
                          <p className="text-sm text-gray-600">
                            {checkOut && format(checkOut, "PPP (eee)", { locale: ko })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {property.checkOutTime} 이전
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 mt-0.5 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">게스트</p>
                          <p className="text-sm text-gray-600">{guests}명</p>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    {priceBreakdown && (
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            ₩{priceBreakdown.nightlyRate.toLocaleString()} × {priceBreakdown.numberOfNights}박
                          </span>
                          <span>₩{priceBreakdown.accommodationTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>서비스 수수료</span>
                          <span>₩{priceBreakdown.serviceFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>총 합계</span>
                          <span>₩{priceBreakdown.total.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}

