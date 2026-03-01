class Review < ApplicationRecord
  belongs_to :user
  belongs_to :property

  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :comment, presence: true, length: { minimum: 10, maximum: 500 }
  validates :host_reply, length: { maximum: 300 }, allow_nil: true
  validates :user_id, uniqueness: { scope: :property_id, message: "이미 이 숙소에 리뷰를 작성하셨습니다" }

  scope :recent, -> { order(created_at: :desc) }
end
