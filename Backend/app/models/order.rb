class Order < ApplicationRecord
  enum :status, { pendiente: 0, pagada: 1, cancelada: 2 }
  belongs_to :user, optional: true
  has_one  :shipping_address
  belongs_to :payment_method, optional: true
  has_many :order_details, dependent: :destroy


end
