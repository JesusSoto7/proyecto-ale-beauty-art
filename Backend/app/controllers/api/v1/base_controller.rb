module Api
  class BaseController < ActionController::API
    include DeviseTokenAuth::Concerns::SetUserByToken
    before_action :authenticate_user!
  end
end
