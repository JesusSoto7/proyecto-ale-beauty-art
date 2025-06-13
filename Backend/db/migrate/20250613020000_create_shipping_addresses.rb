class CreateShippingAddresses < ActiveRecord::Migration[8.0]
  def change
    create_table :shipping_addresses do |t|
      t.string :nombre, null:false
      t.string :apellido, null:false
      t.string :telefono, null:false
      t.string :direccion, null:false
      t.string :municipio, null:false
      t.string :barrio, null:false
      t.string :apartamento
      t.string :codigo_postal
      t.string :indicaciones_adicionales
      t.boolean :predeterminada, default: false
      t.references :order, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true

      t.timestamps
    end
  end
end
