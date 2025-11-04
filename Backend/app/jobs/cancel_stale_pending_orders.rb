class CancelStalePendingOrdersJob < ApplicationJob
  queue_as :default

  # Cancela órdenes con status: :pendiente cuyo created_at sea anterior o igual a (now - age_minutes)
  def perform(age_minutes: 30)
    cutoff = age_minutes.to_i.minutes.ago

    pending_scope = Order.where(status: Order.statuses[:pendiente])
                         .where("created_at <= ?", cutoff)

    ids = pending_scope.pluck(:id)
    Rails.logger.info "[CancelStalePendingOrdersJob] cutoff=#{cutoff} (UTC), candidates=#{ids.size}, ids=#{ids.inspect}"

    return if ids.empty?

    changed = Order.where(id: ids)
                   .update_all(status: Order.statuses[:cancelada], updated_at: Time.current)

    Rails.logger.info "[CancelStalePendingOrdersJob] updated rows=#{changed}"
  rescue => e
    Rails.logger.error "[CancelStalePendingOrdersJob] ERROR: #{e.class} - #{e.message}"
    raise
  end
end