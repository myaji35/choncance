import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/host/experiences/[id]
 * Update an experience
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user owns this experience
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

    const existingExperience = await prisma.experience.findUnique({
      where: { id },
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: "체험을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (existingExperience.hostId !== user.hostProfile.id) {
      return NextResponse.json(
        { error: "이 체험을 수정할 권한이 없습니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, duration, maxParticipants, images } = body;

    // Update experience
    const experience = await prisma.experience.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price }),
        ...(duration !== undefined && { duration: duration || null }),
        ...(maxParticipants !== undefined && { maxParticipants: maxParticipants || null }),
        ...(images && { images }),
      },
    });

    return NextResponse.json({ experience });
  } catch (error) {
    console.error("Failed to update experience:", error);
    return NextResponse.json(
      { error: "체험 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/host/experiences/[id]
 * Delete an experience
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user owns this experience
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

    const existingExperience = await prisma.experience.findUnique({
      where: { id },
      include: {
        bookingItems: {
          include: {
            booking: true,
          },
        },
      },
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: "체험을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (existingExperience.hostId !== user.hostProfile.id) {
      return NextResponse.json(
        { error: "이 체험을 삭제할 권한이 없습니다" },
        { status: 403 }
      );
    }

    // Check for active bookings
    const activeBookings = existingExperience.bookingItems.filter(item =>
      ["PENDING", "CONFIRMED"].includes(item.booking.status)
    );

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { error: "진행 중인 예약이 있는 체험은 삭제할 수 없습니다" },
        { status: 400 }
      );
    }

    // Delete experience
    await prisma.experience.delete({
      where: { id },
    });

    return NextResponse.json({ message: "체험이 삭제되었습니다" });
  } catch (error) {
    console.error("Failed to delete experience:", error);
    return NextResponse.json(
      { error: "체험 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
