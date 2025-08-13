module Api
  module V1
    class LocationsController < ActionController::API
      def departments
        render json: Department.all, status: :ok
      end

      def municipalities
        render json: Municipality.where(department_id: params[:department_id]), status: :ok
      end

      def neighborhoods
        render json: Neighborhood.where(municipality_id: params[:municipality_id]), status: :ok
      end
    end
  end
end
