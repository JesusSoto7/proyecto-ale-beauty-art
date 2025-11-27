class OrderDetail < ApplicationRecord
  belongs_to :order
  belongs_to :product

  before_validation :calcular_subtotal

  validates :cantidad, numericality: { greater_than: 0 }
  validates :precio_unitario, :subtotal, numericality: { greater_than_or_equal_to: 0 }

  def calcular_subtotal
    unit = precio_unitario.to_f
    qty = cantidad.to_i
    # precio_unitario is stored as the unit price without IVA (sin IVA)
    self.precio_unitario_sin_iva = unit
    iva_per_unit = (product.respond_to?(:iva_amount) ? product.iva_amount(unit).to_f : (unit * 0.19))
    self.iva_por_unidad = iva_per_unit
    self.precio_unitario_con_iva = (unit + iva_per_unit)
    self.subtotal = qty * unit
    self.total_line_con_iva = qty * self.precio_unitario_con_iva.to_f
  end
end
