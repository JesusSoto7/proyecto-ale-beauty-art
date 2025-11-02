module Api
  module V1
    class BaseController < ActionController::API
      before_action :authorize_request

      private

      def authorize_request
        header = request.headers['Authorization']
        Rails.logger.info "Authorization header: #{header.inspect}"

        token = header.to_s.split(' ').last
        Rails.logger.info "Token: #{token.present? ? '[present]' : '[missing]'}"

        begin
          decoded = JsonWebToken.decode(token) # puede lanzar excepciones
          user_id = decoded[:user_id] || decoded['user_id']
          @current_user = User.find_by(id: user_id)

          unless @current_user
            Rails.logger.info "Unauthorized: user not found (id=#{user_id.inspect})"
            render json: { error: 'Not Authorized' }, status: :unauthorized and return
          end
        rescue JWT::ExpiredSignature
          render json: { error: 'Token has expired' }, status: :unauthorized and return
        rescue JWT::DecodeError, ArgumentError
          render json: { error: 'Invalid token' }, status: :unauthorized and return
        end
      end

      def current_user
        @current_user
      end

      def current_cart
        @current_cart ||= current_user.cart || current_user.create_cart
      end
    end
  end
end