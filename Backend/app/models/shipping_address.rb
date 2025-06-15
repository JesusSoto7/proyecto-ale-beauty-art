class ShippingAddress < ApplicationRecord
  belongs_to :order
  belongs_to :user, optional: true

  validates :indicaciones_adicionales, length: { maximum: 500 }
end
