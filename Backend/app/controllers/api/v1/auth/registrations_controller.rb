module Api
  module V1
    class Auth::RegistrationsController < DeviseTokenAuth::RegistrationsController
      skip_before_action :authenticate_user!, only: [:create]
      skip_before_action :verify_authenticity_token
    end
  end
end
