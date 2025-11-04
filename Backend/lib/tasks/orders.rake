namespace :orders do
  desc "Cancela órdenes pendientes antiguas (basado en created_at, sin columnas extra)"
  task cancel_stale: :environment do
    minutes = ENV.fetch("STALE_PENDING_MINUTES", "30").to_i
    puts "[orders:cancel_stale] Running in #{Rails.env} with STALE_PENDING_MINUTES=#{minutes}"
    CancelStalePendingOrdersJob.perform_now(age_minutes: minutes)
    puts "[orders:cancel_stale] done"
  end
end