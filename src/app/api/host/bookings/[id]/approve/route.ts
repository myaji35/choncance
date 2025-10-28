import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/host/bookings/[id]/approve - Approve booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { id } = await params;

    // Get user and host profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hostProfile: true },
    });

    if (!user?.hostProfile) {
      return NextResponse.json(
        { error: "호스트 프로필이 필요합니다" },
        { status: 403 }
      );
    }

    // Get booking with property
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Check if property belongs to this host
    if (booking.property.hostId !== user.hostProfile.id) {
      return NextResponse.json(
        { error: "이 예약을 승인할 권한이 없습니다" },
        { status: 403 }
      );
    }

    // Check if booking is in pending status
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "대기 중인 예약만 승인할 수 있습니다" },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        propertyId: booking.propertyId,
        status: "CONFIRMED",
        id: { not: booking.id },
        OR: [
          {
            checkIn: { lt: booking.checkOut },
            checkOut: { gt: booking.checkIn },
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: "해당 날짜에 이미 확정된 예약이 있습니다" },
        { status: 400 }
      );
    }

    // Update booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CONFIRMED",
      },
      include: {
        property: true,
        user: true,
      },
    });

    // TODO: Send email notification to guest
    console.log(
      `Booking ${id} approved. Send confirmation email to ${booking.user.email}`
    );

    return NextResponse.json({
      booking: updatedBooking,
      message: "예약이 승인되었습니다",
    });
  } catch (error) {
    console.error("Failed to approve booking:", error);
    return NextResponse.json(
      { error: "예약 승인에 실패했습니다" },
      { status: 500 }
    );
  }
}
