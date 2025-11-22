require 'google/apis/analyticsdata_v1beta'
require 'date'
require 'set'

class Api::V1::AnalyticsController < Api::V1::BaseController
  MAX_RANGE_DAYS = 180
  
  def product_funnel_per_day
    range_option = params[:range].presence
    start_date, end_date, label =
      if range_option
        interpret_range(range_option)
      else
        interpret_start_end(params[:start_date], params[:end_date])
      end

    return unless start_date && end_date # interpret_start_end ya renderiza errores

    if (end_date - start_date).to_i + 1 > MAX_RANGE_DAYS
      return render json: { error: 'range_too_large', message: "Máximo permitido: #{MAX_RANGE_DAYS} días" }, status: :bad_request
    end

    property_id      = ENV['GA_PROPERTY_ID'].presence || "properties/508198956"
    credentials_path = ENV['GA_CREDENTIALS_PATH']
    unless credentials_path && File.exist?(credentials_path)
      return render json: { error: 'credentials_missing', message: 'GA_CREDENTIALS_PATH inválido' }, status: :internal_server_error
    end

    analyticsdata = Google::Apis::AnalyticsdataV1beta::AnalyticsDataService.new
    analyticsdata.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(credentials_path),
      scope: 'https://www.googleapis.com/auth/analytics.readonly'
    )

    date_range = Google::Apis::AnalyticsdataV1beta::DateRange.new(
      start_date: start_date.iso8601,
      end_date: end_date.iso8601
    )

    metric          = Google::Apis::AnalyticsdataV1beta::Metric.new(name: 'eventCount')
    dimension_date  = Google::Apis::AnalyticsdataV1beta::Dimension.new(name: 'date')
    dimension_event = Google::Apis::AnalyticsdataV1beta::Dimension.new(name: 'eventName')

    request = Google::Apis::AnalyticsdataV1beta::RunReportRequest.new(
      date_ranges: [date_range],
      metrics: [metric],
      dimensions: [dimension_date, dimension_event],
      dimension_filter: {
        filter: {
          field_name: "eventName",
          in_list_filter: {
            values: %w[view_item add_to_cart purchase]
          }
        }
      }
    )

    begin
      response = analyticsdata.run_property_report(property_id, request)
    rescue => e
      Rails.logger.error("GA error product_funnel_per_day: #{e.class} #{e.message}")
      return render json: { error: 'ga_error', message: e.message }, status: :bad_gateway
    end

    # Fechas completas del rango (incluye días sin datos)
    date_list = (start_date..end_date).map(&:iso8601) # ["2025-10-17", ...]
    # Estructura hash base
    events = %w[view_item add_to_cart purchase]
    values_hash = events.each_with_object({}) { |ev, h| h[ev.to_sym] = Array.new(date_list.length, 0) }

    # Índices para acceso rápido
    index_map = date_list.each_with_index.to_h # "2025-10-17" => 0, etc.

    # Procesar filas de GA
    (response.rows || []).each do |row|
      raw_date = row.dimension_values[0].value # "20251017"
      event    = row.dimension_values[1].value # "view_item"
      count    = row.metric_values[0].value.to_i

      # Convertir YYYYMMDD a ISO
      begin
        iso_date = Date.strptime(raw_date, "%Y%m%d").iso8601
      rescue
        next
      end

      next unless index_map.key?(iso_date)
      next unless values_hash.key?(event.to_sym)

      values_hash[event.to_sym][index_map[iso_date]] = count
    end

    render json: {
      start_date: start_date.iso8601,
      end_date: end_date.iso8601,
      label: label,                  # opcional para mostrar textual
      labels: date_list,             # ISO dates (el frontend luego formatea)
      values: values_hash
    }
  end

  def record_page_view
    date_key = Date.current.to_s # "2025-11-16"
    path = params[:path].presence || "unknown"

    # Key por día y por path (si quieres segmentar por ruta)
    day_key = "page_views:day:#{date_key}"
    path_day_key = "page_views:day:#{date_key}:path:#{path}"

    # Incrementos atómicos
    $redis.incr(day_key)
    $redis.incr(path_day_key)
    # Opcional: un contador total global
    $redis.incr("page_views:total")

    head :no_content
  rescue => e
    Rails.logger.error("record_page_view error: #{e.message}")
    render json: { error: "Error recording view" }, status: :internal_server_error
  end

  # GET /api/v1/analytics/page_views_per_day
  # Devuelve JSON con fechas (últimos 30 días por ejemplo) => conteo
  def page_views_per_day
    unless defined?($redis) && $redis
      Rails.logger.error("analytics#page_views_per_day: $redis no está inicializado")
      return render json: { error: "redis_unavailable", message: "$redis no inicializado" }, status: :service_unavailable
    end

    begin
      days = params[:days].to_i > 0 ? params[:days].to_i : 30
      result = {}
      days.times do |i|
        d = (Date.current - (days - 1 - i)).to_s
        key = "page_views:day:#{d}"
        count = ($redis.get(key) || 0).to_i
        result[d] = count
      end
      render json: result
    rescue => e
      Rails.logger.error("analytics#page_views_per_day error: #{e.class} #{e.message}\n#{e.backtrace.join("\n")}")
      render json: { error: e.class.to_s, message: e.message }, status: :internal_server_error
    end
  end

  def total_page_views
    unless defined?($redis) && $redis
      Rails.logger.error("analytics#total_page_views: $redis no está inicializado")
      return render json: { error: "redis_unavailable", message: "$redis no inicializado" }, status: :service_unavailable
    end

    begin
      total = ($redis.get("page_views:total") || 0).to_i
      render json: { total_page_views: total }
    rescue => e
      Rails.logger.error("analytics#total_page_views error: #{e.class} #{e.message}\n#{e.backtrace.join("\n")}")
      render json: { error: e.class.to_s, message: e.message }, status: :internal_server_error
    end
  end
