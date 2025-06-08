class Cart < ApplicationRecord
  belongs_to :user, optional: true
  has_many :cart_products, dependent: :destroy
  has_many :products, through: :cart_products

  def agregar_producto(producto_id, cantidad = 1)
    cart_product = cart_products.find_or_initialize_by(product_id: producto_id)
    cart_product.cantidad ||= 0
    cart_product.cantidad += cantidad
    cart_product.save!
    cart_product
  end
end
