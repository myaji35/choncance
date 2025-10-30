import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createBookingCard } from "@/lib/trello/booking-sync";

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      propertyId,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      guests,
      guestInfo,
      specialRequests,
    } = body;

    // Validation
    if (!propertyId || !checkInStr || !checkOutStr || !guests || !guestInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    // Validate dates
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Get property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Calculate price
    const numberOfNights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    const calendarDates = await prisma.calendar.findMany({
      where: {
        propertyId,
        date: {
          gte: checkIn,
          lt: checkOut,
        },
      },
    });

    let accommodationTotal = 0;
    const currentDate = new Date(checkIn);

    while (currentDate < checkOut) {
      const calendar = calendarDates.find(
        (c) => c.date.toDateString() === currentDate.toDateString()
      );

      const nightlyRate = calendar?.priceOverride
        ? Number(calendar.priceOverride)
        : Number(property.pricePerNight);
      accommodationTotal += nightlyRate;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const serviceFee = Math.round(accommodationTotal * 0.1);
    const totalAmount = accommodationTotal + serviceFee;

    // Create booking using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Re-check availability within transaction
      const existingBookings = await tx.booking.findMany({
        where: {
          propertyId,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
          OR: [
            {
              checkIn: { lt: checkOut },
              checkOut: { gt: checkIn },
            },
          ],
        },
      });

      if (existingBookings.length > 0) {
        throw new Error("이미 예약된 날짜입니다");
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          propertyId,
          checkIn,
          checkOut,
          guests,
          nightlyRate: property.pricePerNight,
          numberOfNights,
          accommodationTotal,
          experiencesTotal: 0,
          serviceFee,
          totalAmount,
          status: "PENDING",
          guestName: guestInfo.name,
          guestPhone: guestInfo.phone,
          guestEmail: guestInfo.email,
          specialRequests: specialRequests || null,
        },
      });

      // Create payment record
      const orderId = `ORD-${booking.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalAmount,
          currency: "KRW",
          status: "READY",
          orderId,
          orderName: `${property.name} 예약`,
        },
      });

      return { booking, payment };
    });

    // Trello 카드 생성 (비동기, 실패해도 예약은 정상 처리)
    createBookingCard({
      id: result.booking.id,
      propertyName: property.name,
      guestName: guestInfo.name,
      guestEmail: guestInfo.email,
      checkIn,
      checkOut,
      guests,
      totalAmount,
      status: result.booking.status,
    }).catch((error) => {
      console.error("Trello sync failed:", error);
      // 에러가 나도 예약은 정상 처리
    });

    // TODO: Generate Toss Payments checkout URL
    const checkoutUrl = `/booking/${result.booking.id}/checkout`;

    return NextResponse.json(
      {
        booking: result.booking,
        payment: {
          orderId: result.payment.orderId,
          orderName: result.payment.orderName,
          amount: Number(result.payment.amount),
          checkoutUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings
 * Get user's bookings
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
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
          payment: {
            select: {
              status: true,
              amount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
