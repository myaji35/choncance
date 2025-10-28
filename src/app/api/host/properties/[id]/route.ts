import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/host/properties/[id] - Update property
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

    // Check if property belongs to this host
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "숙소를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (existingProperty.hostId !== user.hostProfile.id) {
      return NextResponse.json(
        { error: "이 숙소를 수정할 권한이 없습니다" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      address,
      province,
      city,
      pricePerNight,
      maxGuests,
      allowsPets,
      amenities,
      checkInTime,
      checkOutTime,
      minNights,
      maxNights,
      hostStory,
      rules,
      images,
      thumbnailUrl,
      tags,
    } = body;

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(address && { address }),
        ...(province !== undefined && { province: province || null }),
        ...(city !== undefined && { city: city || null }),
        ...(pricePerNight && { pricePerNight }),
        ...(maxGuests && { maxGuests }),
        ...(allowsPets !== undefined && { allowsPets }),
        ...(amenities && { amenities }),
        ...(checkInTime && { checkInTime }),
        ...(checkOutTime && { checkOutTime }),
        ...(minNights && { minNights }),
        ...(maxNights && { maxNights }),
        ...(hostStory !== undefined && { hostStory: hostStory || null }),
        ...(rules !== undefined && { rules: rules || null }),
        ...(images && { images }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(tags && {
          tags: {
            set: [], // Clear existing tags
            connect: tags.map((tagName: string) => ({ name: tagName })),
          },
        }),
        // Reset status to PENDING if major changes
        status: "PENDING",
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Failed to update property:", error);
    return NextResponse.json(
      { error: "숙소 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

// DELETE /api/host/properties/[id] - Delete property
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

    // Check if property belongs to this host
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        },
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "숙소를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (existingProperty.hostId !== user.hostProfile.id) {
      return NextResponse.json(
        { error: "이 숙소를 삭제할 권한이 없습니다" },
        { status: 403 }
      );
    }

    // Check for active bookings
    if (existingProperty.bookings.length > 0) {
      return NextResponse.json(
        { error: "진행 중인 예약이 있는 숙소는 삭제할 수 없습니다" },
        { status: 400 }
      );
    }

    // Delete property (cascade will delete related records)
    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ message: "숙소가 삭제되었습니다" });
  } catch (error) {
    console.error("Failed to delete property:", error);
    return NextResponse.json(
      { error: "숙소 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
