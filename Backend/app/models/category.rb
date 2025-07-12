class Category < ApplicationRecord
    has_many :products, dependent: :restrict_with_exception
    has_one_attached :imagen

    validates :nombre_categoria, presence: true
    def imagen_url
        Rails.application.routes.url_helpers.url_for(imagen) if imagen.attached?
    end
end
