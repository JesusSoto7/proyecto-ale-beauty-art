class SubCategory < ApplicationRecord
  belongs_to :category
  has_many :products, dependent: :destroy

  has_one_attached :imagen
  
  validates :nombre, presence: true
  
  before_validation :generate_slug, on: [:create, :update]
  

  def imagen_url
    return nil unless imagen.attached?
    
    bucket = ENV['AWS_BUCKET']
    region = ENV['AWS_REGION']
    key = imagen.key
    
    "https://#{bucket}.s3.#{region}.amazonaws.com/#{key}"
  end

  def generate_slug
    base_slug = nombre.parameterize
    slug_candidate = base_slug
    count = 2

    while SubCategory.exists?(slug: slug_candidate)
      slug_candidate = "#{base_slug}-#{count}"
      count += 1
    end

    self.slug = slug_candidate
  end 
end