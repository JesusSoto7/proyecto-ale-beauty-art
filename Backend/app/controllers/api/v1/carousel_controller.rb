# app/controllers/api/v1/carousel_controller.rb
module Api
  module V1
    class CarouselController < Api::V1::BaseController
      before_action :set_admin_jwt

      def index
        images = @admin.carousel_images.map do |img|
          {
            id: img.id,
            url: url_for(img)
          }
        end
        render json: images
      end

      # PATCH /api/v1/carousel
      # Subir nuevas imágenes al carousel
      def update
        if params[:user] && params[:user][:carousel_images]
          params[:user][:carousel_images].each do |img|
            @admin.carousel_images.attach(img)
          end
          render json: { message: "Imágenes subidas correctamente" }, status: :ok
        else
          render json: { errors: ["No se enviaron imágenes"] }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/carousel/:id
      # Eliminar una imagen específica del carousel
      def destroy
        image = @admin.carousel_images.find_by(id: params[:id])
        if image
          image.purge
          render json: { message: "Imagen eliminada correctamente" }, status: :ok
        else
          render json: { errors: ["Imagen no encontrada"] }, status: :not_found
        end
      end

      private

      
      def set_admin_jwt
        @admin = @current_user
        unless @admin.has_role?(:admin)
          render json: { errors: ["No autorizado"] }, status: :unauthorized
        end
      end
    end
  end
end
