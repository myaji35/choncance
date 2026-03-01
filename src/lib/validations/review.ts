import { z } from "zod";

/**
 * 리뷰 생성 요청 스키마
 */
export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "예약 ID는 필수입니다."),
  rating: z
    .number()
    .int()
    .min(1, "별점은 1점 이상이어야 합니다.")
    .max(5, "별점은 5점 이하여야 합니다."),
  content: z
    .string()
    .min(10, "리뷰는 최소 10자 이상 작성해주세요.")
    .max(500, "리뷰는 최대 500자까지 작성할 수 있습니다."),
  images: z.array(z.string().url()).max(5, "이미지는 최대 5장까지 첨부할 수 있습니다.").optional().default([]),
  snsShareConsent: z.boolean().optional().default(false),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * 호스트 답변 요청 스키마
 */
export const hostReplySchema = z.object({
  reply: z
    .string()
    .min(10, "답변은 최소 10자 이상 작성해주세요.")
    .max(300, "답변은 최대 300자까지 작성할 수 있습니다."),
});

export type HostReplyInput = z.infer<typeof hostReplySchema>;
