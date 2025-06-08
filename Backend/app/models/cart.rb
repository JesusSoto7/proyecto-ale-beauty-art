class Cart < ApplicationRecord
  belongs_to :user, optional: true
  has_many :cart_products, dependent: :destroy
  has_many :products, through: :cart_products

  def agregar_producto(product_id, cantidad)
    item = cart_products.find_by(product_id: product_id)
  
    if item
      nueva_cantidad = item.cantidad + cantidad
  
      if nueva_cantidad <= 0
        item.destroy
      else
        # Limitar al stock del producto
        stock_maximo = item.product.stock
        item.update(cantidad: [nueva_cantidad, stock_maximo].min)
      end
    else
      producto = Product.find(product_id)
      cantidad_inicial = [cantidad, producto.stock].min
  
      # Solo agrega si hay stock y cantidad positiva
      if cantidad_inicial > 0
        cart_products.create(product: producto, cantidad: cantidad_inicial)
      end
    end
  end
end
