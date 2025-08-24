class Api::V1::ProductsController < Api::V1::BaseController
  skip_before_action :authorize_request, only: [:index, :show]
  before_action :set_product, only: [:show, :update, :destroy]

  def index
    products = Product.with_attached_imagen.includes(:category).all
    render json: products.as_json(
      include: { category: { only: [:nombre_categoria] } },
      methods: [:slug, :imagen_url]
    ), status: :ok
  end

  def show
    render json: @product.as_json(
      include: { category: { only: [:nombre_categoria] } },
      methods: [:imagen_url]
    ), status: :ok
  end

  def create
    @product = Product.new(product_params.except(:imagen))
    @product.imagen.attach(product_params[:imagen]) if product_params[:imagen].present?

    if @product.save
      render json: @product.as_json(
        include: { category: { only: [:nombre_categoria] } },
        methods: [:imagen_url]
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
        include: { category: { only: [:nombre_categoria] } },
        methods: [:imagen_url]
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

  private

  def set_product
    @product = Product.with_attached_imagen.includes(:category).find_by(slug: params[:slug])
    render json: { error: "Producto no encontrado" }, status: :not_found unless @product
  end

  def product_params
    params.require(:product).permit(
      :nombre_producto,
      :descripcion,
      :precio_producto,
      :stock,
      :category_id,
      :imagen
    )
  end
end
