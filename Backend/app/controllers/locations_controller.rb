class LocationsController < ApplicationController
    def municipalities
      department_id = params[:department_id]
      municipalities = Municipality.where(department_id: department_id)
      render json: municipalities
    end

    def neighborhoods
      municipality_id = params[:municipality_id]
      neighborhoods = Neighborhood.where(municipality_id: municipality_id)
      render json: neighborhoods
    end
end
