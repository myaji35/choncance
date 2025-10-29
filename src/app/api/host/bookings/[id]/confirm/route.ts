import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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

    // TODO: Send confirmation email to guest

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error("Confirm booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
