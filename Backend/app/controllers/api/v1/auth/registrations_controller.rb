require 'jwt'

module Api
  module V1
    module Auth
      class RegistrationsController < Api::V1::BaseController
        def create
          user = User.new(sign_up_params) 
          if user.save
            # Crea un carrito vacío por defecto
            Cart.create(user: user)

            payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
            token = JWT.encode(payload, Rails.application.secret_key_base)

            render json: {
              status: 'success',
              token: token,
              user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido
              }
            }, status: :created
          else
            render json: {
              status: 'error',
              errors: user.errors.full_messages
            }, status: :unprocessable_entity
          end
        end

        private

        def sign_up_params
          params.permit(
            :email,
            :password,
            :password_confirmation,
            :nombre,
            :apellido,
            :telefono
          )
        end
      end
    end
  end
end

