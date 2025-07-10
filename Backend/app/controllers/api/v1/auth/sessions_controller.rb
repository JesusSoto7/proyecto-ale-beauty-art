module Api
  module V1
    module Auth
      class SessionsController < DeviseTokenAuth::SessionsController
        skip_before_action :authenticate_user!, only: [:create]
        skip_before_action :verify_authenticity_token

        include DeviseTokenAuth::Concerns::SetUserByToken
        respond_to :json

        private

        def resource_params
          params.permit(:email, :password)
        end

        def render_create_success
          render json: {
            status: 'success',
            data: resource_data(resource_json: @resource.token_validation_response)
          }, status: :ok
        end

        def render_create_error_bad_credentials
          render json: {
            status: 'error',
            message: 'Email o contraseña incorrectos'
          }, status: :unauthorized
        end
      end
    end
  end
end


