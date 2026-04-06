/** 이름 마스킹: "홍길동" → "홍*동", "김철" → "김*" */
export function maskName(name: string): string {
  if (!name || name.length < 2) return name;
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*" + name[name.length - 1];
}

/** 평균 별점 포맷: 4.333 → "4.3" */
export function formatRating(avg: number | null): string {
  if (!avg) return "0.0";
  return avg.toFixed(1);
}

/** 리뷰 작성 가능 여부 확인 */
export function canWriteReview(booking: {
  status: string;
  checkOut: Date | string;
  review: unknown | null;
}): boolean {
  return (
    booking.status === "COMPLETED" &&
    new Date(booking.checkOut) < new Date() &&
    booking.review === null
  );
}
