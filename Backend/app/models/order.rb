class Order < ApplicationRecord
  after_update :reducir_stock_si_pagada
  before_save :calcular_totales
  
  enum :status, {
    pendiente: 0,
    pagada:    1,
    cancelada: 2,
    preparando: 3,
    enviado:    4,
    entregado:  5
  }
  belongs_to :user, optional: true
  belongs_to :payment_method, optional: true
  has_many :order_details, dependent: :destroy
  has_many :support_messages, dependent: :destroy
  before_validation :generar_numero_de_orden, on: :create
  belongs_to :shipping_address, optional: true
  has_one_attached :invoice_pdf

  scope :pendientes, -> { where(status: :pendiente) }
  scope :pendientes_recientes, ->(minutes = 30) { pendientes.where("created_at > ?", minutes.minutes.ago) }
  scope :pendientes_antiguas, ->(minutes = 30) { pendientes.where("created_at <= ?", minutes.minutes.ago) }
  
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

  private

  def reducir_stock_si_pagada
    return unless saved_change_to_status? && status == "pagada"

    order_details.includes(:product).each do |detail|
      product = detail.product

      if product.stock >= detail.cantidad
        product.update(stock: product.stock - detail.cantidad)
      else
        Rails.logger.warn "Stock insuficiente para producto: #{product.nombre_producto} (ID: #{product.id})"
      end
    end
  end

  def calcular_totales
    # Recalcula subtotal_sin_iva, iva_total y total_con_iva a partir de order_details
    subtotal = order_details.to_a.sum { |d| d.subtotal.to_f }
    iva = order_details.to_a.sum { |d| (d.iva_por_unidad || d.precio_unitario.to_f * 0.19).to_f * d.cantidad.to_i }
    envio = costo_de_envio.to_f
    self.subtotal_sin_iva = subtotal
    self.iva_total = iva
    self.total_con_iva = (subtotal + iva + envio).to_f
    # Mantener pago_total compatible: si no hay pago_total, no lo tocamos; al confirmar pago el controller actualizará pago_total
  end
end
