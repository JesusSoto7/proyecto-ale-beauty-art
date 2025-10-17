class User < ApplicationRecord
  has_many_attached :carousel_images
  has_one :cart, dependent: :destroy
  has_many :shipping_addresses, dependent: :destroy
  has_many :orders
  has_many :favorites
  has_many :favorite_products, through: :favorites, source: :product
  has_many :reviews, dependent: :destroy
  has_many :user_notifications, dependent: :destroy
  has_many :notification_messages, through: :user_notifications

  rolify
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates :nombre, presence: true
  validates :apellido, presence: true
  validates :telefono, length: { minimum: 6 }, allow_blank: true
  after_create :assign_default_role

  def assign_default_role
    self.add_role(:cliente) if self.roles.blank?
  end
  def self.accessible_attributes
    [:nombre, :apellido, :telefono, :email]
  end
end
