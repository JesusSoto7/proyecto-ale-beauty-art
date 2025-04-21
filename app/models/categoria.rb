class Categoria < ApplicationRecord
  has_many :productos, dependent: :destroy
end
