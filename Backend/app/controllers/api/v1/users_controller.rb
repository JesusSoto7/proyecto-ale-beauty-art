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
        render json: current_user.as_json(only: [:id, :email, :nombre, :apellido, :telefono])
                                .merge(roles: current_user.roles.pluck(:name))
      end
      
    def update
      # Si es admin, puede editar a cualquiera. Si es usuario normal, solo a sí mismo.
      user = current_user.has_role?(:admin) && params[:id] ? User.find(params[:id]) : current_user

      if user.update(user_params)
        render json: user.as_json(
          only: [:id, :email, :nombre, :apellido, :telefono, :direccion]
        ).merge(
          roles: user.roles.pluck(:name)
        )
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

      def show
        user = User.includes(
          cart: { cart_products: :product },
          orders: { order_details: :product }, # 🔹 corregido aquí
          favorites: :product,
          reviews: :product
        ).find(params[:id])

        render json: user.as_json(
          only: [:id, :email, :nombre, :apellido, :telefono],
          include: {
            cart: {
              include: {
                cart_products: {
                  include: {
                    product: { only: [:id, :nombre_producto, :precio_producto] }
                  }
                }
              }
            },
            favorites: {
              include: {
                product: { only: [:id, :nombre_producto, :precio_producto] }
              }
            },
            orders: {
              include: {
                order_details: { # 🔹 corregido aquí también
                  include: {
                    product: { only: [:id, :nombre_producto, :precio_producto] }
                  }
                }
              }
            },
            reviews: {
              include: {
                product: { only: [:id, :nombre_producto] }
              }
            }
          }
        ).merge(roles: user.roles.pluck(:name))
      end



      def count
        render json: { count: User.count }
      end

      def registrations_per_day
        begin
          data = User.group_by_day(:created_at, time_zone: "America/Bogota")
                    .count

          # Manejo de datos vacíos
          if data.empty?
            Rails.logger.info "No hay registros de usuarios para mostrar."
            render json: { message: "No hay usuarios registrados disponibles.", data: {} }, status: :ok
            return
          end

          formatted_data = data.transform_keys { |date| date.iso8601 rescue nil }.compact
          render json: formatted_data
        rescue => e
          Rails.logger.error "Error en registrations_per_day: #{e.message}"
          render json: { error: "Error interno: #{e.message}" }, status: :internal_server_error
        end
      end
      
      private
      
      def user_params
        params.require(:user).permit(:nombre, :apellido, :telefono, :email)
      end
      
    end
  end
end