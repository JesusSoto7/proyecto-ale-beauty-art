class DetalleOrden < ApplicationRecord
  belongs_to :orden
  belongs_to :producto
  belongs_to :tono
end
