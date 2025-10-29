import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/properties/[id]/calendar
 * Get property calendar with booked dates for a given month
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    // Default to current month if not specified
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-indexed

    // Calculate start and end of month
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

    // Extend range to include a few days before/after for UI purposes
    const rangeStart = new Date(startOfMonth);
    rangeStart.setDate(rangeStart.getDate() - 7);

    const rangeEnd = new Date(endOfMonth);
    rangeEnd.setDate(rangeEnd.getDate() + 7);

    // Get all bookings that overlap with this month
    const bookings = await prisma.booking.findMany({
      where: {
        propertyId: id,
        status: {
          in: ["CONFIRMED", "PENDING"],
        },
        OR: [
          // Booking starts in this period
          {
            checkIn: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
          // Booking ends in this period
          {
            checkOut: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
          // Booking encompasses this period
          {
            checkIn: {
              lte: rangeStart,
            },
            checkOut: {
              gte: rangeEnd,
            },
          },
        ],
      },
      select: {
        checkIn: true,
        checkOut: true,
        status: true,
      },
      orderBy: {
        checkIn: "asc",
      },
    });

    // Build array of booked dates
    const bookedDates: string[] = [];
    bookings.forEach((booking) => {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);

      let currentDate = new Date(start);
      while (currentDate < end) {
        bookedDates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return NextResponse.json({
      year: targetYear,
      month: targetMonth + 1, // Return 1-indexed month
      bookedDates: [...new Set(bookedDates)].sort(), // Remove duplicates and sort
      bookings: bookings.map((b) => ({
        checkIn: b.checkIn.toISOString().split("T")[0],
        checkOut: b.checkOut.toISOString().split("T")[0],
        status: b.status,
      })),
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "캘린더 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
