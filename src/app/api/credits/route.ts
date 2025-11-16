import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/credits
 * Get user's credit balance and history
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUser();
    const userId = authUser?.profile?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Get user's credit balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        totalEarned: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get credit history
    const [history, total] = await Promise.all([
      prisma.creditHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.creditHistory.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      balance: {
        available: user.credits,
        totalEarned: user.totalEarned,
        totalUsed: user.totalEarned - user.credits,
      },
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get credits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
