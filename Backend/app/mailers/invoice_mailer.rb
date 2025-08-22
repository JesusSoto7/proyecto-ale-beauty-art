class InvoiceMailer < ApplicationMailer
  default from: ENV['GMAIL_USER']

  def enviar_factura(order)
    @order = order
    
    pdf_data = FacturaPdf.new(order).render

    temp_file = Tempfile.new(["factura_#{order.id}", ".pdf"])
    temp_file.binmode
    temp_file.write(pdf_data)
    temp_file.rewind

    order.invoice_pdf.attach(
      io: temp_file,
      filename: "Factura-#{order.numero_de_orden}.pdf",
      content_type: "application/pdf"
    )

    temp_file.close
    temp_file.unlink
    
    attachments["Factura-#{order.numero_de_orden}.pdf"] = pdf_data

    mail(to: order.correo_cliente, subject: "Tu factura de compra ##{order.numero_de_orden}")
  end

end
