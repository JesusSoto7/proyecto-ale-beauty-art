class Cart < ApplicationRecord
  belongs_to :user, optional: true
  has_many :cart_products, dependent: :destroy
  has_many :products, through: :cart_products

  def agregar_producto(product_id, cantidad)
    item = cart_products.find_or_initialize_by(product_id: product_id)
    nueva_cantidad = item.cantidad + cantidad

    if nueva_cantidad > item.product.stock
      nueva_cantidad = item.product.stock # Limitar al máximo permitido
    end

    if nueva_cantidad > 0
      item.update(cantidad: nueva_cantidad)
    else
      item.destroy
    end
  end
end
