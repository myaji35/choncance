class BookingsController < ApplicationController
  before_action :require_authentication
  before_action :set_booking, only: [:show, :cancel]

  def index
    @bookings = Current.user.bookings.includes(:property).order(created_at: :desc)
    @upcoming = @bookings.select { |b| b.status == "confirmed" && b.check_in >= Date.today }
    @past = @bookings.select { |b| b.check_out < Date.today || b.status != "confirmed" }
  end

  def show; end

  def cancel
    unless @booking.cancellable?
      redirect_to booking_path(@booking), alert: "취소할 수 없는 예약입니다."
      return
    end

    refund_amount = @booking.cancellation_refund_amount
    @booking.update!(
      status: "cancelled_by_guest",
      cancel_reason: params[:cancel_reason].presence || "게스트 요청에 의한 취소"
    )

    redirect_to bookings_path,
      notice: "예약이 취소되었습니다. 환불 금액: #{helpers.number_with_delimiter(refund_amount)}원"
  end

  private

  def set_booking
    @booking = Current.user.bookings.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to bookings_path, alert: "접근 권한이 없습니다."
  end
end
