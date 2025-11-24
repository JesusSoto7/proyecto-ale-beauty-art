class SupportMessage < ApplicationRecord
    belongs_to :order

    validates :message_text, presence: true, length: { minimum: 10 }
    validates :replied, inclusion: { in: [true, false] }

    validates :ip_address, format: {
        with: /\A(?:\d{1,3}\.){3}\d{1,3}\z/,
        message: "formato inválido"
    }, allow_blank: true
end
