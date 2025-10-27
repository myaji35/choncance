import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/host/properties - Create new property
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

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

    const body = await request.json();

    const {
      name,
      description,
      address,
      province,
      city,
      pricePerNight,
      maxGuests,
      allowsPets = false,
      amenities = [],
      checkInTime = "15:00",
      checkOutTime = "11:00",
      minNights = 1,
      maxNights = 30,
      hostStory,
      rules,
      images = [],
      thumbnailUrl,
      tags = [],
    } = body;

    // Validate required fields
    if (!name || !description || !address || !pricePerNight) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요" },
        { status: 400 }
      );
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        hostId: user.hostProfile.id,
        name,
        description,
        address,
        province: province || null,
        city: city || null,
        location: { lat: 0, lng: 0 }, // TODO: Implement geocoding
        pricePerNight,
        maxGuests,
        allowsPets,
        images,
        thumbnailUrl: thumbnailUrl || images[0] || null,
        hostStory: hostStory || null,
        amenities,
        rules: rules || null,
        checkInTime,
        checkOutTime,
        minNights,
        maxNights,
        status: "PENDING", // Will be reviewed by admin
        tags: {
          connect: tags.map((tagName: string) => ({
            name: tagName,
          })),
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Failed to create property:", error);
    return NextResponse.json(
      { error: "숙소 등록에 실패했습니다" },
      { status: 500 }
    );
  }
}

// GET /api/host/properties - Get host's properties
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // Get user and host profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hostProfile: {
          include: {
            properties: {
              include: {
                tags: true,
                _count: {
                  select: {
                    bookings: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user?.hostProfile) {
      return NextResponse.json(
        { error: "호스트 프로필이 필요합니다" },
        { status: 403 }
      );
    }

    return NextResponse.json({ properties: user.hostProfile.properties });
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return NextResponse.json(
      { error: "숙소 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
