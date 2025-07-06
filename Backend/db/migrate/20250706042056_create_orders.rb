class CreateOrders < ActiveRecord::Migration[8.0]
  def change
    create_table :orders do |t|
      t.decimal :pago_total, null: false, precision: 10, scale: 2
      t.datetime :fecha_pago,  null: true
      t.string :correo_cliente, null: false
      t.integer :status, default: 0
      t.string :numero_de_orden, null: false
      t.decimal :costo_de_envio, precision: 10, scale: 2, null: true
      t.references :user, null: true, foreign_key: true
      t.references :payment_method, null: true, foreign_key: true
      t.references :shipping_address, null: false, foreign_key: true

      t.timestamps
    end

    add_index :orders, :numero_de_orden, unique: true
  end
end
