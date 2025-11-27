class InvoiceMailer < ApplicationMailer
  default from: ENV['GMAIL_USER']

  def enviar_factura(order, overrides = {})
    @order = order

    @numero      = @order.numero_de_orden.presence || @order.id
    @buyer_email = @order.correo_cliente.presence || @order.user&.email
    return if @buyer_email.blank?

    @buyer_name =
      overrides[:buyer_name].presence ||
      [@order.user&.nombre, @order.user&.apellido].compact.join(" ").presence ||
      "Cliente invitado"

    @buyer_phone =
      overrides[:buyer_phone].presence ||
      safe_attr(@order.user, :telefono, :phone)

    @buyer_address =
      overrides[:buyer_address].presence ||
      safe_attr(@order&.shipping_address, :direccion) ||
      safe_attr(@order.user, :address, :direccion)

    # Preferir campos persistidos en la orden; si faltan, calcular como fallback.
    if @order.subtotal_sin_iva.present? && @order.iva_total.present?
      @subtotal_sin_iva = @order.subtotal_sin_iva.to_f
      @iva_total = @order.iva_total.to_f
    else
      # Fallback: calcular desde detalles
      @subtotal_sin_iva = @order.order_details.to_a.sum { |od| od.cantidad.to_i * od.precio_unitario.to_f }
      @iva_total = @order.order_details.to_a.sum do |od|
        unit_price = (od.precio_unitario_sin_iva.present? ? od.precio_unitario_sin_iva.to_f : od.precio_unitario.to_f)
        qty = od.cantidad.to_i
        iva_per_unit = od.iva_por_unidad.present? ? od.iva_por_unidad.to_f : (od.product.respond_to?(:iva_amount) ? od.product.iva_amount(unit_price).to_f : (unit_price * 0.19))
        (iva_per_unit * qty)
      end
    end

    @envio = @order.costo_de_envio.to_f
    # Preferir total persistido en la orden, si existe
    @total = (@order.total_con_iva.present? && @order.total_con_iva.to_f > 0) ? @order.total_con_iva.to_f : (@subtotal_sin_iva + @iva_total + @envio)

    # Generar PDF (si falla, enviamos sin adjunto)
    pdf_data = nil
    begin
      pdf_data = FacturaPdf.new(@order).render
    rescue => e
      Rails.logger.warn "FacturaPdf falló para order #{@order.id}: #{e.message}"
    end

    attachments["Factura-#{@numero}.pdf"] = pdf_data if pdf_data
    if pdf_data
      begin
        @order.invoice_pdf.attach(
          io: StringIO.new(pdf_data),
          filename: "Factura-#{@numero}.pdf",
          content_type: "application/pdf"
        )
      rescue => e
        Rails.logger.warn "No se pudo adjuntar invoice_pdf a la orden #{@order.id}: #{e.message}"
      end
    end

    mail(to: @buyer_email, subject: "Tu factura de compra ##{@numero}")
  end

  private

  # Devuelve el primer atributo presente que el objeto soporte (evita NoMethodError)
  def safe_attr(obj, *candidates)
    return nil unless obj
    candidates.each do |attr|
      next unless obj.respond_to?(attr)
      val = obj.public_send(attr)
      return val if val.present?
    end
    nil
  end
end