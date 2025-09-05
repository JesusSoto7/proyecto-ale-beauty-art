module Api
  module V1
    module Auth
      class SessionsController < Api::V1::BaseController
       skip_before_action :authorize_request, only: [:create]

        def create
          # Si en React envías { email, password } directamente, usas params[:email] y params[:password]
          user = User.find_by(email: params[:email])
          
          if user&.valid_password?(params[:password])
            payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
            token = JWT.encode(payload, Rails.application.secret_key_base)

            render json: {
              status: 'success',
              token: token,
              user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                roles: user.roles.pluck(:name)
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
