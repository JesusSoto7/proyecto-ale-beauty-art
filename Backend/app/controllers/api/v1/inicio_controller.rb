class Api::V1::InicioController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  skip_before_action :authorize_request, only: [:index]

  def index
    admin = User.with_role(:admin).first
    products = Product.all
    categories = Category.all

    render json: {
      admin_carousel: admin&.carousel_images&.map { |img| url_for(img) },
      products: products.map { |p|
        p.as_json.merge(imagen_url: p.imagen.attached? ? url_for(p.imagen) : nil)
      },
      categories: categories.map { |c|
        c.as_json.merge(imagen_url: c.imagen.attached? ? url_for(c.imagen) : nil)
      }
    }
  end
end
