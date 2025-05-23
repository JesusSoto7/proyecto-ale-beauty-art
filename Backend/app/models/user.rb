class User < ApplicationRecord
  has_many_attached :carousel_images

  rolify
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates :nombre, presence: true
  validates :apellido, presence: true

  after_create :assign_default_role

  def assign_default_role
    self.add_role(:cliente) if self.roles.blank?
  end
end
