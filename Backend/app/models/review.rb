class Review < ApplicationRecord
  belongs_to :user
  belongs_to :product

  validates :rating, inclusion: { in: 1..5 }
  validates :comentario, length: { maximum: 500 }
end
