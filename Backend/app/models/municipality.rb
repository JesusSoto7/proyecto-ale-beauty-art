class Municipality < ApplicationRecord
  belongs_to :department
  has_many :neighborhoods, dependent: :destroy

  validates :nombre, presence: true,
                     uniqueness: { scope: :department_id,
                                   message: "ya existe en este departamento" }
end
