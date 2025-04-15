class CreateOrdenes < ActiveRecord::Migration[8.0]
  def change
    create_table :ordenes do |t|
      t.date :fechaOrden
      t.decimal :total, precision: 10, scale: 2
      t.references :usuario, null: false, foreign_key: true

      t.timestamps
    end
  end
end
