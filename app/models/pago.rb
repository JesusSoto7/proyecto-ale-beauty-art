class Pago < ApplicationRecord
  belongs_to :orden
  belongs_to :metodo_de_pago
end
