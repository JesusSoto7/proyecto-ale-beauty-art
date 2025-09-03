# app/controllers/api/v1/favorites_controller.rb
class Api::V1::FavoritesController < Api::V1::BaseController
  before_action :set_product, only: [:create]
  
  def index
    favorites = current_user.favorites.includes(:product)
    render json: favorites.map { |f|
      {
        id: f.product.id,
        slug: f.product.slug,
        nombre_producto: f.product.nombre_producto,
        precio_producto: f.product.precio_producto,
        stock: f.product.stock,
        imagen_url: f.product.imagen.attached? ? url_for(f.product.imagen) : nil,
        categoria: f.product.category&.nombre_categoria,
        fecha_agregado: f.product.created_at.strftime("%Y-%m-%d")
      }
    }
  end

  
  def create
    favorite = current_user.favorites.find_or_create_by(product: @product)
    render json: { success: true, favorite: favorite }, status: :created
  end

  def destroy
    favorite = current_user.favorites.find_by(product_id: params[:id])
    if favorite&.destroy
      render json: { success: true }
    else
      render json: { success: false }, status: :unprocessable_entity
    end
  end

  private

  def set_product
    @product = Product.find(params[:product_id])
  end
end
