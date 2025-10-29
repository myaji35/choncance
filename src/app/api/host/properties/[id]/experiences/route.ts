import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/host/properties/[id]/experiences
 * Get all experiences for a property
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { id: propertyId } = await params;

    // Check if user owns this property
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

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        experiences: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "숙소를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (property.hostId !== user.hostProfile.id) {
      return NextResponse.json(
        { error: "이 숙소에 접근할 권한이 없습니다" },
        { status: 403 }
      );
    }

    return NextResponse.json({ experiences: property.experiences });
  } catch (error) {
    console.error("Failed to fetch experiences:", error);
    return NextResponse.json(
      { error: "체험 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/host/properties/[id]/experiences
 * Add an experience to a property
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { id: propertyId } = await params;

    // Check if user owns this property
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

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "숙소를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (property.hostId !== user.hostProfile.id) {
      return NextResponse.json(
        { error: "이 숙소에 접근할 권한이 없습니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, duration, maxParticipants, images } = body;

    // Validate required fields
    if (!name || !description || !price) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요" },
        { status: 400 }
      );
    }

    // Create experience
    const experience = await prisma.experience.create({
      data: {
        propertyId,
        hostId: user.hostProfile.id,
        name,
        description,
        price,
        duration: duration || null,
        maxParticipants: maxParticipants || null,
        images: images || [],
      },
    });

    return NextResponse.json({ experience }, { status: 201 });
  } catch (error) {
    console.error("Failed to create experience:", error);
    return NextResponse.json(
      { error: "체험 등록에 실패했습니다" },
      { status: 500 }
    );
  }
}
