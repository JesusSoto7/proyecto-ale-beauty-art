class HomeController < ApplicationController
  before_action :authorize_admin!
  layout "home"
  def index
      @products = Product.all
      @admin = User.with_role(:admin).first
  end

  def edit_carousel
    @admin = current_user
  end

  def update_carousel
    @admin = current_user
    if params[:user][:carousel_images]
      @admin.carousel_images.attach(params[:user][:carousel_images])
    end
    redirect_to edit_carousel_path
  end

  def delete_carousel_image
      @admin = current_user
      image = @admin.carousel_images.find(params[:id])
      image.purge
      redirect_to edit_carousel_path, notice: "Imagen eliminada"
  end

  def authorize_admin!
    unless current_user.has_role?(:admin)
      redirect_to inicio_path, alert: "Solo Administradores"
    end
  end
end
