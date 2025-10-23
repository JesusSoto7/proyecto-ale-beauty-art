class Api::V1::InicioController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  skip_before_action :authorize_request, only: [:index]

  def index
    # Limitar productos devueltos
    products = Product.with_attached_imagen
                    .includes(:discount, sub_category: :category)
                    .limit(12) # Solo 12 productos iniciales
                    .order(created_at: :desc)

    render json: {
      products: products.as_json(
        only: [:id, :nombre_producto, :precio_producto, :slug, :stock],
        include: {
          sub_category: { only: [:id, :nombre] },
          discount: { only: [:id, :nombre, :tipo, :valor] }
        },
        methods: [:imagen_url, :precio_con_mejor_descuento]
      ),
      categories: Category.limit(10).as_json(only: [:id, :nombre_categoria, :slug])
    }
  end
end
