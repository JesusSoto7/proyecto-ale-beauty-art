class PaymentMethod < ApplicationRecord
  has_many :orders

  validates :codigo, presence: true, uniqueness: true
end
