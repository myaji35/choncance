import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface BookingPageProps {
  params: {
    id: string;
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  // Fetch property from database
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      host: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
  });

  if (!property || property.status !== "APPROVED") {
    notFound();
  }

  // Redirect to checkout page for booking
  redirect(`/booking/checkout?propertyId=${property.id}`);
}
