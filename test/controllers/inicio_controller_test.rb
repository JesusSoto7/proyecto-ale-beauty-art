require "test_helper"

class InicioControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get inicio_index_url
    assert_response :success
  end
end
