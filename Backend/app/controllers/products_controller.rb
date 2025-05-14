class ProductsController < ApplicationController

  def addProduct
    @product = Product.new
  end

  def create
    @product = Product.new(product_params)

    respond_to do |format|
      if @product.save
        format.html { redirect_to @product, notice: "El producto fue creado correctamente" }
        format.json { render :show, status: :created, location: @product }
        else
          format.html { render :addProduct, status: :unprocessable_entity }
          format.json { render json: @product.errors, status: :unprocessable_entity }
        end
      end

  end

  def product_params
    params.require(:product).permit(:nombre_producto, :precio_producto, :descripcion, :category_id, :stock, :imagen)
  end
end