=begin 
  def top_3_products
    property_id = "properties/508198956"
    credentials_path = ENV['GA_CREDENTIALS_PATH']

    analyticsdata = Google::Apis::AnalyticsdataV1beta::AnalyticsDataService.new
    analyticsdata.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(credentials_path),
      scope: 'https://www.googleapis.com/auth/analytics.readonly'
    )

    date_range = Google::Apis::AnalyticsdataV1beta::DateRange.new(start_date: '30daysAgo', end_date: 'today')
    metric = Google::Apis::AnalyticsdataV1beta::Metric.new(name: 'itemPurchaseQuantity')
    dimension_product = Google::Apis::AnalyticsdataV1beta::Dimension.new(name: 'itemName')

    request = Google::Apis::AnalyticsdataV1beta::RunReportRequest.new(
      date_ranges: [date_range],
      metrics: [metric],
      dimensions: [dimension_product]
    )

    response = analyticsdata.run_property_report(property_id, request)

    if response.rows.nil? || response.rows.empty?
      render json: { labels: [], data: [] }
      return
    end

    top_products = response.rows.map { |row|
      {
        name: row.dimension_values[0].value,
        quantity: row.metric_values[0].value.to_i
      }
    }.sort_by { |prod| -prod[:quantity] }.first(3)

    labels = top_products.map { |prod| prod[:name] }
    data = top_products.map { |prod| prod[:quantity] }

    render json: { labels: labels, data: data }
  end
=end

  private

   def interpret_start_end(start_param, end_param)
    if start_param.present? && end_param.present?
      begin
        start_d = Date.parse(start_param)
        end_d   = Date.parse(end_param)
      rescue
        render json: { error: 'invalid_date', message: 'Formato de fecha inválido (YYYY-MM-DD)' }, status: :bad_request
        return [nil, nil, nil]
      end
      if start_d > end_d
        render json: { error: 'invalid_range', message: 'start_date no puede ser mayor que end_date' }, status: :bad_request
        return [nil, nil, nil]
      end
      [start_d, end_d, "#{start_d.iso8601} - #{end_d.iso8601}"]
    else
      r = get_default_range
      [r[:start], r[:end], 'Últimos 30 días']
    end
  end

  # Interpreta el parámetro range
  def interpret_range(option)
    today = Date.current
    case option
    when 'last_7'
      [today - 6, today, 'Últimos 7 días']
    when 'this_month'
      [Date.new(today.year, today.month, 1), today, 'Este mes']
    when 'last_month'
      start_d = (Date.new(today.year, today.month, 1) << 1) # primer día mes anterior
      end_d   = (Date.new(today.year, today.month, 1) - 1)  # último día mes anterior
      [start_d, end_d, 'Mes anterior']
    when 'last_90'
      [today - 89, today, 'Últimos 90 días']
    when 'last_30'
      [today - 29, today, 'Últimos 30 días']
    else
      r = get_default_range
      [r[:start], r[:end], 'Últimos 30 días']
    end
  end

  def get_default_range
    today = Date.current
    { start: today - 29, end: today }
  end
end