import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyEditForm } from "@/components/host/property-edit-form";
import { getTagsGroupedByCategory } from "@/lib/api/tags";

interface EditPropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  // Get user and host profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { hostProfile: true },
  });

  if (!user?.hostProfile) {
    redirect("/host/dashboard");
  }

  // Get property
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  });

  if (!property) {
    notFound();
  }

  // Check ownership
  if (property.hostId !== user.hostProfile.id) {
    redirect("/host/dashboard");
  }

  // Fetch tags for the form
  const tagsGrouped = await getTagsGroupedByCategory();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">숙소 수정</h1>
        <p className="text-gray-600 mt-2">
          숙소 정보를 수정하세요
        </p>
      </div>

      <PropertyEditForm property={property} tags={tagsGrouped} />
    </div>
  );
}
