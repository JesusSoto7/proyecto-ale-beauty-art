class Notification < ApplicationRecord
  belongs_to :user

  validates :title, presence: true
  validates :message, presence: true
end
