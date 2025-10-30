import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paymentId } = params;

    // 결제 정보 조회
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            property: {
              include: {
                host: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            user: true,
          },
        },
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 권한 확인
    if (payment.booking.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 영수증 데이터 생성
    const receipt = {
      // 영수증 정보
      receiptNumber: `RC-${payment.id.slice(0, 8).toUpperCase()}`,
      issuedAt: format(new Date(), "yyyy년 M월 d일 HH:mm", { locale: ko }),

      // 결제 정보
      payment: {
        id: payment.id,
        amount: Number(payment.amount),
        method: payment.paymentMethod || "card",
        status: payment.status,
        paidAt: format(new Date(payment.requestedAt), "yyyy년 M월 d일 HH:mm", {
          locale: ko,
        }),
        tossPaymentKey: payment.paymentKey,
      },

      // 예약 정보
      booking: {
        id: payment.booking.id,
        checkIn: format(new Date(payment.booking.checkIn), "yyyy년 M월 d일", {
          locale: ko,
        }),
        checkOut: format(new Date(payment.booking.checkOut), "yyyy년 M월 d일", {
          locale: ko,
        }),
        guests: payment.booking.guests,
        specialRequests: payment.booking.specialRequests,
      },

      // 숙소 정보
      property: {
        name: payment.booking.property.name,
        address: payment.booking.property.address,
      },

      // 호스트 정보
      host: {
        name: payment.booking.property.host.user.name,
        // 사업자 정보는 hostProfile에 있어야 함 (추가 필요시)
      },

      // 고객 정보
      customer: {
        name: payment.booking.user.name,
        email: payment.booking.user.email,
      },

      // 거래 내역
      transactions: payment.transactions.map((t) => ({
        type: t.type,
        amount: Number(t.amount),
        status: t.status,
        createdAt: format(new Date(t.createdAt), "yyyy-MM-dd HH:mm", {
          locale: ko,
        }),
      })),
    };

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Receipt generation error:", error);
    return NextResponse.json(
      { error: "영수증 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
