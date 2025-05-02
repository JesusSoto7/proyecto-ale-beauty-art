class InicioController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index]
  layout "inicio"
  def index
  end
end
