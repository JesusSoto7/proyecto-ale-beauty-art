require 'redis'

begin
  redis_url = ENV.fetch("REDIS_URL", "redis://localhost:6379/0")
  $redis = Redis.new(url: redis_url)
  # testear conexión básica sin lanzar excepción en boot
  begin
    $redis.ping
    Rails.logger.info("[redis] connected to #{redis_url}")
  rescue => e
    Rails.logger.error("[redis] warning: could not ping redis at #{redis_url}: #{e.class} #{e.message}")
    # mantenemos $redis para intentar usarlo (podría ser nil)
  end
rescue => e
  Rails.logger.error("[redis] initializer failed: #{e.class} #{e.message}\n#{e.backtrace.join("\n")}")
  # no lanzar más aquí para que Rails siga arrancando
  $redis = nil
end