import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: params,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Specific notification creators

export async function notifyBookingConfirmed(
  userId: string,
  bookingId: string,
  propertyName: string
) {
  return createNotification({
    userId,
    type: "BOOKING_CONFIRMED",
    title: "예약이 확정되었습니다",
    message: `${propertyName}의 예약이 호스트에 의해 확정되었습니다.`,
    link: `/bookings/${bookingId}`,
  });
}

export async function notifyBookingRejected(
  userId: string,
  bookingId: string,
  propertyName: string
) {
  return createNotification({
    userId,
    type: "BOOKING_REJECTED",
    title: "예약이 거절되었습니다",
    message: `${propertyName}의 예약이 거절되었습니다.`,
    link: `/bookings/${bookingId}`,
  });
}

export async function notifyBookingCancelled(
  userId: string,
  bookingId: string,
  propertyName: string
) {
  return createNotification({
    userId,
    type: "BOOKING_CANCELLED",
    title: "예약이 취소되었습니다",
    message: `${propertyName}의 예약이 취소되었습니다.`,
    link: `/bookings/${bookingId}`,
  });
}

export async function notifyReviewReceived(
  userId: string,
  propertyId: string,
  propertyName: string,
  rating: number
) {
  return createNotification({
    userId,
    type: "REVIEW_RECEIVED",
    title: "새로운 리뷰가 작성되었습니다",
    message: `${propertyName}에 ${rating}점 리뷰가 작성되었습니다.`,
    link: `/property/${propertyId}`,
  });
}

export async function notifyHostReply(
  userId: string,
  propertyId: string,
  propertyName: string
) {
  return createNotification({
    userId,
    type: "HOST_REPLY",
    title: "호스트가 답변했습니다",
    message: `${propertyName}의 호스트가 리뷰에 답변했습니다.`,
    link: `/property/${propertyId}`,
  });
}

export async function notifyPaymentSuccess(
  userId: string,
  bookingId: string,
  amount: number
) {
  return createNotification({
    userId,
    type: "PAYMENT_SUCCESS",
    title: "결제가 완료되었습니다",
    message: `₩${amount.toLocaleString()}이 결제되었습니다.`,
    link: `/bookings/${bookingId}`,
  });
}

export async function notifyPaymentFailed(
  userId: string,
  bookingId: string,
  reason?: string
) {
  return createNotification({
    userId,
    type: "PAYMENT_FAILED",
    title: "결제가 실패했습니다",
    message: reason || "결제 중 문제가 발생했습니다.",
    link: `/bookings/${bookingId}`,
  });
}
