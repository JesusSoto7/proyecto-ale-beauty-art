class Api::V1::ProductsController < Api::V1::BaseController
  before_action :set_product, only: [:show, :update, :destroy]

  def index
    products = Product.with_attached_imagen.includes(:category).all
    render json: products.as_json(
      include: {
        category: { only: [:nombre_categoria] }
      },
      methods: [:imagen_url]
    ), status: :ok
  end

  def show
    render json: @product.as_json(
      include: {
        category: { only: [:nombre_categoria] }
      },
      methods: [:imagen_url]
    ), status: :ok
  end

  # POST /products
  def create
    @product = Product.new(product_params)
    attach_image

    if @product.save
      render json: @product.as_json(
        include: {
          category: { only: [:nombre_categoria] }
        },
        methods: [:imagen_url]
      ), status: :created
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /products/:id
  def update
    @product.assign_attributes(product_params)
    attach_image

    if @product.save
      render json: @product.as_json(
        include: {
          category: { only: [:nombre_categoria] }
        },
        methods: [:imagen_url]
      ), status: :ok
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /products/:id
  def destroy
    @product.destroy
    head :no_content
  end

  private

  def set_product
    @product = Product.with_attached_imagen.includes(:category).find_by(id: params[:id])
    unless @product
      render json: { error: "Producto no encontrado" }, status: :not_found
    end
  end

  def product_params
    params.permit(:nombre_producto,:precio_producto,  :descripcion, :category_id, :stock,)
  end

  def attach_image
    if params[:imagen].present?
      @product.imagen.attach(params[:imagen])
    end
  end
end
