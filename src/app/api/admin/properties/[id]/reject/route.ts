import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notifyPropertyRejected } from "@/lib/notifications";

/**
 * POST /api/admin/properties/:id/reject
 * Reject a pending property listing
 * - Updates Property.status to REJECTED
 * - Sends notification to host with reason
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getUser();

    if (!authUser || !authUser.profile) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const userId = authUser.profile.id;

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (dbUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "거절 사유를 10자 이상 입력해주세요" },
        { status: 400 }
      );
    }

    // Find the property
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "숙소를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (property.status === "REJECTED") {
      return NextResponse.json(
        { error: "이미 거절된 숙소입니다" },
        { status: 400 }
      );
    }

    // Update property status
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { status: "REJECTED" },
      include: { tags: true },
    });

    // Send notification to host
    try {
      await notifyPropertyRejected(
        property.host.userId,
        property.id,
        property.name,
        reason.trim()
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json({
      message: "숙소가 거절되었습니다",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Property rejection error:", error);
    return NextResponse.json(
      { error: "숙소 거절에 실패했습니다" },
      { status: 500 }
    );
  }
}
