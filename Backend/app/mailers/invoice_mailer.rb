class InvoiceMailer < ApplicationMailer
  default from: ENV['GMAIL_USER']

  def enviar_factura(order)
    @order = order # <-- Esto es lo que falta
    attachments["Factura-#{order.numero_de_orden}.pdf"] = FacturaPdf.new(order).render
    mail(to: order.correo_cliente, subject: "Tu factura de compra ##{order.numero_de_orden}")
  end

end
