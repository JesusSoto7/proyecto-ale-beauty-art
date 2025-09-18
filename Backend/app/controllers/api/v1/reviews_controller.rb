class Api::V1::ReviewsController < Api::V1::BaseController
  before_action :set_product   

  def index
    render json: @product.reviews.includes(:user)
  end

  def create
    review = @product.reviews.new(review_params)
    review.user = current_user
    if review.save
      render json: review, status: :created
    else
      render json: review.errors, status: :unprocessable_entity
    end
  end

  private

  def set_product
    @product = Product.find_by!(slug: params[:product_slug])
  end

  def review_params
    params.require(:review).permit(:rating, :comentario)
  end
end