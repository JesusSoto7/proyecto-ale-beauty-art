module Api
  module V1
    module Auth
      class PasswordsController < Api::V1::BaseController
        skip_before_action :authorize_request

        # POST /api/v1/auth/password/forgot
        def forgot
          user = User.find_by(email: params[:email])
          
          if user
            # Generate password reset token
            token = user.send(:set_reset_password_token)
            
            # In a production environment, you would send an email here
            # For now, we'll return the token in the response for testing
            # UserMailer.password_reset(user, token).deliver_now
            
            render json: {
              status: 'success',
              message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña',
              # Remove this in production - only for development/testing
              reset_token: token
            }, status: :ok
          else
            # Return success even if email doesn't exist (security best practice)
            render json: {
              status: 'success',
              message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
            }, status: :ok
          end
        end

        # POST /api/v1/auth/password/reset
        def reset
          user = User.reset_password_by_token(
            reset_password_token: params[:reset_password_token],
            password: params[:password],
            password_confirmation: params[:password_confirmation]
          )

          if user.errors.empty?
            render json: {
              status: 'success',
              message: 'Contraseña actualizada exitosamente'
            }, status: :ok
          else
            render json: {
              status: 'error',
              errors: user.errors.full_messages
            }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
