class Product < ApplicationRecord

  belongs_to :category
  has_many :cart_products, dependent: :destroy
  has_many :carts, through: :cart_products
  has_one_attached :imagen
  has_many :order_details, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorited_by, through: :favorites, source: :user
  has_many :reviews, dependent: :destroy

  validates :slug, uniqueness: true
  validates :nombre_producto, presence: true
  validates :precio_producto, numericality: { greater_than: 0 }

  
  before_validation :generate_slug, on: [:create, :update]


  def imagen_url
    Rails.application.routes.url_helpers.url_for(imagen) if imagen.attached?
  end

  def generate_slug
    base_slug = nombre_producto.parameterize
    slug_candidate = base_slug
    count = 2

    while Product.exists?(slug: slug_candidate)
      slug_candidate = "#{base_slug}-#{count}"
      count += 1
    end

    self.slug = slug_candidate
  end 
end
