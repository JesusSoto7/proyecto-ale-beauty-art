require 'jwt'

module Api
  module V1
    module Auth
      class SessionsController < Api::V1::BaseController

        def create
            user = User.find_by(email: params[:email])
            if user&.valid_password?(params[:password])
            payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
            token = JsonWebToken.encode(user_id: user.id)

            render json: {
              status: 'success',
              token: token,
              user: {
                id: user.id,
                email: user.email
              }
            }, status: :ok
          else
            render json: {
              status: 'error',
              message: 'Email o contraseña incorrectos'
            }, status: :unauthorized
          end
        end
      end
    end
  end
end



