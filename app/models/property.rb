class Property < ApplicationRecord
  has_and_belongs_to_many :tags
  
  enum :status, { draft: 0, active: 1, archived: 2 }
  
  validates :title, presence: true
  validates :price_per_night, presence: true, numericality: { greater_than: 0 }
end
