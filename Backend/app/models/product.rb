class Product < ApplicationRecord

  belongs_to :sub_category
  belongs_to :discount, optional: true
  has_one :category, through: :sub_category
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
  
  scope :novedades, -> { order(created_at: :desc).limit(10) }

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


  def mejor_descuento_para_precio(precio_base)
    ahora = Time.current
    candidatos = []

    # descuento propio activo
    if discount.present? && discount.activo && discount.fecha_inicio <= ahora && (discount.fecha_fin.nil? || discount.fecha_fin >= ahora)
      candidatos << discount
    end

    # descuentos activos de la subcategoría
    if sub_category_id.present?
      sub_descuentos = Discount.joins(:subcategory_discounts)
                              .where(subcategory_discounts: { sub_category_id: sub_category_id })
                              .merge(Discount.activos)
      candidatos.concat(sub_descuentos)
    end

    candidatos.uniq.max_by { |d| d.monto_descuento_en(precio_base.to_d) }
  end

  # Precio final aplicando el mejor descuento
  def precio_con_mejor_descuento(precio_base)
    mejor = mejor_descuento_para_precio(precio_base)
    return precio_base.to_d unless mejor

    monto = mejor.monto_descuento_en(precio_base)
    [precio_base.to_d - monto, 0.to_d].max.round(2)
  end
end
