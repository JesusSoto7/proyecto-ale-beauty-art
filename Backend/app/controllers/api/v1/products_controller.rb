class Api::V1::ProductsController < Api::V1::BaseController
  skip_before_action :authorize_request, only: [:index, :show, :novedades]
  before_action :set_product, only: [:show, :update, :destroy]

  def index
    products = Product.with_attached_imagen.includes(:discount, sub_category: :category).all
    products = products.where(sub_category_id: params[:sub_category_id]) if params[:sub_category_id].present?

    render json: products.as_json(
      include: {
        sub_category: {
          only: [:id, :nombre],
          include: { category: { only: [:id, :nombre_categoria] } }
        },
        discount: { only: [:id, :nombre, :descripcion, :tipo, :valor, :fecha_inicio, :fecha_fin, :activo] }
      },
      methods: [:slug, :imagen_url, :mejor_descuento_para_precio, :precio_con_mejor_descuento]
    ), status: :ok
  end

  def show
    render json: @product.as_json(
      include: {
        sub_category: {
          only: [:id, :nombre],
          include: { category: { only: [:id, :nombre_categoria] } }
        },
        discount: { only: [:id, :nombre, :descripcion, :tipo, :valor, :fecha_inicio, :fecha_fin, :activo] }
      },
      methods: [:imagen_url, :mejor_descuento_para_precio, :precio_con_mejor_descuento]
    ), status: :ok
  end

  def create
    @product = Product.new(product_params.except(:imagen))
    @product.imagen.attach(product_params[:imagen]) if product_params[:imagen].present?

    if @product.save
      render json: @product.as_json(
        include: {
          sub_category: {
            only: [:id, :nombre],
            include: { category: { only: [:id, :nombre_categoria] } }
          },
          discount: { only: [:id, :nombre, :descripcion, :tipo, :valor, :fecha_inicio, :fecha_fin, :activo] }
        },
        methods: [:imagen_url, :mejor_descuento_para_precio, :precio_con_mejor_descuento]
      ), status: :created
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @product.assign_attributes(product_params.except(:imagen))
    @product.imagen.attach(product_params[:imagen]) if product_params[:imagen].present?

    if @product.save
      render json: @product.as_json(
        include: {
          sub_category: {
            only: [:id, :nombre],
            include: { category: { only: [:id, :nombre_categoria] } }
          },
          discount: { only: [:id, :nombre, :descripcion, :tipo, :valor, :fecha_inicio, :fecha_fin, :activo] }
        },
        methods: [:imagen_url, :mejor_descuento_para_precio, :precio_con_mejor_descuento]
      ), status: :ok
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @product.destroy
      render json: { message: "Producto eliminado correctamente" }, status: :ok
    else
      render json: { error: "No se pudo eliminar el producto" }, status: :unprocessable_entity
    end
  end

  def can_review
    product = Product.find_by!(slug: params[:slug])

    purchased = Order.joins(:order_details)
                    .where(
                      user_id: @current_user.id,
                      order_details: { product_id: product.id },
                      status: 1 # solo pagadas
                    )
                    .exists?

    render json: { can_review: purchased }
  end

  def novedades
    @products = Product.novedades
    render json: @products.as_json(methods: [:imagen_url, :mejor_descuento_para_precio, :precio_con_mejor_descuento])
  end

  private

  def set_product
    # Prioridad: busca por id si params[:id] es numérico, si no busca por slug
    id_or_slug = params[:id] || params[:slug]

    @product = if id_or_slug.to_s =~ /^\d+$/
      Product.with_attached_imagen.includes(sub_category: :category).find_by(id: id_or_slug)
    else
      Product.with_attached_imagen.includes(sub_category: :category).find_by(slug: id_or_slug)
    end

    render json: { error: "Producto no encontrado" }, status: :not_found unless @product
  end

  def product_params
    params.require(:product).permit(
      :nombre_producto,
      :descripcion,
      :precio_producto,
      :stock,
      :sub_category_id,
      :discount_id,
      :imagen 
    )
  end
end
