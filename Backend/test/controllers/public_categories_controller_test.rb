require "test_helper"

class PublicCategoriesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get public_categories_index_url
    assert_response :success
  end

  test "should get show" do
    get public_categories_show_url
    assert_response :success
  end
end
