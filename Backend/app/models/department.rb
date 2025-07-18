class Department < ApplicationRecord
  has_many :municipalities, dependent: :destroy

  validates :nombre, presence: true, uniqueness: true
end
