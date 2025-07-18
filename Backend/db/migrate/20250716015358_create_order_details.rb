class CreateOrderDetails < ActiveRecord::Migration[8.0]
  def change
    create_table :order_details do |t|
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :cantidad, null: false
      t.decimal :precio_unitario, precision: 10, scale: 2, null: false
      t.decimal :subtotal, precision: 10, scale: 2, null: false

      t.timestamps
    end
  end
end
