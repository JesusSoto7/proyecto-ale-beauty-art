class CategoriesController < ApplicationController
  def addCategory
    @category = Category.new
  end

  def create
     @category = Category.new(category_params)

    respond_to do |format|
      if @category.save
        format.html { redirect_to @category, notice: "La categoria fue creada correctamente" }
        format.json { render :show, status: :created, location: @category }
        else
          format.html { render :addCategory, status: :unprocessable_entity }
          format.json { render json: @category.errors, status: :unprocessable_entity }
        end
      end
  end

  def category_params
    params.require(:category).permit( :nombre_categoria, :imagen)
  end
end
