require "test_helper"

class CategoriesControllerTest < ActionDispatch::IntegrationTest
  test "should get addCategory" do
    get categories_addCategory_url
    assert_response :success
  end

  test "should get create" do
    get categories_create_url
    assert_response :success
  end
end
