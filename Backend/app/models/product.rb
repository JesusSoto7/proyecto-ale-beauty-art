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
    return nil unless imagen.attached?

    # URL directa de S3 sin pasar por Rails
    bucket = ENV['AWS_BUCKET']
    region = ENV['AWS_REGION']
    key = imagen.key

    "https://#{bucket}.s3.#{region}.amazonaws.com/#{key}"
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

  # Devuelve el descuento activo (si existe) que genere mayor monto para el precio_base.
  def mejor_descuento_para_precio(precio_base = nil)
    precio_base ||= self.precio_producto
    hoy = Date.current
    candidatos = []

    # descuento propio activo (comparamos solo la parte fecha)
    if discount.present? && discount.activo
      inicio = discount.fecha_inicio.respond_to?(:to_date) ? discount.fecha_inicio.to_date : discount.fecha_inicio
      fin = discount.fecha_fin.respond_to?(:to_date) ? discount.fecha_fin.to_date : discount.fecha_fin

      if inicio && inicio <= hoy && (fin.nil? || fin >= hoy)
        candidatos << discount
      end
    end


    candidatos.uniq.max_by { |d| d.monto_descuento_en(precio_base.to_d) }
  end

  # Precio final aplicando el mejor descuento
  def precio_con_mejor_descuento(precio_base = nil)
    precio_base ||= self.precio_producto
    mejor = mejor_descuento_para_precio(precio_base)
    return precio_base.to_d unless mejor

    monto = mejor.monto_descuento_en(precio_base)
    [precio_base.to_d - monto, 0.to_d].max.round(2)
  end

  # --- IVA (impuesto) helpers ---
  # Tasa de IVA por defecto (19%). Usamos BigDecimal para precisión.
  IVA_RATE = BigDecimal('0.19')

  # Devuelve el monto de IVA para una base dada. Por defecto: precio final
  # después de aplicar el mejor descuento.
  def iva_amount(precio_base = nil)
    base = (precio_base || precio_con_mejor_descuento).to_d
    (base * IVA_RATE).round(2)
  end

  # Devuelve el precio total (base + IVA) para una base dada.
  def precio_con_iva(precio_base = nil)
    base = (precio_base || precio_con_mejor_descuento).to_d
    (base + iva_amount(base)).round(2)
  end

  # Exponer valores útiles en el JSON por defecto para consumo del frontend
  # sin cambiar serializadores existentes.
  def as_json(options = {})
    super(options).merge(
      {
        precio_sin_iva: precio_con_mejor_descuento,
        iva_amount: iva_amount,
        precio_con_iva: precio_con_iva,
        precio_producto_con_iva: precio_con_iva(precio_producto)
      }
    )
  end
end