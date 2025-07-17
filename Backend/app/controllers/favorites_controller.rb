class FavoritesController < ApplicationController
  before_action :authenticate_user!

  def modal_favorites
    favorite_products = current_user.favorite_products
    render partial: 'favorites/modal_favorites', locals: { favorite_products: favorite_products }
  end

  def create
    @favorite = current_user.favorites.find_or_create_by(product_id: params[:product_id])
    respond_to do |format|
      format.html { redirect_back fallback_location: inicio_path }
      format.json { render json: { success: true, product_id: @favorite.product_id } }
    end
  end


  def destroy
    @favorite = current_user.favorites.find_by(product_id: params[:product_id])
    @favorite&.destroy
    respond_to do |format|
      format.json { render json: { success: true, product_id: params[:product_id] } }
    end
  end

end
