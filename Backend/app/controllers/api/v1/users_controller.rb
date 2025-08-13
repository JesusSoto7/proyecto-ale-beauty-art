module Api
  module V1
    class UsersController < Api::V1::BaseController
      def me
        render json: current_user, only: [:id, :email, :nombre, :apellido]
      end
    end
  end
end