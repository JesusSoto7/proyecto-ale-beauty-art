class InvoiceMailer < ApplicationMailer
  default from: ENV['GMAIL_USER']

  def enviar_factura(order)
    @order = order

    # Fallbacks visibles en la vista
    @numero      = @order.numero_de_orden.presence || @order.id
    @buyer_email = @order.correo_cliente.presence || @order.user&.email
    return if @buyer_email.blank?

    @buyer_name =
      if @order.user&.nombre.present? || @order.user&.apellido.present?
        [@order.user&.nombre, @order.user&.apellido].compact.join(" ")
      else
        "Cliente invitado"
      end

    addr = @order.shipping_address
    @shipping_text =
      if addr.present?
        parts = []
        parts << addr.direccion if addr.respond_to?(:direccion)
        parts << addr.neighborhood&.nombre if addr.respond_to?(:neighborhood)
        parts.compact.join(" — ").presence || "N/A"
      else
        "N/A"
      end

    # Total con fallback
    subtotal = @order.order_details.to_a.sum { |od| od.cantidad.to_i * od.precio_unitario.to_f }
    @total   = @order.pago_total.to_f.positive? ? @order.pago_total.to_f : (subtotal + @order.costo_de_envio.to_f)

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
end