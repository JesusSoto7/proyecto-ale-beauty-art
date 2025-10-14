module Api
  module V1
    class UsersController < Api::V1::BaseController
      
      def index
        users = User.includes(:roles)
        render json: users.map { |user| 
          user.as_json(only: [:id, :email, :nombre, :apellido, :telefono]).merge(
            roles: user.roles.pluck(:name)
          )
        }
      end

      def me
        render json: current_user, only: [:id, :email, :nombre, :apellido, :telefono]
      end
      
      def update
        # Si es admin y se pasa id, puede editar a cualquier usuario. Si es cliente, solo a sí mismo.
        user = current_user.has_role?(:admin) && params[:id] ? User.find(params[:id]) : current_user

        if user.update(user_params)
          render json: user, only: [:id, :email, :nombre, :apellido, :telefono]
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        # Solo admin puede eliminar a cualquier usuario
        unless current_user.has_role?(:admin)
          return render json: { error: "No autorizado" }, status: :forbidden
        end

        user = User.find(params[:id])

        if user.destroy
          render json: { message: "Usuario eliminado correctamente." }, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
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