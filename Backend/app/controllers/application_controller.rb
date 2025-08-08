class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?
  helper_method :current_cart
  helper_method :current_order
  before_action :set_locale
    protect_from_forgery with: :exception
  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:nombre, :apellido])
    devise_parameter_sanitizer.permit(:account_update, keys: [:nombre, :apellido, :telefono])
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

  def current_cart
    if user_signed_in?
      current_user.cart || current_user.create_cart
    else
      Cart.find_by(id: session[:cart_id]) || create_guest_cart
    end
  end

  def create_guest_cart
    cart = Cart.create
    session[:cart_id] = cart.id
    cart
  end

  def current_order
    @current_order ||= find_or_create_order
  end

  def find_or_create_order
    if session[:order_id]
      Order.find_by(id: session[:order_id]) || create_guest_order
    else
      create_guest_order
    end
  end

  def create_guest_order
    order = Order.create(user: current_user.presence, status: :pendiente)
    session[:order_id] = order.id
    order
  end
    def set_locale
      I18n.locale = params[:locale] || I18n.default_locale
    end

    def default_url_options
      { locale: I18n.locale }
    end
    
end
