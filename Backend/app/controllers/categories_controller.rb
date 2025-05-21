class CategoriesController < ApplicationController

  layout "home"

  def index
    @categories = Category.all
  end

  def new
    @category = Category.new
  end

  def show
    @category = Category.find(params[:id])
  end

  def edit
    @category = Category.find(params[:id])
  end

  def create
     @category = Category.new(category_params)

    respond_to do |format|
      if @category.save
        format.html { redirect_to @category, notice: "La categoria fue creada correctamente" }
        format.json { render :show, status: :created, location: @category }
        else
          format.html { render :new, status: :unprocessable_entity }
          format.json { render json: @category.errors, status: :unprocessable_entity }
        end
      end
  end

  def update
    @category = Category.find(params[:id])

    respond_to do |format|
      if @category.update(category_params)
        format.html { redirect_to @category, notice: "La categoria fue actualizada exitosamente." }
        format.json { render :show, status: :ok, location: @category }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @category.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @category = Category.find(params[:id])
    if @category.products.any?
      redirect_to categories_path, alert: "No se puede eliminar una categoría con productos asociados."
    else
      @category.destroy!
      respond_to do |format|
        format.html { redirect_to categories_path, status: :see_other, notice: "La categoria fue borrada exitosamente." }
        format.json { head :no_content }
      end
    end
  end

  private

    def category_params
      params.require(:category).permit( :nombre_categoria, :imagen)
    end
end
