class Orden < ApplicationRecord
  belongs_to :usuario
  has_one :envio
  has_one :pago
  has_many :detalle_ordenes
end
