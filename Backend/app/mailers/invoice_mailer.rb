class InvoiceMailer < ApplicationMailer
  default from: ENV['GMAIL_USER']

  def enviar_factura(order)
    @order = order

    # Destinatario con fallback
    email_to = order.correo_cliente.presence || order.user&.email
    return if email_to.blank?

    # Número con fallback
    numero = order.numero_de_orden.presence || order.id

    # Generar PDF (FacturaPdf debe tolerar orden sin user/dirección)
    pdf_data = FacturaPdf.new(order).render

    # Adjuntar al correo
    attachments["Factura-#{numero}.pdf"] = pdf_data

    # Adjuntar a ActiveStorage (si tienes has_one_attached :invoice_pdf)
    begin
      order.invoice_pdf.attach(
        io: StringIO.new(pdf_data),
        filename: "Factura-#{numero}.pdf",
        content_type: "application/pdf"
      )
    rescue => e
      Rails.logger.warn "No se pudo adjuntar invoice_pdf a la orden #{order.id}: #{e.message}"
    end

    mail(to: email_to, subject: "Tu factura de compra ##{numero}")
  end
end