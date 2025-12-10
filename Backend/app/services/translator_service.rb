require 'faraday'
require 'json'

class TranslatorService
  def initialize
    @google_key = ENV['TRANSLATE_API_KEY']
  end

  # Translate `text` into `target` locale (e.g. 'en', 'es').
  # Returns translated string or nil on error.
  def translate(text, target: 'en')
    return nil if text.blank?

    if @google_key.present?
      translate_with_google(text, target)
    else
      Rails.logger.warn('TranslatorService: No API key configurada (TRANSLATE_API_KEY)')
      nil
    end
  end

  private

  def translate_with_google(text, target)
    url = "https://translation.googleapis.com/language/translate/v2?key=#{@google_key}"

    resp = Faraday.post(
      url,
      {
        q: text,
        target: target,
        format: 'text'
      }
    )

    return nil unless resp.success?

    body = JSON.parse(resp.body)
    body.dig('data', 'translations', 0, 'translatedText')
  rescue => e
    Rails.logger.error("TranslatorService Google error: #{e.class} #{e.message}")
    nil
  end
end
