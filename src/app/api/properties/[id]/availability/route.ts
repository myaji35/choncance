import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/properties/[id]/availability
 * Check property availability for given date range
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: "체크인/체크아웃 날짜를 입력해주세요" },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: "체크아웃 날짜는 체크인 날짜 이후여야 합니다" },
        { status: 400 }
      );
    }

    if (checkInDate < new Date()) {
      return NextResponse.json(
        { error: "과거 날짜는 선택할 수 없습니다" },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        propertyId: id,
        status: {
          in: ["CONFIRMED", "PENDING"],
        },
        OR: [
          // Booking starts during requested period
          {
            checkIn: {
              gte: checkInDate,
              lt: checkOutDate,
            },
          },
          // Booking ends during requested period
          {
            checkOut: {
              gt: checkInDate,
              lte: checkOutDate,
            },
          },
          // Booking encompasses requested period
          {
            checkIn: {
              lte: checkInDate,
            },
            checkOut: {
              gte: checkOutDate,
            },
          },
        ],
      },
      select: {
        checkIn: true,
        checkOut: true,
        status: true,
      },
    });

    const isAvailable = overlappingBookings.length === 0;

    return NextResponse.json({
      available: isAvailable,
      checkIn,
      checkOut,
      conflicts: isAvailable
        ? []
        : overlappingBookings.map((booking) => ({
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            status: booking.status,
          })),
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { error: "예약 가능 여부 확인에 실패했습니다" },
      { status: 500 }
    );
  }
}
