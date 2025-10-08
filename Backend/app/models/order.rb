class Order < ApplicationRecord
  enum :status, { pendiente: 0, pagada: 1, cancelada: 2 }
  belongs_to :user, optional: true
  belongs_to :payment_method, optional: true
  has_many :order_details, dependent: :destroy
  before_validation :generar_numero_de_orden, on: :create
  belongs_to :shipping_address, optional: true
  has_one_attached :invoice_pdf

  validates :correo_cliente, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :numero_de_orden, presence: true, uniqueness: true
  validates :pago_total, numericality: { greater_than_or_equal_to: 0 }

  def generar_numero_de_orden
    loop do
      self.numero_de_orden = "ORD-#{SecureRandom.hex(4).upcase}"
      break unless Order.exists?(numero_de_orden: numero_de_orden)
    end
  end

  def total_con_envio
    pago_total.to_f + costo_de_envio.to_f
  end

  def direccion_envio
    shipping_address&.full_address
  end

  def tarjeta_tipo
    card_type
  end

  def tarjeta_ultimos4
    card_last4
  end

  def as_json(options = {})
    super(options).merge(
      status: self.status,
      direccion_envio: direccion_envio,
      tarjeta_tipo: tarjeta_tipo,
      tarjeta_ultimos4: tarjeta_ultimos4
    )
  end
end
