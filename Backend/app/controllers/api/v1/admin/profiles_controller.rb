module Api
  module V1
    module Admin
      class ProfilesController < Api::V1::Admin::BaseController
        # Acción para obtener el perfil del administrador autenticado
        def show
          render json: current_user.as_json(only: [:id, :email, :nombre, :apellido, :telefono])
                                   .merge(roles: current_user.roles.pluck(:name))
        end

        # Acción para actualizar el perfil del administrador autenticado
        def update
          if current_user.update(profile_params)
            render json: current_user.as_json(only: [:id, :email, :nombre, :apellido, :telefono])
          else
            render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def profile_params
          params.require(:admin).permit(:nombre, :apellido, :telefono, :email)
        end
      end
    end
  end
end