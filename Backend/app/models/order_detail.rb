class OrderDetail < ApplicationRecord
  belongs_to :order
  belongs_to :product

  before_validation :calcular_subtotal

  validates :cantidad, numericality: { greater_than: 0 }
  validates :precio_unitario, :subtotal, numericality: { greater_than_or_equal_to: 0 }

  def calcular_subtotal
    self.subtotal = cantidad.to_i * precio_unitario.to_f
  end
end
