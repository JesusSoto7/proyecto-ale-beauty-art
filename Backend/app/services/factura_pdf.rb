require 'prawn'
require 'prawn/table'
include ActionView::Helpers::NumberHelper

class FacturaPdf
  SHIPPING_COST = 10_000  # costo de envío fijo

  def initialize(order)
    @order = order
  end

  def render
    Prawn::Document.new do |pdf|
      pdf.text "Factura ##{@order.numero_de_orden}", size: 24, style: :bold, align: :center
      pdf.move_down 10

      pdf.stroke_horizontal_rule
      pdf.move_down 10
      pdf.text "Cliente: #{@order.correo_cliente}", size: 12
      pdf.text "Fecha: #{@order.created_at.in_time_zone('Bogota').strftime('%d/%m/%Y')}", size: 12
      pdf.text "Número de orden: #{@order.numero_de_orden}", size: 12
      pdf.move_down 10
      pdf.stroke_horizontal_rule
      pdf.move_down 20

      # Preferir campos persistidos en la orden y en los detalles. Si faltan, recalcular dinámicamente.
      subtotal_sin_iva = @order.subtotal_sin_iva.to_f
      iva_total = @order.iva_total.to_f

      data = [["Producto", "Cantidad", "Precio unitario (sin IVA)", "IVA por unidad", "Total línea (con IVA)"]]

      @order.order_details.each do |item|
        quantity = item.cantidad.to_i

        # Preferir valores persistidos por línea
        unit_price = (item.precio_unitario_sin_iva.present? ? item.precio_unitario_sin_iva.to_f : item.precio_unitario.to_f)
        iva_per_unit = (item.iva_por_unidad.present? ? item.iva_por_unidad.to_f : (
          if item.product && item.product.respond_to?(:iva_amount)
            item.product.iva_amount(unit_price).to_f
          else
            (unit_price * 0.19)
          end
        ))
        line_total = (item.total_line_con_iva.present? ? item.total_line_con_iva.to_f : ((unit_price + iva_per_unit) * quantity))

        # Si no tenemos subtotal/iva orden, acumulamos desde los detalles
        if subtotal_sin_iva == 0.0 && iva_total == 0.0
          subtotal_sin_iva += unit_price * quantity
          iva_total += iva_per_unit * quantity
        end

        data << [
          item.product&.nombre_producto || "Producto desconocido",
          quantity,
          number_to_currency(unit_price, unit: '$', delimiter: '.', separator: ','),
          number_to_currency(iva_per_unit, unit: '$', delimiter: '.', separator: ','),
          number_to_currency(line_total, unit: '$', delimiter: '.', separator: ',')
        ]
      end

      if data.size > 1
        pdf.table(data, header: true, width: pdf.bounds.width) do
          row(0).font_style = :bold
          self.header = true
          self.cell_style = { borders: [:bottom], padding: [8, 4] }
          self.row_colors = ['F0F0F0', 'FFFFFF']
        end

        pdf.move_down 20
      end

      envio = (@order.costo_de_envio.to_f > 0) ? @order.costo_de_envio.to_f : SHIPPING_COST
      # Preferir total persistido
      total = (@order.total_con_iva.present? && @order.total_con_iva.to_f > 0) ? @order.total_con_iva.to_f : (subtotal_sin_iva + iva_total + envio)

      pdf.text "Subtotal (sin IVA): #{number_to_currency(subtotal_sin_iva, unit: '$', separator: ',', delimiter: '.')}", size: 12, align: :right
      pdf.text "IVA: #{number_to_currency(iva_total, unit: '$', separator: ',', delimiter: '.')}", size: 12, align: :right
      pdf.text "Envío: #{number_to_currency(envio, unit: '$', separator: ',', delimiter: '.')}", size: 12, align: :right
      pdf.stroke_horizontal_rule
      pdf.move_down 5
      pdf.text "Total: #{number_to_currency(total, unit: '$', separator: ',', delimiter: '.')}", size: 16, style: :bold, align: :right
    end.render
  end
end
