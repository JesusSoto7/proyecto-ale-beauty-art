class ShippingAddress < ApplicationRecord
  belongs_to :user, optional: true
  has_many :orders

  validates :nombre, :apellido, :telefono, :direccion,
            :municipio, :barrio, presence: true

  validates :telefono, length: { is: 10 }, numericality: { only_integer: true }
  validates :indicaciones_adicionales, length: { maximum: 500 }, allow_blank: true
end
