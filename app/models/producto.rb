class Producto < ApplicationRecord
  belongs_to :categoria
  has_many :detalle_ordenes
  has_many :tonos
end
