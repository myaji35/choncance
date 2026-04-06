"use client";

import { useRouter } from "next/navigation";
import ReviewForm from "@/components/review/ReviewForm";

export default function ReviewPageClient({
  bookingId,
}: {
  bookingId: string;
}) {
  const router = useRouter();

  return (
    <ReviewForm
      bookingId={bookingId}
      onSuccess={() => {
        router.push(`/bookings/${bookingId}`);
        router.refresh();
      }}
    />
  );
}
