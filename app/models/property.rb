class Property < ApplicationRecord
  has_and_belongs_to_many :tags

  enum :status, { draft: 0, active: 1, archived: 2 }

  scope :auto_collected, -> { where(source: "uploaded") }
  scope :manual, -> { where(source: "manual") }
  scope :pending_review, -> { draft.where(source: "uploaded") }

  validates :title, presence: true
  validates :price_per_night, presence: true, numericality: { greater_than: 0 }, unless: :auto_collected?

  def auto_collected?
    source == "uploaded"
  end
end
