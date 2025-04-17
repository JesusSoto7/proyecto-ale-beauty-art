class Usuario < ApplicationRecord
  belongs_to :rol
  has_many :ordenes
end
