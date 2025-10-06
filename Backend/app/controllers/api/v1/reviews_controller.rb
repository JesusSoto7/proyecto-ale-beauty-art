class Api::V1::ReviewsController < Api::V1::BaseController
  before_action :set_product   

  def index
    reviews = @product.reviews.includes(:user)

    render json: reviews.map { |r|
      {
        id: r.id,
        rating: r.rating,
        comentario: r.comentario,
        created_at: r.created_at,
        user: {
          id: r.user.id,
          nombre: r.user.nombre
        }
      }
    }
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