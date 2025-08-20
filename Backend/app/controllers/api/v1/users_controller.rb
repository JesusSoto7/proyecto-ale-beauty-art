module Api
  module V1
    class UsersController < Api::V1::BaseController
      def me
        render json: current_user, only: [:id, :email, :nombre, :apellido]
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

    end
  end
end