class Api::V1::OrdersController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  def show
    order = current_user.orders.includes(order_details: :product).find(params[:id])

    render json: {
      id: order.id,
      numero_de_orden: order.numero_de_orden,
      status: order.status,
      pago_total: order.pago_total,
      fecha_pago: order.fecha_pago,
      direccion_envio: order.direccion_envio,
      tarjeta_tipo: order.tarjeta_tipo,
      tarjeta_ultimos4: order.tarjeta_ultimos4,
      envio: 10000,
      productos: order.order_details.map do |od|
        product = od.product
        precio_original = product.precio_producto
        precio_con_descuento = od.precio_unitario 
        
        {
          id: od.id,
          product_id: product.id,
          nombre_producto: product.nombre_producto,
          slug: product.slug,
          cantidad: od.cantidad,
          precio_producto: precio_original.to_f,
          precio_descuento: precio_con_descuento.to_f,
          precio_unitario: precio_con_descuento.to_f,
          imagen_url: product.imagen.attached? ? url_for(product.imagen) : nil,
          # 🆕 Información adicional del descuento
          tiene_descuento: precio_con_descuento < precio_original,
          porcentaje_descuento: precio_con_descuento < precio_original ? 
            (((precio_original - precio_con_descuento) / precio_original) * 100).round : 0,
          descuento: product.mejor_descuento_para_precio(precio_original)&.as_json(
            only: [:id, :nombre, :tipo, :valor, :fecha_inicio, :fecha_fin]
          )
        }
      end
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Orden no encontrada" }, status: :not_found
  end

  def index
    orders = Order.includes(:user).order(created_at: :desc)
    render json: orders.map { |o|
      {
        id: o.id,
        numero_de_orden: o.numero_de_orden,
        status: o.status,
        pago_total: o.pago_total,
        fecha_pago: o.fecha_pago,
        clientes: o.user ? "#{o.user.nombre} #{o.user.apellido}" : "N/A",
        email: o.user&.email || "N/A",
        pdf_url: o.invoice_pdf.attached? ? rails_blob_url(o.invoice_pdf) : nil
      }
    }
  end

  def ordenes
    orders = current_user.orders
                       .where(status: :pagada)
                       .order(created_at: :desc)

    render json: orders.map { |o|
      {
        id: o.id,
        numero_de_orden: o.numero_de_orden,
        status: o.status,
        pago_total: o.pago_total,
        fecha_pago: o.fecha_pago,
        clientes: o.user ? "#{o.user.nombre} #{o.user.apellido}" : "N/A",
        email: o.user&.email || "N/A",
        pdf_url: o.invoice_pdf.attached? ? rails_blob_url(o.invoice_pdf) : nil
      }
    }
  end

  def create
    correo_cliente = current_user.email
    shipping_address = current_user.shipping_addresses.find_by(predeterminada: true)

    order = current_user.orders.build(
      correo_cliente: correo_cliente,
      status: :pendiente,
      pago_total: 0,
      shipping_address: shipping_address
    )

    if order.save
      if params[:order] && params[:order][:products]
        params[:order][:products].each do |product_params|
          product = Product.find(product_params[:product_id])
          cantidad = (product_params[:quantity] || product_params[:cantidad]).to_i
          # 🔥 Usar el método del modelo para obtener precio con descuento
          precio_final = product.precio_con_mejor_descuento
          
          order.order_details.create!(
            product: product,
            cantidad: cantidad,
            precio_unitario: precio_final
          )
        end
      else
        current_cart.cart_products.includes(:product).each do |item|
          # 🔥 Usar el método del modelo para obtener precio con descuento
          precio_final = item.product.precio_con_mejor_descuento
          
          order.order_details.create!(
            product: item.product,
            cantidad: item.cantidad,
            precio_unitario: precio_final
          )
        end
      end

      total = order.order_details.sum("cantidad * precio_unitario")
      order.update!(pago_total: total + 10_000)

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
  
  def status
    order = current_user.orders.find(params[:id])
    render json: {
      order_id: order.id,
      status: order.status
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Orden no encontrada" }, status: :not_found
  end

  def by_payment
    Rails.logger.info ">>> Buscando orden con payment_id: #{params[:payment_id].inspect}"
    order = Order.includes(order_details: :product).find_by(payment_id: params[:payment_id].to_s)
    Rails.logger.info ">>> Orden encontrada: #{order.inspect}"
    
    if order
      render json: {
        order: {
          id: order.id,
          numero_de_orden: order.numero_de_orden,
          status: order.status,
          pago_total: order.pago_total,
          fecha_pago: order.fecha_pago,
          direccion_envio: order.direccion_envio,
          tarjeta_tipo: order.card_type,
          tarjeta_ultimos4: order.card_last4,
          productos: order.order_details.map do |od|
            product = od.product
            {
              id: od.id,
              product_id: product.id,
              nombre_producto: product.nombre_producto,
              precio_producto: product.precio_producto.to_f,
              precio_descuento: od.precio_unitario.to_f, 
              cantidad: od.cantidad,
              slug: product.slug,
              imagen_url: product.imagen.attached? ? url_for(product.imagen) : nil
            }
          end
        }
      }
    else
      render json: { error: 'Order not found' }, status: :not_found
    end
  end

  private

  def calcular_monto_actual
    current_cart.cart_products.includes(:product).sum do |item|
      item.product.precio_con_mejor_descuento * item.cantidad
    end
  end
end