class ShippingAddress < ApplicationRecord
  belongs_to :order
  belongs_to :user, optional: true

  validates :indicaciones_adicionales, length: { maximum: 500 }
  validates :nombre, presence: true
  validates :apellido, presence: true
  validates :telefono, presence: true
  validates :direccion, presence: true
  validates :municipio, presence: true
  validates :barrio, presence: true
end
