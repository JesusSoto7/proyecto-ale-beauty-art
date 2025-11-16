class Api::V1::InicioController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  skip_before_action :authorize_request, only: [:index]

  def index
    admin = User.with_role(:admin).first

    products = Product.with_attached_imagen
                      .includes(:discount, sub_category: :category)
                      .limit(12)
                      .order(created_at: :desc)

    categories = Category.limit(10)

    render json: {
      carousel: admin&.carousel_images&.map { |img| url_for(img) },

      products: products.as_json(
        only: [:id, :nombre_producto, :precio_producto, :slug, :stock],
        include: {
          sub_category: { only: [:id, :nombre] },
          discount: { only: [:id, :nombre, :tipo, :valor] }
        },
        methods: [:imagen_url, :precio_con_mejor_descuento]
      ),

      categories: categories.as_json(only: [:id, :nombre_categoria, :slug])
    }
  end

end
