import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/host/bookings/[id]/reject - Reject booking
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
    const body = await request.json();
    const { reason } = body;

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
        payment: true,
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
        { error: "이 예약을 거부할 권한이 없습니다" },
        { status: 403 }
      );
    }

    // Check if booking is in pending status
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "대기 중인 예약만 거부할 수 있습니다" },
        { status: 400 }
      );
    }

    // Update booking status to REJECTED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
      include: {
        property: true,
        user: true,
        bookingItems: {
          include: {
            experience: true,
          },
        },
      },
    });

    // TODO: Process refund if payment was made
    if (booking.payment && booking.payment.status === "COMPLETED") {
      console.log(
        `Process refund for booking ${id}, payment ${booking.payment.id}`
      );
      // Implement Toss Payments refund API call here
    }

    // TODO: Send email notification to guest with rejection reason
    console.log(
      `Booking ${id} rejected. Send notification email to ${booking.user.email}`
    );
    console.log(`Rejection reason: ${reason || "No reason provided"}`);

    return NextResponse.json({
      booking: updatedBooking,
      message: "예약이 거부되었습니다",
    });
  } catch (error) {
    console.error("Failed to reject booking:", error);
    return NextResponse.json(
      { error: "예약 거부에 실패했습니다" },
      { status: 500 }
    );
  }
}
