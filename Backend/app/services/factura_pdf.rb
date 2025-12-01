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
      pdf.text "Detalle de orden #{@order.numero_de_orden}", size: 24, style: :bold, align: :center
      pdf.move_down 10

      pdf.stroke_horizontal_rule
      pdf.move_down 10
      pdf.text "Cliente: #{@order.correo_cliente}", size: 12
      pdf.text "Fecha: #{@order.created_at.in_time_zone('Bogota').strftime('%d/%m/%Y')}", size: 12
      pdf.text "Número de orden: #{@order.numero_de_orden}", size: 12
      pdf.move_down 10
      pdf.stroke_horizontal_rule
      pdf.move_down 20

      subtotal = 0

      if @order.order_details.any?
        data = [["Producto", "Cantidad", "Precio unitario", "Subtotal"]]
        @order.order_details.each do |item|
          unit_price = item.precio_unitario || 0
          quantity   = item.cantidad || 0
          line_total = unit_price * quantity
          subtotal  += line_total

          data << [
            item.product&.nombre_producto || "Producto desconocido",
            quantity,
            number_to_currency(unit_price, unit: '$', delimiter: '.', separator: ','),
            number_to_currency(line_total, unit: '$', delimiter: '.', separator: ',')
          ]
        end

        pdf.table(data, header: true, width: pdf.bounds.width) do
          row(0).font_style = :bold
          self.header = true
          self.cell_style = { borders: [:bottom], padding: [8, 4] }
          self.row_colors = ['F0F0F0', 'FFFFFF']
        end

        pdf.move_down 20
      end

      total_con_envio = subtotal + SHIPPING_COST

      pdf.text "Subtotal: #{number_to_currency(subtotal, unit: '$', separator: ',', delimiter: '.')}", size: 12, align: :right
      pdf.text "Envío: #{number_to_currency(SHIPPING_COST, unit: '$', separator: ',', delimiter: '.')}", size: 12, align: :right
      pdf.stroke_horizontal_rule
      pdf.move_down 5
      pdf.text "Total: #{number_to_currency(total_con_envio, unit: '$', separator: ',', delimiter: '.')}", size: 16, style: :bold, align: :right
    end.render
  end
end
