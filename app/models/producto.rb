class Producto < ApplicationRecord
  belongs_to :categoria
  has_many :detalle_ordenes, dependent: :destroy
  has_many :tonos, dependent: :destroy
end
