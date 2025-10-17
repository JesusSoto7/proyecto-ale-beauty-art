class UserNotification < ApplicationRecord
  belongs_to :user
  belongs_to :notification_message

  validates :user_id, uniqueness: { scope: :notification_message_id }
end
