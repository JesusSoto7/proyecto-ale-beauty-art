class CartProductsController < ApplicationController
  def destroy
    cart_product = CartProduct.find(params[:id])
    cart_product.destroy
    redirect_to current_cart_path
  end
end
