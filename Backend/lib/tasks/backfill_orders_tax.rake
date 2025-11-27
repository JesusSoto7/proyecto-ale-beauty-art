namespace :orders do
  desc "Backfill subtotal_sin_iva, iva_total and total_con_iva for existing orders and order_details"
  task backfill_tax: :environment do
    puts "Starting backfill of orders tax fields..."
    Order.find_each do |order|
      ActiveRecord::Base.transaction do
        order.order_details.each do |od|
          unit = od.precio_unitario.to_f
          qty = od.cantidad.to_i
          iva_per_unit = if od.product.respond_to?(:iva_amount)
                           od.product.iva_amount(unit).to_f
                         else
                           (unit * 0.19)
                         end

          od.precio_unitario_sin_iva = unit
          od.iva_por_unidad = iva_per_unit
          od.precio_unitario_con_iva = (unit + iva_per_unit)
          od.subtotal = (qty * unit)
          od.total_line_con_iva = (qty * od.precio_unitario_con_iva.to_f)
          od.save!(validate: false)
        end

        subtotal = order.order_details.to_a.sum { |d| d.subtotal.to_f }
        iva = order.order_details.to_a.sum { |d| d.iva_por_unidad.to_f * d.cantidad.to_i }
        envio = order.costo_de_envio.to_f
        order.subtotal_sin_iva = subtotal
        order.iva_total = iva
        order.total_con_iva = (subtotal + iva + envio).to_f
        order.save!(validate: false)
      end
    end
    puts "Backfill completed."
  end
end
