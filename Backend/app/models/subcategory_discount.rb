class SubcategoryDiscount < ApplicationRecord
  belongs_to :sub_category
  belongs_to :discount

  validates :sub_category_id, uniqueness: { scope: :discount_id }
end
