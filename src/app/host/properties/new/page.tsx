import { getUser } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";
import { PropertyRegistrationForm } from "@/components/host/property-registration-form";
import { getTagsGroupedByCategory } from "@/lib/api/tags";

export default async function NewPropertyPage() {
  const user = await getUser();
  const userId = user?.profile?.id;

  if (!userId || !user) {
    redirect("/login");
  }

  // Fetch tags for the form
  const tagsGrouped = await getTagsGroupedByCategory();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 숙소 등록</h1>
        <p className="text-gray-600 mt-2">
          촌캉스에 숙소를 등록하고 게스트를 맞이하세요
        </p>
      </div>

      <PropertyRegistrationForm tags={tagsGrouped} />
    </div>
  );
}
