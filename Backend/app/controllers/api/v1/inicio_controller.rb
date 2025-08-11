class Api::V1::InicioController < ActionController::API

include Rails.application.routes.url_helpers

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
