class Product < ApplicationRecord
  belongs_to :category
  has_many :cart_products, dependent: :destroy
  has_many :carts, through: :cart_products
  has_one_attached :imagen

  validates :nombre_producto, presence: true
  validates :precio_producto, numericality: { greater_than: 0 }
end
