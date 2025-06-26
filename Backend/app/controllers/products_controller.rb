class ProductsController < ApplicationController

  layout "home"

  def index
    @products = Product.all

    # Filtros por nombre
    @products = @products.where("nombre_producto LIKE ?", "%#{params[:name]}%") if params[:name].present?

    # Filtros por precio (mínimo y máximo)
    @products = @products.where("precio_producto >= ?", params[:min_price]) if params[:min_price].present?
    @products = @products.where("precio_producto <= ?", params[:max_price]) if params[:max_price].present?

    # Filtros por categoría
    @products = @products.where(category: params[:category]) if params[:category].present?
  end

  def new
    @product = Product.new
  end

  def show
    @product = Product.find(params[:id])
  end

  def showClient
    @product = Product.find_by(id: params[:id])
    render "products/showClient"
  end
  
  def action_methods
    super.add("showClient")
  end

  def edit
    @product = Product.find(params[:id])
  end

  def create
    @product = Product.new(product_params)

    respond_to do |format|
      if @product.save
        format.html { redirect_to @product, notice: "El producto fue creado correctamente" }
        format.json { render :show, status: :created, location: @product }
        else
          format.html { render :new, status: :unprocessable_entity }
          format.json { render json: @product.errors, status: :unprocessable_entity }
        end
      end

  end

  def update
    @product = Product.find(params[:id])

    respond_to do |format|
      if @product.update(product_params)
        format.html { redirect_to @product, notice: "El producto fue actualizado exitosamente." }
        format.json { render :show, status: :ok, location: @product }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @product.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @product = Product.find(params[:id])
    @product.destroy!

    respond_to do |format|
      format.html { redirect_to products_path, status: :see_other, notice: "El producto fue eliminado exitosamente." }
      format.json { head :no_content }
    end
  end

  private

    def product_params
      params.require(:product).permit(:nombre_producto, :precio_producto, :descripcion, :category_id, :stock, :imagen)
    end
end
