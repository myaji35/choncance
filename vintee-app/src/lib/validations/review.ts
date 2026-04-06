import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "예약 ID가 필요합니다"),
  rating: z
    .number()
    .int()
    .min(1, "별점을 선택해주세요")
    .max(5, "별점은 최대 5점입니다"),
  content: z
    .string()
    .min(10, "최소 10자 이상 입력해주세요")
    .max(500, "최대 500자까지 입력 가능합니다"),
  snsShareConsent: z.boolean().default(false),
});

export const hostReplySchema = z.object({
  content: z
    .string()
    .min(10, "최소 10자 이상 입력해주세요")
    .max(300, "최대 300자까지 입력 가능합니다"),
});

export type CreateReviewInput = z.input<typeof createReviewSchema>;
export type HostReplyInput = z.infer<typeof hostReplySchema>;
