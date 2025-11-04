import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  notifyPropertyApproved,
  notifyPropertyRejected,
} from "@/lib/notifications";

// PATCH /api/admin/properties/[id]/status - Update property status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // Get user and check if admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, rejectionReason } = body;

    // Validate status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "INACTIVE"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태입니다" },
        { status: 400 }
      );
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        host: {
          include: {
            user: true,
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

    // Update property status
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        status,
      },
      include: {
        tags: true,
      },
    });

    // Send notification to host
    try {
      if (status === "APPROVED") {
        await notifyPropertyApproved(
          property.host.userId,
          property.id,
          property.name
        );
      } else if (status === "REJECTED") {
        await notifyPropertyRejected(
          property.host.userId,
          property.id,
          property.name,
          rejectionReason
        );
      }
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
      // Continue even if notification fails
    }

    return NextResponse.json({
      property: updatedProperty,
      message:
        status === "APPROVED"
          ? "숙소가 승인되었습니다"
          : status === "REJECTED"
          ? "숙소가 거절되었습니다"
          : "숙소 상태가 변경되었습니다",
    });
  } catch (error) {
    console.error("Failed to update property status:", error);
    return NextResponse.json(
      { error: "상태 변경에 실패했습니다" },
      { status: 500 }
    );
  }
}
