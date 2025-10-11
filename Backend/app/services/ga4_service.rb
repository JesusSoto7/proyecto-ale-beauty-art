# app/services/ga4_service.rb
require 'net/http'
require 'uri'
require 'json'

class Ga4Service
  MEASUREMENT_ID = ENV.fetch('GA4_MEASUREMENT_ID', nil)
  API_SECRET = ENV.fetch('GA4_API_SECRET', nil)

  def self.send_event(user_id:, event_name:, params: {})
    return if MEASUREMENT_ID.blank? || API_SECRET.blank?

    uri = URI("https://www.google-analytics.com/mp/collect?measurement_id=#{MEASUREMENT_ID}&api_secret=#{API_SECRET}")

    body = {
      client_id: user_id || SecureRandom.uuid,
      events: [
        {
          name: event_name,
          params: params
        }
      ]
    }

    Net::HTTP.post(uri, body.to_json, "Content-Type" => "application/json")
  end
end
