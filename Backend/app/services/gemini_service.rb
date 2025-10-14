require 'faraday'
require 'json'

class GeminiService
  BASE_URL = 'https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent'

  def self.ask(prompt)
    conn = Faraday.new
    response = conn.post do |req|
      req.url BASE_URL, { key: ENV['GEMINI_API_KEY'] }
      req.headers['Content-Type'] = 'application/json'
      req.body = {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt }
            ]
          }
        ]
      }.to_json
    end
    JSON.parse(response.body)
  end
end