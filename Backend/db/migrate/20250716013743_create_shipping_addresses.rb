class CreateShippingAddresses < ActiveRecord::Migration[8.0]
  def change
    create_table :shipping_addresses do |t|
      t.string :nombre, null:false, limit: 55
      t.string :apellido, null:false, limit: 55
      t.string :telefono, null:false, limit: 10
      t.string :direccion, null:false
	    t.references :neighborhood, null: false, foreign_key: true
      t.string :codigo_postal
      t.text :indicaciones_adicionales
      t.boolean :predeterminada, default: false
      t.references :user, null: true, foreign_key: true

      t.timestamps
    end
  end
end
