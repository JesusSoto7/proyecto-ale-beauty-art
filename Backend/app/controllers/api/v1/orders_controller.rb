class Api::V1::OrdersController < Api::V1::BaseController

  def create
    correo_cliente = current_user.email
    shipping_address = current_user.shipping_addresses.find_by(predeterminada: true)

    order = current_user.orders.build(
      correo_cliente: correo_cliente,
      status: :pendiente,
      pago_total: calcular_monto_actual.to_f,
      shipping_address: shipping_address
    )

    if order.save
      # copiar productos del carrito a la orden
      current_cart.cart_products.includes(:product).each do |item|
        order.order_details.create!(
          product: item.product,
          cantidad: item.cantidad,
          precio_unitario: item.product.precio_producto
        )
      end

      render json: {
        message: "Orden creada correctamente",
        order: order.as_json(include: { order_details: { include: :product } })
      }, status: :created
    else
      render json: {
        error: "Hubo un error al procesar la orden",
        details: order.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def count_completed
    completed_orders = Order.where(status: :pagada).count
    render json: { count: completed_orders }
  end

  def orders_completed_per_day
    data = Order.where(status: :pagada)
                    .group("DATE(created_at)")
                    .order("DATE(created_at)")
                    .count
    render json: data
  end

  def total_sales
    total = Order.where(status: :pagada).sum(:pago_total)
    render json: { total_sales: total}
  end

  def total_sales_per_day
    data = Order.where(status: :pagada)
                .group("DATE(created_at)")
                .order("DATE(created_at)")
                .sum(:pago_total)

    render json: data
  end
  
    def total_sales_by_category
      categories = Category
                  .left_joins(products: { order_details: :order })
                  .where(orders: { status: :pagada })
                  .group("categories.id")
                  .select(
                    "categories.id,
                      categories.nombre_categoria,
                      COALESCE(SUM(order_details.cantidad * order_details.precio_unitario), 0) AS total_sales"
                  )

      data = categories.map do |cat|
        {
          id: cat.id,
          name: cat.nombre_categoria,
          total_sales: cat.total_sales.to_f,
          imagen_url: cat.imagen.attached? ? url_for(cat.imagen) : nil
        }
    end

    render json: data
  end




  private

  def calcular_monto_actual
    current_cart.cart_products.includes(:product).sum do |item|
      item.product.precio_producto * item.cantidad
    end
  end

 
end
