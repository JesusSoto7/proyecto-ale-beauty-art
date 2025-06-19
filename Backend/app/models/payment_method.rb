class PaymentMethod < ApplicationRecord
  has_many :orders
end
