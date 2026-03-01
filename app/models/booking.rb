class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :property

  STATUSES = %w[confirmed cancelled_by_guest cancelled_by_host completed].freeze

  validates :check_in, presence: true
  validates :check_out, presence: true
  validates :total_price, presence: true, numericality: { greater_than: 0 }
  validates :guest_count, presence: true, numericality: { greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }
  validate :check_out_after_check_in, if: -> { check_in.present? && check_out.present? }

  scope :upcoming, -> { where(status: "confirmed").where("check_in >= ?", Date.today).order(check_in: :asc) }
  scope :past, -> { where("check_out < ?", Date.today).order(check_out: :desc) }
  scope :cancelled, -> { where(status: %w[cancelled_by_guest cancelled_by_host]) }

  def nights
    return 0 unless check_in && check_out
    (check_out - check_in).to_i
  end

  def cancellable?
    status == "confirmed" && check_in > Date.today
  end

  def cancellation_refund_amount
    days_until_checkin = (check_in - Date.today).to_i
    if days_until_checkin >= 7
      total_price
    elsif days_until_checkin >= 3
      (total_price * 0.5).to_i
    else
      0
    end
  end

  def cancellation_policy_label
    days = (check_in - Date.today).to_i
    if days >= 7
      "7일 이상 전 취소: 100% 환불"
    elsif days >= 3
      "3~6일 전 취소: 50% 환불"
    else
      "3일 미만: 환불 불가"
    end
  end

  def refund_percentage
    days = (check_in - Date.today).to_i
    if days >= 7 then 100
    elsif days >= 3 then 50
    else 0
    end
  end

  def status_label
    case status
    when "confirmed" then "예약 확정"
    when "cancelled_by_guest" then "게스트 취소"
    when "cancelled_by_host" then "호스트 취소"
    when "completed" then "이용 완료"
    else status
    end
  end

  private

  def check_out_after_check_in
    if check_out <= check_in
      errors.add(:check_out, "은 체크인 날짜 이후여야 합니다")
    end
  end
end
