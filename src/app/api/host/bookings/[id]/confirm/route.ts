import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notifyBookingConfirmed } from "@/lib/notifications";
import { sendBookingConfirmedAlimtalk } from "@/lib/kakao-alimtalk";
import { format } from "date-fns";

/**
 * PATCH /api/host/bookings/:id/confirm
 * Confirm a booking
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a host
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId },
    });

    if (!hostProfile) {
      return NextResponse.json(
        { error: "Not a host" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Find booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            host: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if host owns this property
    if (booking.property.host.userId !== userId) {
      return NextResponse.json(
        { error: "You don't own this property" },
        { status: 403 }
      );
    }

    // Check if booking can be confirmed
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending bookings can be confirmed" },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
      include: {
        property: true,
        payment: true,
      },
    });

    // Get user info for alimtalk
    const user = await prisma.user.findUnique({
      where: { id: booking.userId },
      select: { name: true, phone: true },
    });

    // Send in-app notification to guest
    try {
      await notifyBookingConfirmed(
        booking.userId,
        booking.id,
        booking.property.name
      );
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Don't fail the request if notification fails
    }

    // Send AlimTalk (KakaoTalk) message to guest
    if (user?.phone) {
      try {
        await sendBookingConfirmedAlimtalk(user.phone, {
          guestName: user.name || "고객",
          propertyName: booking.property.name,
          checkIn: format(booking.checkIn, "yyyy년 M월 d일"),
          checkOut: format(booking.checkOut, "yyyy년 M월 d일"),
          guests: booking.guests,
          totalAmount: Number(booking.totalAmount),
          bookingId: booking.id,
        });
      } catch (error) {
        console.error("Failed to send AlimTalk:", error);
        // Don't fail the request if AlimTalk fails
      }
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error("Confirm booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
