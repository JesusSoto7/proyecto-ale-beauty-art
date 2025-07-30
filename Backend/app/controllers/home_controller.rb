class HomeController < ApplicationController
  before_action :authorize_admin!
  layout "home"
  def index
      @products = Product.all
      @admin = User.with_role(:admin).first

      @productos_por_categoria = Product.joins(:category).group("categories.nombre_categoria").count
      @ventas_por_dia = Order.where(status: :pagada)
        .where(created_at: Time.current.beginning_of_month..Time.current.end_of_month)
        .group_by_day(:created_at, format: "%Y-%m-%d", time_zone: "Bogota")
        .sum(:pago_total)

      # Convertir Time a Date para poder iterar
      inicio = Time.current.beginning_of_month.to_date
      fin = Time.current.end_of_month.to_date

      (inicio..fin).each do |dia|
        dia_str = dia.strftime("%Y-%m-%d")
        @ventas_por_dia[dia_str] ||= 0
      end

      @total_ventas = @ventas_por_dia.values.sum


      @productos_vendidos_por_categoria = OrderDetail.joins(product: :category)
                                          .joins(:order)
                                          .where(orders: { status: :pagada })
                                          .group("categories.nombre_categoria")
                                          .sum("order_details.cantidad")
  end

  def edit_carousel
    @admin = current_user
  end

  def update_carousel
    @admin = current_user
    if params[:user][:carousel_images]
      @admin.carousel_images.attach(params[:user][:carousel_images])
    end
    redirect_to edit_carousel_path, notice: "Carrusel actualizado"
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
