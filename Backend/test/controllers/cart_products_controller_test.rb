require "test_helper"

class CartProductsControllerTest < ActionDispatch::IntegrationTest
  test "should get destroy" do
    get cart_products_destroy_url
    assert_response :success
  end
end
