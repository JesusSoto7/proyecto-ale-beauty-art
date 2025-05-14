class Category < ApplicationRecord
    has_many :products, dependent: :restrict_with_exception
    has_one_attached :imagen
end
