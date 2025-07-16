class Neighborhood < ApplicationRecord
  belongs_to :municipality
  has_many :shipping_addresses, dependent: :destroy

validates :nombre, presence: true,
                     uniqueness: { scope: :municipality_id,
                                   message: "ya existe en este municipio" }
end
