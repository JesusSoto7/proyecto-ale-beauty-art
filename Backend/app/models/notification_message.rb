class NotificationMessage < ApplicationRecord
  has_many :user_notifications, dependent: :destroy

  validates :title, presence: true
  validates :message, presence: true
end
