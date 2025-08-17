module Api
  module V1
    class BaseController < ActionController::API
      before_action :authorize_request

      private
      
      def authorize_request
        header = request.headers['Authorization']
        Rails.logger.info "Authorization header: #{header.inspect}"
        token = header.split(' ').last if header
        Rails.logger.info "Token: #{token.inspect}"
        decoded = JsonWebToken.decode(token) rescue nil
        @current_user = User.find_by(id: decoded[:user_id]) if decoded
        unless @current_user
          Rails.logger.info "Unauthorized access"
          render json: { error: 'Not Authorized' }, status: :unauthorized
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
