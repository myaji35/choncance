import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { businessNumber, contact } = await req.json();

  if (!businessNumber || !contact) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "HOST_PENDING" },
    });

    await prisma.hostProfile.create({
      data: {
        userId,
        businessNumber,
        contact,
      },
    });

    return NextResponse.json({ message: "Host request submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Host request error:", error);
    return NextResponse.json({ error: "Failed to submit host request" }, { status: 500 });
  }
}
