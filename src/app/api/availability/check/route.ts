import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/availability/check
 * Check property availability for given dates
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");
    const checkInStr = searchParams.get("checkIn");
    const checkOutStr = searchParams.get("checkOut");
    const guestsStr = searchParams.get("guests");

    // Validation
    if (!propertyId || !checkInStr || !checkOutStr) {
      return NextResponse.json(
        { error: "propertyId, checkIn, and checkOut are required" },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);
    const guests = guestsStr ? parseInt(guestsStr) : 1;

    // Validate dates
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (checkIn >= checkOut) {
      return NextResponse.json(
        {
          available: false,
          reason: "체크아웃 날짜는 체크인 날짜보다 이후여야 합니다",
        },
        { status: 200 }
      );
    }

    if (checkIn < new Date()) {
      return NextResponse.json(
        {
          available: false,
          reason: "과거 날짜는 예약할 수 없습니다",
        },
        { status: 200 }
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

    if (property.status !== "APPROVED") {
      return NextResponse.json(
        {
          available: false,
          reason: "이 숙소는 현재 예약할 수 없습니다",
        },
        { status: 200 }
      );
    }

    // Check guest capacity
    if (guests > property.maxGuests) {
      return NextResponse.json(
        {
          available: false,
          reason: `최대 ${property.maxGuests}명까지 예약 가능합니다`,
        },
        { status: 200 }
      );
    }

    // Calculate number of nights
    const numberOfNights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check min/max nights
    if (numberOfNights < property.minNights) {
      return NextResponse.json(
        {
          available: false,
          reason: `최소 ${property.minNights}박 이상 예약해야 합니다`,
        },
        { status: 200 }
      );
    }

    if (numberOfNights > property.maxNights) {
      return NextResponse.json(
        {
          available: false,
          reason: `최대 ${property.maxNights}박까지만 예약 가능합니다`,
        },
        { status: 200 }
      );
    }

    // Check for existing bookings
    const existingBookings = await prisma.booking.findMany({
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
      return NextResponse.json(
        {
          available: false,
          reason: "선택하신 날짜에 이미 예약이 있습니다",
        },
        { status: 200 }
      );
    }

    // Check calendar blocks
    const blockedDates = await prisma.calendar.findMany({
      where: {
        propertyId,
        date: {
          gte: checkIn,
          lt: checkOut,
        },
        available: false,
      },
    });

    if (blockedDates.length > 0) {
      const unavailableDates = blockedDates.map((d) =>
        d.date.toISOString().split("T")[0]
      );
      return NextResponse.json(
        {
          available: false,
          reason: "선택한 날짜 중 이용 불가한 날짜가 있습니다",
          unavailableDates,
        },
        { status: 200 }
      );
    }

    // Calculate price
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

    // Service fee (10%)
    const serviceFee = Math.round(accommodationTotal * 0.1);
    const total = accommodationTotal + serviceFee;

    return NextResponse.json({
      available: true,
      price: {
        nightlyRate: Number(property.pricePerNight),
        numberOfNights,
        accommodationTotal,
        serviceFee,
        total,
      },
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
