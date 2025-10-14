require 'google/apis/analyticsdata_v1beta'
require 'date'
require 'set'

class Api::V1::AnalyticsController < Api::V1::BaseController
  def product_funnel_per_day
    property_id = "properties/508198956"
    credentials_path = ENV['GA_CREDENTIALS_PATH']

    analyticsdata = Google::Apis::AnalyticsdataV1beta::AnalyticsDataService.new
    analyticsdata.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(credentials_path),
      scope: 'https://www.googleapis.com/auth/analytics.readonly'
    )

    date_range = Google::Apis::AnalyticsdataV1beta::DateRange.new(start_date: '30daysAgo', end_date: 'today')
    metric = Google::Apis::AnalyticsdataV1beta::Metric.new(name: 'eventCount')
    dimension_date = Google::Apis::AnalyticsdataV1beta::Dimension.new(name: 'date')
    dimension_event = Google::Apis::AnalyticsdataV1beta::Dimension.new(name: 'eventName')

    # Solo trae los eventos del embudo
    request = Google::Apis::AnalyticsdataV1beta::RunReportRequest.new(
      date_ranges: [date_range],
      metrics: [metric],
      dimensions: [dimension_date, dimension_event],
      dimension_filter: {
        filter: {
          field_name: "eventName",
          in_list_filter: {
            values: ["view_item", "add_to_cart", "purchase"]
          }
        }
      }
    )

    response = analyticsdata.run_property_report(property_id, request)

    date_set = Set.new
    response.rows.each do |row|
      date_set << row.dimension_values[0].value
    end
    labels = date_set.to_a.sort.map { |d| Date.strptime(d, "%Y%m%d").strftime("%b %d") }

    # Inicializa arrays para cada evento
    values = {
      view_item: Array.new(labels.length, 0),
      add_to_cart: Array.new(labels.length, 0),
      purchase: Array.new(labels.length, 0)
    }

    response.rows.each do |row|
      date = row.dimension_values[0].value
      event = row.dimension_values[1].value
      event_count = row.metric_values[0].value.to_i
      date_label = Date.strptime(date, "%Y%m%d").strftime("%b %d")
      date_index = labels.index(date_label)
      values[event.to_sym][date_index] = event_count if values.key?(event.to_sym)
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

end