class Orden < ApplicationRecord
  belongs_to :usuario
  has_one :envio, dependent: :destroy
  has_one :pago, dependent: :destroy
  has_many :detalle_ordenes, dependent: :destroy
end
