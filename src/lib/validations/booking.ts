import { z } from "zod";

/**
 * 예약 취소 요청 스키마
 */
export const cancelBookingSchema = z.object({
  cancelReason: z
    .string()
    .min(1, "취소 사유를 입력해주세요.")
    .max(500, "취소 사유는 최대 500자까지 입력할 수 있습니다."),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
