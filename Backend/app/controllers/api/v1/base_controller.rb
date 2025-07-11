module Api
  class BaseController < ActionController::API
    include DeviseTokenAuth::Concerns::SetUserByToken
    before_action :authenticate_user! # API usa tokens
    before_action :set_devise_token_headers

    private

    def set_devise_token_headers
      if request.headers['HTTP_ACCESS_TOKEN']
        request.headers['access-token'] = request.headers['HTTP_ACCESS_TOKEN']
        request.headers['client'] = request.headers['HTTP_CLIENT']
        request.headers['uid'] = request.headers['HTTP_UID']
      end
    end
  end
end