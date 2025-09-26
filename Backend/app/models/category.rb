class Category < ApplicationRecord
    has_many :sub_categories, dependent: :restrict_with_exception
    has_many :products, through: :sub_categories
    has_one_attached :imagen

    validates :nombre_categoria, presence: true

    before_validation :generate_slug, on: [:create, :update]
    
    def imagen_url
        Rails.application.routes.url_helpers.url_for(imagen) if imagen.attached?
    end

    def generate_slug
        base_slug = nombre_categoria.parameterize
        slug_candidate = base_slug
        count = 2

        while Category.exists?(slug: slug_candidate)
        slug_candidate = "#{base_slug}-#{count}"
        count += 1
        end

        self.slug = slug_candidate
    end 
end
