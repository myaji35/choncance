export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import HostBookingsClient from "./HostBookingsClient";

export default async function HostBookingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOST") redirect("/");

  const bookings = await prisma.booking.findMany({
    where: { property: { hostId: user.id } },
    include: {
      user: { select: { name: true, email: true } },
      property: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = bookings.map((b) => ({
    id: b.id,
    status: b.status,
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
    guestCount: b.guestCount,
    totalPrice: b.totalPrice,
    message: b.message,
    guestName: b.user.name,
    guestEmail: b.user.email,
    propertyTitle: b.property.title,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-bold text-[#16325C]">예약 관리</h1>
      <HostBookingsClient bookings={data} />
    </div>
  );
}
