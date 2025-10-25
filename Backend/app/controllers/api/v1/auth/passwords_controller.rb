module Api
  module V1
    module Auth
      class PasswordsController < Api::V1::BaseController
        skip_before_action :authorize_request

        # POST /api/v1/auth/password/forgot
        def forgot
          # Esto usa Devise: genera token y envía el email si el usuario existe.
          User.send_reset_password_instructions(email: params[:email])

          # Por seguridad respondemos siempre igual (no revelar existencia de email)
          render json: {
            status: 'success',
            message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
          }, status: :ok
        end

        # POST /api/v1/auth/password/reset
        def reset
          resource = User.reset_password_by_token(
            reset_password_token: params[:reset_password_token],
            password: params[:password],
            password_confirmation: params[:password_confirmation]
          )

          if resource.errors.empty?
            render json: {
              status: 'success',
              message: 'Contraseña actualizada exitosamente'
            }, status: :ok
          else
            render json: {
              status: 'error',
              errors: resource.errors.full_messages
            }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end