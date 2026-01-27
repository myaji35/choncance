import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/hosts
 * Get all host profiles (for admin review)
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUser();

    if (!authUser || !authUser.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.profile.id;

    // Check if user is admin (you can add admin check logic here)
    // For now, allowing all authenticated users

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const hostProfiles = await prisma.hostProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        properties: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ hostProfiles });
  } catch (error) {
    console.error("Get host profiles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
