# Monkey patch para ActiveStorage S3Service - Desactivar ACLs
Rails.application.config.to_prepare do
  # Cargar la clase S3Service si aún no está cargada
  require 'active_storage/service/s3_service' unless defined?(ActiveStorage::Service::S3Service)
  
  ActiveStorage::Service::S3Service.class_eval do
    private

    def upload_with_single_part(key, io, checksum:, content_type: nil, disposition: nil, filename: nil, custom_metadata: {}, **)
      instrument :upload, key: key, checksum: checksum do
        content_disposition = content_disposition_with(type: disposition, filename: filename) if disposition && filename

        # Opciones de upload SIN ACL
        upload_options = {
          body: io,
          content_md5: checksum,
          content_type: content_type,
          content_disposition: content_disposition,
          metadata: custom_metadata
        }.compact

        object_for(key).put(**upload_options)
      end
    end

    def upload_with_multipart(key, io, checksum:, content_type: nil, disposition: nil, filename: nil, custom_metadata: {}, **)
      content_disposition = content_disposition_with(type: disposition, filename: filename) if disposition && filename

      # Opciones de multipart upload SIN ACL
      upload_options = {
        content_type: content_type,
        content_disposition: content_disposition,
        metadata: custom_metadata
      }.compact

      object_for(key).upload_stream(**upload_options) do |write_stream|
        IO.copy_stream(io, write_stream)
      end
    end
  end
end