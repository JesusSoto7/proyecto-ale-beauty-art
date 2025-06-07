class CartProduct < ApplicationRecord
  belongs_to :cart
  belongs_to :product

  validates :cantidad, numericality: { greater_than: 0 }
end
