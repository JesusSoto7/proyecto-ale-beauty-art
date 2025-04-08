class DetalleOrden < ApplicationRecord
  belongs_to :orden
  belongs_to :producto
end
