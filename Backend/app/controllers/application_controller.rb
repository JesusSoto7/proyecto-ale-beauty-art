class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:nombre, :apellido])
    devise_parameter_sanitizer.permit(:account_update, keys: [:nombre, :apellido, :telefono, :direccion])
  end

  def after_sign_out_path_for(resource_or_scope)
    inicio_path
  end

  def after_sign_in_path_for(resource)
    if resource.has_role?(:admin)
      welcome_path
    elsif resource.has_role?(:cliente)
      inicio_path
    end
  end
  def show
    @user = current_user
  end
end
