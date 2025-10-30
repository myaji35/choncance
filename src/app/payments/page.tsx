import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Calendar,
  MapPin,
  Receipt,
  Download,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default async function PaymentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // 사용자의 모든 결제 내역 조회
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        userId,
      },
    },
    include: {
      booking: {
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              thumbnailUrl: true,
              images: true,
            },
          },
        },
      },
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
      READY: { label: "대기중", variant: "outline" },
      IN_PROGRESS: { label: "진행중", variant: "outline" },
      DONE: { label: "완료", variant: "default" },
      CANCELLED: { label: "취소/환불", variant: "secondary" },
      FAILED: { label: "실패", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getMethodLabel = (method: string | null) => {
    if (!method) return "카드";
    const methodMap: Record<string, string> = {
      card: "카드",
      virtual_account: "가상계좌",
      transfer: "계좌이체",
      mobile: "휴대폰",
      kakao_pay: "카카오페이",
      toss: "토스",
    };
    return methodMap[method] || "카드";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/bookings">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              내 예약으로 돌아가기
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Receipt className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">결제 내역</h1>
              <p className="text-gray-600 mt-1">
                총 {payments.length}건의 결제 내역이 있습니다
              </p>
            </div>
          </div>
        </div>

        {/* Payment List */}
        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">아직 결제 내역이 없습니다</p>
              <Link href="/explore">
                <Button>숙소 둘러보기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {payments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {payment.booking.property.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{payment.booking.property.address}</span>
                      </div>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Booking Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>체크인/체크아웃</span>
                      </div>
                      <p className="font-medium">
                        {format(new Date(payment.booking.checkIn), "M월 d일", { locale: ko })} -{" "}
                        {format(new Date(payment.booking.checkOut), "M월 d일", { locale: ko })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">결제 방법</p>
                      <p className="font-medium">{getMethodLabel(payment.paymentMethod)}</p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">결제 금액</span>
                      <span className="font-medium">
                        {Number(payment.amount).toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">결제 일시</span>
                      <span className="font-medium">
                        {format(new Date(payment.requestedAt), "yyyy년 M월 d일 HH:mm", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                    {payment.paymentKey && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">결제 키</span>
                        <span className="font-mono text-xs text-gray-500">
                          {payment.paymentKey.slice(0, 20)}...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Transaction History */}
                  {payment.transactions.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        거래 내역 ({payment.transactions.length}건)
                      </p>
                      <div className="space-y-2">
                        {payment.transactions.slice(0, 3).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex justify-between text-sm py-2 px-3 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="font-medium">
                                {transaction.type === "PAYMENT" && "결제"}
                                {transaction.type === "REFUND" && "환불"}
                                {transaction.type === "CANCEL" && "취소"}
                              </span>
                              <span className="text-gray-500 ml-2">
                                {format(new Date(transaction.createdAt), "M/d HH:mm", {
                                  locale: ko,
                                })}
                              </span>
                            </div>
                            <span className="font-medium">
                              {Number(transaction.amount).toLocaleString()}원
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Link href={`/bookings/${payment.bookingId}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        예약 상세보기
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        // 영수증 다운로드 기능 (추후 구현)
                        alert("영수증 다운로드 기능은 준비 중입니다.");
                      }}
                    >
                      <Download className="w-4 h-4" />
                      영수증
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
