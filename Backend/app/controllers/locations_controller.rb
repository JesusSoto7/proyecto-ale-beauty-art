# locations_controller.rb
class LocationsController < ApplicationController
  def municipios
    @municipios = Municipality.where(department_id: params[:department_id])
    render json: @municipios
  end

  def barrios
    @barrios = Neighborhood.where(municipality_id: params[:municipality_id])
    render json: @barrios
  end
end
