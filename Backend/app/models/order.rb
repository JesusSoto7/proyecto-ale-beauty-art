class Order < ApplicationRecord
  enum :status, { pendiente: 0, pagada: 1, cancelada: 2 }
  belongs_to :user, optional: true
  has_one  :shipping_address
  belongs_to :payment_method, optional: true
  has_many :order_details, dependent: :destroy
  before_create :generar_numero_de_orden

  def generar_numero_de_orden
    loop do
      self.numero_de_orden = "ORD-#{SecureRandom.hex(4).upcase}"
      break unless Order.exists?(numero_de_orden: numero_de_orden)
    end
  end

  def total_con_envio
    pago_total.to_f + costo_de_envio.to_f
  end

end
