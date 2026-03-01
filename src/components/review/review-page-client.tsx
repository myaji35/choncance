"use client";

import { useRouter } from "next/navigation";
import { ReviewForm } from "./review-form";

interface ReviewPageClientProps {
  bookingId: string;
  propertyId: string;
  propertyName: string;
  redirectUrl: string;
}

export function ReviewPageClient({
  bookingId,
  propertyId,
  propertyName,
  redirectUrl,
}: ReviewPageClientProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(redirectUrl);
    router.refresh();
  };

  return (
    <ReviewForm
      bookingId={bookingId}
      propertyId={propertyId}
      propertyName={propertyName}
      onSuccess={handleSuccess}
    />
  );
}
