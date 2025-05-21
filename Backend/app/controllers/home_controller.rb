class HomeController < ApplicationController
  before_action :authorize_admin!
  layout "home"
  def index
      @products = Product.all
  end

  def authorize_admin!
    unless current_user.has_role?(:admin)
      redirect_to inicio_path, alert: "Solo Administradores"
    end
  end
end
