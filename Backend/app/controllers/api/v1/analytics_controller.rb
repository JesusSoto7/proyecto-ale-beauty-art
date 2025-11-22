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


  def google_page_views
    property_id = ENV['GA_PROPERTY_ID'].presence || "properties/508198956"
    credentials_path = ENV['GA_CREDENTIALS_PATH']
    
    unless credentials_path && File.exist?(credentials_path)
      return render json: { error: 'credentials_missing', message: 'GA_CREDENTIALS_PATH inválido' }, status: :internal_server_error
    end

    analyticsdata = Google::Apis::AnalyticsdataV1beta::AnalyticsDataService.new
    analyticsdata.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(credentials_path),
      scope: 'https://www.googleapis.com/auth/analytics.readonly'
    )

    # Rango de fechas ajustado para incluir la fecha de hoy
    date_range = Google::Apis::AnalyticsdataV1beta::DateRange.new(
      start_date: (Date.current - 29).iso8601, # Últimos 30 días contando la fecha actual
      end_date: Date.current.iso8601
    )

    metric = Google::Apis::AnalyticsdataV1beta::Metric.new(name: 'screenPageViews')
    dimension_date = Google::Apis::AnalyticsdataV1beta::Dimension.new(name: 'date')
    request = Google::Apis::AnalyticsdataV1beta::RunReportRequest.new(
      date_ranges: [date_range],
      metrics: [metric],
      dimensions: [dimension_date]
    )

    begin
      response = analyticsdata.run_property_report(property_id, request)
    rescue => e
      Rails.logger.error("GA error google_page_views: #{e.class} #{e.message}")
      return render json: { error: e.message }, status: :bad_gateway
    end

    # Procesar resultados para el frontend
    labels = []
    values = []

    (response.rows || []).each do |row|
      labels << Date.parse(row.dimension_values[0].value).strftime("%b %d")
      values << row.metric_values[0].value.to_i
    end

    render json: { labels: labels, values: values }
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