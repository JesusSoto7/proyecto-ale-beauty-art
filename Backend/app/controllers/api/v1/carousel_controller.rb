module Api
  module V1
    class CarouselController < Api::V1::BaseController
      # Hacer pública la lectura del carrusel (index)
      skip_before_action :authorize_request, only: [:index]
      # El resto de acciones sí requieren admin
      before_action :set_admin_jwt, except: [:index]

      REDIS_KEY_PREFIX = "carousel_order:user:"

      # GET /api/v1/carousel
      # Pública: devuelve imágenes del carrusel ordenadas, sin requerir token.
      def index
        owner = carousel_owner
        return render json: [] unless owner

        attachments = owner.carousel_images.attachments

        # Orden guardado en Redis para el owner
        stored_list = fetch_order_list(owner.id) # array de strings de attachment_id
        index_map = stored_list.each_with_index.to_h

        ordered = attachments.sort_by do |att|
          sid = att.id.to_s
          if index_map.key?(sid)
            index_map[sid]
          else
            stored_list.length + att.created_at.to_i
          end
        end

        images = ordered.map do |att|
          next unless att&.blob&.image?
          {
            id: att.id,
            url: variant_url(att, width: 1280, height: 720, quality: 85)
          }
        end.compact

        # Opcional: evita caching en desarrollo
        # response.set_header('Cache-Control', 'no-store')

        render json: images
      end

      # PATCH /api/v1/carousel
      # Protegido (admin): subir nuevas imágenes
      def update
        unless params.dig(:user, :carousel_images).present?
          return render json: { errors: ["No se enviaron imágenes"] }, status: :unprocessable_entity
        end

        params[:user][:carousel_images].each do |img|
          @admin.carousel_images.attach(img)
        end

        # Agregar nuevas al final del orden
        current_order = fetch_order_list(@admin.id)
        new_ids = @admin.carousel_images.attachments.last(params[:user][:carousel_images].size).map { |a| a.id.to_s }
        save_order_list(@admin.id, current_order + new_ids)

        render json: { message: "Imágenes subidas correctamente" }, status: :ok
      end

      # PATCH /api/v1/carousel/reorder
      # Protegido (admin): { order: [attachment_id1, attachment_id2, ...] }
      def reorder
        raw_ids = params[:order]
        unless raw_ids.is_a?(Array) && raw_ids.present?
          return render json: { errors: ["Formato inválido: envía { order: [ids...] }"] }, status: :unprocessable_entity
        end

        ids = raw_ids.map { |x| x.to_s }.uniq

        user_attachment_ids = @admin.carousel_images.attachments.pluck(:id).map(&:to_s)
        missing = ids - user_attachment_ids
        if missing.any?
          return render json: {
            errors: ["IDs no pertenecen al usuario"],
            missing: missing,
            received: ids,
            owned: user_attachment_ids
          }, status: :unprocessable_entity
        end

        full_order = ids + (user_attachment_ids - ids)
        save_order_list(@admin.id, full_order)

        render json: { message: "Orden actualizado", order: full_order }, status: :ok
      end

      # DELETE /api/v1/carousel/:id
      # Protegido (admin): eliminar imagen
      def destroy
        attachment = @admin.carousel_images.attachments.find_by(id: params[:id])
        unless attachment
          return render json: { errors: ["Imagen no encontrada"] }, status: :not_found
        end

        attachment.purge_later

        current_order = fetch_order_list(@admin.id)
        new_order = current_order.reject { |x| x == attachment.id.to_s }
        save_order_list(@admin.id, new_order)

        render json: { message: "Imagen eliminada correctamente" }, status: :ok
      end

      private

      # Determina el owner público del carrusel sin requerir login.
      # 1) Usa ENV['CAROUSEL_OWNER_ID'] si está definido
      # 2) Si no, toma el primer admin que tenga imágenes
      # 3) Si no hay, toma el primer admin
      def carousel_owner
        if ENV['CAROUSEL_OWNER_ID'].present?
          user = User.find_by(id: ENV['CAROUSEL_OWNER_ID'])
          return user if user&.respond_to?(:carousel_images)
        end

        user_with_imgs = User.with_role(:admin)
                             .joins(:carousel_images_attachments)
                             .distinct
                             .first
        return user_with_imgs if user_with_imgs

        User.with_role(:admin).order(:id).first
      end

      def redis_key(user_id)
        "#{REDIS_KEY_PREFIX}#{user_id}"
      end

      def fetch_order_list(user_id)
        raw = $redis.get(redis_key(user_id))
        raw.present? ? raw.split(",") : []
      rescue => e
        Rails.logger.error("fetch_order_list error: #{e.class} #{e.message}")
        []
      end

      def save_order_list(user_id, array_ids)
        $redis.set(redis_key(user_id), array_ids.join(","))
      rescue => e
        Rails.logger.error("save_order_list error: #{e.class} #{e.message}")
      end

      def variant_url(attachment, width:, height:, quality: 85)
        variant = attachment.variant(resize_to_fill: [width, height], saver: { quality: quality }).processed
        rails_blob_url(variant, host: request.base_url, disposition: "inline")
      rescue => e
        Rails.logger.error("variant_url error: #{e.class} #{e.message}")
        rails_blob_url(attachment, host: request.base_url, disposition: "inline")
      end

      # Autorización estricta sólo para acciones de administración
      def set_admin_jwt
        @admin = @current_user
        unless @admin&.has_role?(:admin)
          render json: { errors: ["No autorizado"] }, status: :unauthorized and return
        end
      end
    end
  end
end