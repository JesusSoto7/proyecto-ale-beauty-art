# app/controllers/api/v1/users_controller.rb

module Api
  module V1
    class UsersController < Api::V1::BaseController

      def me
        render json: current_user, only: [:id, :email, :nombre, :apellido, :telefono]
      end
      
      def update
        if current_user.update(user_params)
          render json: current_user, only: [:id, :email, :nombre, :apellido, :telefono]
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def count
        render json: { count: User.count }
      end

      def registrations_per_day
        data = User.group("DATE(created_at)")
                      .order("DATE(created_at)")
                      .count
        render json: data
      end
      
      private
      
      def user_params
        params.require(:user).permit(:nombre, :apellido, :telefono, :email)
      end
      
    end
  end
end