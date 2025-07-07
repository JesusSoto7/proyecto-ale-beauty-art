class ShippingAddress < ApplicationRecord
  belongs_to :user, optional: true
  has_many :orders

  before_validation :predeterminada_si_esta_primero
  before_save :quitar_anteriores_si_esta_predeterminada

  validates :nombre, :apellido, :telefono, :direccion,
            :municipio, :barrio, presence: true

  validates :telefono, length: { is: 10 }, numericality: { only_integer: true }
  validates :indicaciones_adicionales, length: { maximum: 500 }, allow_blank: true

  def predeterminada_si_esta_primero
    if user.present? && user.shipping_addresses.where(predeterminada: true).empty?
      self.predeterminada = true
    end
  end

  def quitar_anteriores_si_esta_predeterminada
    return unless predeterminada? && user_id? && will_save_change_to_predeterminada?

    ShippingAddress.where(user_id: user_id).where.not(id: id).update_all(predeterminada: false)
  end
end
