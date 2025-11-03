module Api
  module V1
    module Admin
      class OrdersController < Admin::BaseController
        include Rails.application.routes.url_helpers
        before_action :set_order, only: [:show, :update_status]

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
                only: [:id, :product_id, :cantidad, :precio_unitario, :subtotal]
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

        private

        def set_order
          @order = Order.find(params[:id])
        end
      end
    end
  end
end