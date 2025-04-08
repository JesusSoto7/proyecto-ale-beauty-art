class Pago < ApplicationRecord
  belongs_to :orden
  belongs_to :metodos_de_pago
end
