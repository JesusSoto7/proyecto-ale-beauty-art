class TranslateProductJob < ApplicationJob
  queue_as :default

  # product_id: Integer, target_locale: 'en', 'es', etc.
  def perform(product_id, target_locale)
    product = Product.find_by(id: product_id)
    return unless product

    source_text = product.descripcion.presence || product.description.presence
    return if source_text.blank?

    # Avoid overwriting manual/human edits
    existing = (product.translations || {}).dig(target_locale.to_s)
    if existing.present? && existing['human_edited'] == true
      Rails.logger.info("TranslateProductJob: skipping #{product_id} #{target_locale} because human_edited flag is set")
      return
    end

    translated = TranslatorService.new.translate(source_text, target: target_locale)
    if translated.present?
      provider = if ENV['TRANSLATE_API_KEY'].present?
        'gemini'
      else
        'unknown'
      end
      product.set_translated_description!(target_locale, translated, 'provider' => provider, 'auto' => true, 'translated_at' => Time.current)
      Rails.logger.info("TranslateProductJob: translated product #{product_id} -> #{target_locale}")
    else
      Rails.logger.warn("TranslateProductJob: translation failed for product #{product_id} -> #{target_locale}")
    end
  rescue => e
    Rails.logger.error("TranslateProductJob error for #{product_id}: #{e.class} #{e.message}")
  end
end
