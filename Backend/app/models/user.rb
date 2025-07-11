class User < ApplicationRecord
  has_many_attached :carousel_images
  has_one :cart, dependent: :destroy
  has_many :shipping_addresses
  has_many :orders


  rolify
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
         
  include DeviseTokenAuth::Concerns::User
  
  # Generar token para API automáticamente al crear usuario
  after_create :generate_api_tokens

  private

  def generate_api_tokens
    # Esto crea un token válido para la API
    self.create_new_auth_token
  end
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
