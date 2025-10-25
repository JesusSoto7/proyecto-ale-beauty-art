module Api
  module V1
    module Auth
      class PasswordsController < Api::V1::BaseController
        skip_before_action :authorize_request

        def forgot
          email = params[:email].to_s.strip.downcase

          # Validación básica de formato
          unless email.present? && (email =~ URI::MailTo::EMAIL_REGEXP)
            return render json: { status: 'error', message: 'Formato de correo inválido' }, status: :unprocessable_entity
          end

          # Ejemplo opcional: verificar reCAPTCHA (implementa verify_recaptcha? según tu integración)
          # unless verify_recaptcha?(params[:recaptcha_token])
          #   return render json: { status: 'error', message: 'No se pudo verificar que eres humano' }, status: :unprocessable_entity
          # end

          resource = User.send_reset_password_instructions(email: email)

          # Loguear intentos de correo no existentes (útil para monitorizar abuse)
          if resource.errors.any?
            Rails.logger.info("Password reset requested for non-existing email: #{email} (IP: #{request.remote_ip})")
          end

          # Responder siempre igual (mejor práctica de seguridad)
          render json: { status: 'success', message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' }, status: :ok
        end

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