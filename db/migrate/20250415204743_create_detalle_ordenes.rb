class CreateDetalleOrdenes < ActiveRecord::Migration[8.0]
  def change
    create_table :detalle_ordenes do |t|
      t.references :orden, null: false, foreign_key: true
      t.references :producto, null: false, foreign_key: true
      t.references :tono, null: true, foreign_key: true
      t.integer :cantidad
      t.decimal :precioUnitario

      t.timestamps
    end
  end
end
