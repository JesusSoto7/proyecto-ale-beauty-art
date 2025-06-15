class CreateOrders < ActiveRecord::Migration[8.0]
  def change
    create_table :orders do |t|
      t.decimal :pago_total, precision: 10, scale: 2
      t.datetime :fecha_pago
      t.string :correo_cliente
      t.integer :status, default: 0
      t.string :numero_de_orden
      t.references :user, null: true, foreign_key: true
      t.references :payment_method, null: true, foreign_key: true

      t.timestamps
    end

    add_index :orders, :numero_de_orden, unique: true
  end
end
