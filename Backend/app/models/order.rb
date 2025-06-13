class Order < ApplicationRecord
  belongs_to :user, optional: true
  has_one  :shipping_address
  belongs_to :payment_method, optional: true
end
