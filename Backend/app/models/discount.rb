class Discount < ApplicationRecord
  has_many :subcategory_discounts, dependent: :destroy
  has_many :sub_categories, through: :subcategory_discounts
  has_many :products

  validates :nombre, :tipo, :valor, :fecha_inicio, presence: true
  validates :valor, numericality: { greater_than_or_equal_to: 0 }
  validates :tipo, inclusion: { in: %w[porcentaje monto_fijo] }
  validate  :validar_fechas
  validate  :tope_porcentaje

  scope :activos, -> {
    where(activo: true)
      .where("fecha_inicio <= ? AND (fecha_fin IS NULL OR fecha_fin >= ?)", Date.current, Date.current)
  }

  def validar_fechas
    return if fecha_fin.blank? || fecha_inicio.blank?
    errors.add(:fecha_fin, "debe ser mayor o igual a la fecha de inicio") if fecha_fin < fecha_inicio
  end

  def tope_porcentaje
    return unless tipo == 'porcentaje' && valor.present?
    errors.add(:valor, "no puede ser mayor a 100 para porcentaje") if valor.to_d > 100
  end

  def monto_descuento_en(precio)
    precio = precio.to_d
    case tipo
    when 'porcentaje'
      (precio * (valor.to_d / 100)).round(2)
    when 'monto_fijo'
      valor.to_d
    else
      0.to_d
    end
  end

end
