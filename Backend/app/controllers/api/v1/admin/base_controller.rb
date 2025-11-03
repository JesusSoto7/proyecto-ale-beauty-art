module Api
  module V1
    module Admin
      class BaseController < Api::V1::BaseController
        before_action :require_admin!

        private

        def require_admin!
          render json: { error: 'Forbidden' }, status: :forbidden unless current_user&.has_role?(:admin)
        end
      end
    end
  end
end