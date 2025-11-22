module Api
  module V1
    module Admin
      class OrdersController < Admin::BaseController
        include Rails.application.routes.url_helpers
        before_action :set_order, only: [:show, :update_status]

        before_action :set_date_range, only: [:sales_by_category, :products_sold_by_category, :sales_by_subcategory, :products_sold_by_subcategory]


        def index
          orders = Order
                     .includes(:user, invoice_pdf_attachment: :blob)
                     .order(created_at: :desc)
          orders = orders.where(status: params[:status]) if params[:status].present?

          if params[:query].present?
            q = "%#{params[:query]}%"
            orders = orders.where("numero_de_orden LIKE ? OR correo_cliente LIKE ?", q, q)
          end

          page = params[:page].to_i > 0 ? params[:page].to_i : 1
          per  = params[:per].to_i > 0 ? [params[:per].to_i, 100].min : 20
          total = orders.count
          orders = orders.offset((page - 1) * per).limit(per)

          data = orders.map do |o|
            {
              id: o.id,
              numero_de_orden: o.numero_de_orden,
              status: o.status,
              pago_total: o.pago_total,
              fecha_pago: o.fecha_pago,
              correo_cliente: o.correo_cliente,
              created_at: o.created_at,
              clientes: o.user ? "#{o.user.nombre} #{o.user.apellido}" : "N/A",
              email: o.user&.email || "N/A",
              pdf_url: o.invoice_pdf.attached? ? rails_blob_url(o.invoice_pdf) : nil
            }
          end

          render json: { data:, pagination: { page:, per:, total: } }
        end

        def show
          render json: @order.as_json(
            include: {
              order_details: {
                only: [:id, :product_id, :cantidad, :precio_unitario]
              }
            }
          )
        end

        def update_status
          permitted = %w[pendiente pagada preparando enviado entregado cancelada]
          new_status = params.require(:status)
          return render json: { error: 'Estado inválido' }, status: :bad_request unless permitted.include?(new_status)

          if @order.cancelada? && new_status != 'cancelada'
            return render json: { error: 'Transición no permitida desde cancelada' }, status: :unprocessable_entity
          end

          if new_status == 'enviado'
            if @order.respond_to?(:tracking_number) && params[:tracking_number].blank?
              return render json: { error: 'tracking_number requerido para enviado' }, status: :unprocessable_entity
            end
            @order.tracking_number = params[:tracking_number] if @order.respond_to?(:tracking_number)
            @order.carrier = params[:carrier] if @order.respond_to?(:carrier)
            if @order.respond_to?(:estimated_delivery) && params[:estimated_delivery].present?
              @order.estimated_delivery = params[:estimated_delivery]
            end
          end

          @order.status = new_status

          if @order.save
            render json: @order.as_json(only: [:id, :numero_de_orden, :status, :fecha_pago]), status: :ok
          else
            render json: { error: @order.errors.full_messages.join(', ') }, status: :unprocessable_entity
          end
        end

        def products_sold_by_category
          categories = Category
            .left_joins(products: { order_details: :order })
            .where(orders: { status: :pagada, created_at: @start_date..@end_date })
            .group("categories.id")
            .select("categories.id,
                     categories.nombre_categoria,
                     COALESCE(SUM(order_details.cantidad), 0) AS total_products")

          data = categories.map do |cat|
            {
              id: cat.id,
              name: cat.nombre_categoria,
              total_products: cat.total_products.to_i,
              imagen_url: cat.imagen.attached? ? url_for(cat.imagen) : nil
            }
          end

          render json: data
        end
        
        def sales_by_category
          categories = Category
            .left_joins(products: { order_details: :order })
            .where(orders: { status: :pagada, created_at: @start_date..@end_date })
            .group("categories.id")
            .select("categories.id,
                     categories.nombre_categoria,
                     COALESCE(SUM(order_details.cantidad * order_details.precio_unitario), 0) AS total_sales")

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


        def products_sold_by_subcategory
          subcategories = SubCategory
            .left_joins(products: { order_details: :order })
            .where(orders: { status: :pagada, created_at: @start_date..@end_date })
            .group('sub_categories.id')
            .select(
              'sub_categories.id AS id,
              MIN(sub_categories.nombre) AS nombre,
              COALESCE(SUM(order_details.cantidad), 0) AS total_products'
            )

          data = subcategories.map do |s|
            {
              id: s.id,
              name: s.try(:nombre),
              total_products: s.try(:total_products).to_i,
              imagen_url: s.respond_to?(:imagen) && s.imagen.attached? ? url_for(s.imagen) : nil
            }
          end

          render json: data
        end

        # Ventas (monto) por subcategoría
        def sales_by_subcategory
          subcategories = SubCategory
            .left_joins(products: { order_details: :order })
            .where(orders: { status: :pagada, created_at: @start_date..@end_date })
            .group('sub_categories.id')
            .select(
              'sub_categories.id AS id,
              MIN(sub_categories.nombre) AS nombre,
              COALESCE(SUM(order_details.cantidad * order_details.precio_unitario), 0) AS total_sales'
            )

          data = subcategories.map do |s|
            {
              id: s.id,
              name: s.try(:nombre),
              total_sales: s.try(:total_sales).to_f,
              imagen_url: s.respond_to?(:imagen) && s.imagen.attached? ? url_for(s.imagen) : nil
            }
          end

          render json: data
        end

        def sales_bounds
          min_paid_at = Order.where(status: :pagada).minimum(:created_at)
          last_paid_at = Order.where(status: :pagada).maximum(:created_at)

          render json: {
            min_date: min_paid_at&.beginning_of_day&.iso8601,
            last_paid_at: last_paid_at&.iso8601,
            max_date: Time.zone.now.end_of_day.iso8601
          }
        end

        private

        def set_order
          @order = Order.find(params[:id])
        end

        # Rango de fechas 
        def set_date_range
          if params[:start_date].present? && params[:end_date].present?
            begin
              @start_date = Time.zone.parse(params[:start_date]).beginning_of_day
              @end_date   = Time.zone.parse(params[:end_date]).end_of_day
            rescue ArgumentError, TypeError
              @start_date = 30.days.ago.beginning_of_day
              @end_date   = Time.zone.now.end_of_day
            end
          else
            @start_date = 30.days.ago.beginning_of_day
            @end_date   = Time.zone.now.end_of_day
          end
        end
      end
    end
  end
end